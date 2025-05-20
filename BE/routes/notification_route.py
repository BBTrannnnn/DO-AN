from flask import Blueprint, jsonify, request
from datetime import datetime
from models import db
from models.employees import Employee
from models.attendances import Attendance
from models.notification import Notification
from models.payrolls import Payroll
from routes.decorators import role_required
# -*- coding: utf-8 -*-

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/generate', methods=['POST'])
@role_required('Admin')
def generate_notifications():
    today = datetime.today().date()
    count = 0

    employees = Employee.query.all()

    for emp in employees:
        # --- THÔNG BÁO KỶ NIỆM LÀM VIỆC ---
        if emp.working_status:
            working_years = (today - emp.working_status).days // 365
            if working_years in [1, 5, 10]:
                message = f"🎉✨ Chúc mừng {emp.name} đã làm việc {working_years} năm tại công ty! 🥳👏"
                notification = Notification(employee_id=emp.id, message=message)
                db.session.add(notification)
                count += 1

        # --- THÔNG BÁO CẢNH BÁO NGHỈ PHÉP ---
        latest_attendance = Attendance.query.filter_by(employee_id=emp.id)\
                                            .order_by(Attendance.time.desc())\
                                            .first()
        if latest_attendance and latest_attendance.absence > 2:
            # Kiểm tra nếu time là string và có định dạng "MM/YYYY"
            if isinstance(latest_attendance.time, str):
                try:
                    # Chuyển đổi từ "MM/YYYY" sang kiểu datetime
                    latest_time = datetime.strptime(latest_attendance.time, '%m/%Y')
                except ValueError:
                    # Nếu không khớp với định dạng, hãy xử lý lỗi hoặc bỏ qua
                    continue
            else:
                latest_time = latest_attendance.time

            # Chuyển đổi sang chuỗi tháng/năm
            month_str = latest_time.strftime('%m/%Y')
            message = f"!!! Warning : {emp.name} đã nghỉ không phép {latest_attendance.absence} ngày trong tháng {month_str}!"

            notification = Notification(employee_id=emp.id, message=message)
            db.session.add(notification)
            count += 1



        # --- THÔNG BÁO CHÊNH LỆCH LƯƠNG LỚN GIỮA CÁC KỲ ---
        payrolls = Payroll.query.filter_by(employee_id=emp.id)\
                                .order_by(Payroll.time.desc())\
                                .limit(2).all()

        if len(payrolls) == 2:
            current = payrolls[0]
            previous = payrolls[1]

            if previous.salary and previous.salary > 0:
                diff_percent = abs(current.salary - previous.salary) / previous.salary * 100
                threshold = 40  # Ngưỡng %

                if diff_percent > threshold:
                    message = (f"⚠️ Warning: Lương tháng hiện tại ({current.time.strftime('%m/%Y')}) của {emp.name} "
                               f"chênh lệch {diff_percent:.2f}% so với tháng trước ({previous.time.strftime('%m/%Y')}).")
                    notification = Notification(employee_id=emp.id, message=message)
                    db.session.add(notification)
                    count += 1

    db.session.commit()
    return jsonify({'message': f'Đã tạo {count} thông báo.'}), 201


@notification_bp.route('/', methods=['GET'])
def get_notifications():
    all_notifications = Notification.query.order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in all_notifications]), 200


@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
@role_required('Admin')
def delete_notification(notification_id):
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({'message': 'Không tìm thấy thông báo'}), 404

    db.session.delete(notification)
    db.session.commit()
    return jsonify({'message': 'Xóa thông báo thành công!'}), 200