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

@payroll_bp.route('/<int:payroll_id>', methods=['PUT'])
def update_payroll(payroll_id):
    data = request.get_json()
    payroll = Payroll.query.get_or_404(payroll_id)

    payroll.salary = data.get('salary', payroll.salary)
    if data.get('time'):
        payroll.time = datetime.strptime(data['time'], '%m/%Y').date()

    db.session.commit()
    return jsonify({'message': 'Cập nhật bản lương thành công!',})

@payroll_bp.route('/<int:payroll_id>', methods=['DELETE'])
def delete_payroll(payroll_id):
    payroll = Payroll.query.get_or_404(payroll_id)

    db.session.delete(payroll)
    db.session.commit()
    return jsonify({'message': 'Xóa bản lương thành công!', })

@payroll_bp.route('/search_employee/<int:employee_id>', methods=['GET'])
def get_payrolls_by_employee(employee_id):
    payrolls = Payroll.query.filter_by(employee_id=employee_id).all()

    if not payrolls:
        return jsonify({'message': 'Không tìm thấy bản lương nào cho nhân viên này'}), 404

    result = []
    for p in payrolls:
        employee = Employee.query.get(p.employee_id)
        result.append({
            'payroll_id': p.id,
            'employee_id': p.employee_id,
            'salary': float(p.salary),
            'time': p.time.strftime('%m/%Y'),
            'department': employee.department, 
            'job_title': employee.job_title,
            'employee_name': employee.name 
        })

    return jsonify(result), 200
