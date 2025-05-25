from flask import Blueprint, jsonify, request
from datetime import datetime
from models import db
from models.employees import Employee, EmployeeMySQL
from models.attendances import Attendance
from models.notification import Notification, NotificationMySQL
from models.payrolls import Payroll, PayrollMySQL
from routes.decorators import role_required


notification_bp = Blueprint('notifications', __name__)

def get_employee_model(dbtype):
    return EmployeeMySQL if dbtype == 'mysql' else Employee

def get_notification_model(dbtype):
    return NotificationMySQL if dbtype == 'mysql' else Notification

def get_payroll_model(dbtype):
    return PayrollMySQL if dbtype == 'mysql' else Payroll

@notification_bp.route('/generate/<dbtype>', methods=['POST'])
@role_required('Admin')
def generate_notifications(dbtype):
    EmployeeModel = get_employee_model(dbtype)
    NotificationModel = get_notification_model(dbtype)
    PayrollModel = get_payroll_model(dbtype)

    today = datetime.today().date()
    count = 0

    employees = EmployeeModel.query.all()

    for emp in employees:
        # --- Thông báo kỷ niệm làm việc ---
        if emp.working_status:
            working_years = (today - emp.working_status).days // 365
            if working_years in [1, 5, 10]:
                message = f"🎉✨ Chúc mừng {emp.name} đã làm việc {working_years} năm tại công ty! 🥳👏"
                db.session.add(NotificationModel(employee_id=emp.id, message=message))
                count += 1

        # --- Thông báo nghỉ không phép ---
        latest_attendance = Attendance.query.filter_by(employee_id=emp.id)\
                                            .order_by(Attendance.time.desc())\
                                            .first()
        if latest_attendance and latest_attendance.absence > 2:
            try:
                latest_time = (
                    datetime.strptime(latest_attendance.time, '%m/%Y')
                    if isinstance(latest_attendance.time, str)
                    else latest_attendance.time
                )
                month_str = latest_time.strftime('%m/%Y')
                message = f"!!! Warning: {emp.name} đã nghỉ không phép {latest_attendance.absence} ngày trong tháng {month_str}!"
                db.session.add(NotificationModel(employee_id=emp.id, message=message))
                count += 1
            except ValueError:
                continue

        # --- Thông báo chênh lệch lương ---
        payrolls = PayrollModel.query.filter_by(employee_id=emp.id)\
                                     .order_by(PayrollModel.time.desc())\
                                     .limit(2).all()
        if len(payrolls) == 2:
            current, previous = payrolls[0], payrolls[1]
            if previous.salary and previous.salary > 0:
                diff_percent = abs(current.salary - previous.salary) / previous.salary * 100
                if diff_percent > 40:
                    message = (f"⚠️ Warning: Lương tháng {current.time.strftime('%m/%Y')} của {emp.name} "
                               f"chênh lệch {diff_percent:.2f}% so với tháng trước ({previous.time.strftime('%m/%Y')}).")
                    db.session.add(NotificationModel(employee_id=emp.id, message=message))
                    count += 1

    db.session.commit()
    return jsonify({'message': f'Đã tạo {count} thông báo.'}), 201


@notification_bp.route('/<dbtype>', methods=['GET'])
def get_notifications(dbtype):
    NotificationModel = get_notification_model(dbtype)
    notifications = NotificationModel.query.order_by(NotificationModel.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200


@notification_bp.route('/<int:notification_id>/<dbtype>', methods=['DELETE'])
@role_required('Admin')
def delete_notification(notification_id, dbtype):
    NotificationModel = get_notification_model(dbtype)
    notification = NotificationModel.query.get(notification_id)
    if not notification:
        return jsonify({'message': 'Không tìm thấy thông báo'}), 404

    db.session.delete(notification)
    db.session.commit()
    return jsonify({'message': 'Xóa thông báo thành công!'}), 200
