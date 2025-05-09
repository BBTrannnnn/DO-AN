from flask import Blueprint, jsonify, request
from models.employees import Employee, db
from models.payrolls import Payroll, db
from datetime import datetime

payroll_bp = Blueprint('payrolls', __name__)

@payroll_bp.route('/', methods=['POST'])
def add_payroll():
    data = request.get_json()
    employee_id = data.get('employee_id')
    salary = data.get('salary')
    time_str = data.get('time')  # dạng MM/YYYY

    if not employee_id or not salary or not time_str:
        return jsonify({'message': 'Thiếu thông tin bắt buộc (employee_id, salary, time)'}), 400

    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({'message': 'Không tìm thấy nhân viên'}), 404

    try:
        time = datetime.strptime(time_str, '%m/%Y')
    except ValueError:
        return jsonify({'message': 'Định dạng thời gian không hợp lệ. Đúng dạng MM/YYYY'}), 400

    existing = Payroll.query.filter_by(employee_id=employee_id).filter(
    db.extract('month', Payroll.time) == time.month,
    db.extract('year', Payroll.time) == time.year
    ).first()

    if existing:
        return jsonify({'message': 'Nhân viên này đã có bản lương trong tháng này'}), 400
    
    new_payroll = Payroll(
        employee_id=employee_id,
        salary=salary,
        time=time
    )

    db.session.add(new_payroll)
    db.session.commit()

    return jsonify({'message': 'Thêm bản lương thành công!'}), 201

@payroll_bp.route('/', methods=['GET'])
def get_payrolls():
    # Lấy tất cả các bản lương từ cơ sở dữ liệu
    payrolls = Payroll.query.all()

    # Nếu không có bản lương nào, trả về thông báo
    if not payrolls:
        return jsonify({'message': 'Không có bản lương nào trong hệ thống'}), 404

    # Chuyển đổi các bản lương thành danh sách để trả về
    payroll_list = []
    for payroll in payrolls:
        # Lấy thông tin nhân viên từ bảng Employee
        employee = Employee.query.get(payroll.employee_id)
        if employee:
            payroll_list.append({
                'payroll_id': payroll.id,
                'employee_id': payroll.employee_id,
                'salary': payroll.salary,
                'time': payroll.time.strftime('%m/%Y'), 
                'employee_name': employee.name ,
                'department': employee.department, 
                'job_title': employee.job_title 
            })

    return jsonify(payroll_list), 200

@payroll_bp.route('/update', methods=['PUT'])
def update_payroll():
    data = request.get_json()
    payroll_id = data.get('payroll_id')  
    new_salary = data.get('salary')
    new_time = data.get('time')

    payroll = Payroll.query.filter_by(id=payroll_id).first()

    if not payroll:
        return jsonify({'message': 'Bản lương không tồn tại'}), 404

    # Cập nhật các thông tin mới
    if new_salary:
        payroll.salary = new_salary
    if new_time:
        try:
            payroll.time = datetime.strptime('01/' + new_time, '%d/%m/%Y')
        except ValueError:
            return jsonify({'message': 'Sai định dạng thời gian. Định dạng đúng: mm/YYYY'}), 400
    db.session.commit()
    return jsonify({'message': 'Cập nhật bản lương thành công'}), 200

@payroll_bp.route('/delete', methods=['DELETE'])
def delete_payroll():
    data = request.get_json()
    payroll_id = data.get('payroll_id')
    
    if not payroll_id:
        return jsonify({'error': 'payroll_id không được bỏ trống'}), 400

    payroll = Payroll.query.filter_by(id=payroll_id).first()
    if not payroll:
         return jsonify({'error': 'Bản lương không tồn tại'}), 404
    db.session.delete(payroll)
    db.session.commit()
    return jsonify({'message': 'Xóa bản lương thành công!'})
        