from flask import Blueprint, jsonify, request
from numpy import dtype
from models.employees import Employee, EmployeeMySQL
from models.payrolls import Payroll, PayrollMySQL
from models import db
from datetime import datetime
from routes.decorators import role_required
from flask import current_app


payroll_bp = Blueprint('payrolls', __name__)

def get_payroll_model(dbtype):
    return PayrollMySQL if dbtype == 'mysql' else Payroll

def get_employee_model(dbtype):
    return EmployeeMySQL if dbtype == 'mysql' else Employee

@payroll_bp.route('/<dbtype>', methods=['GET'])
def get_payrolls(dbtype):
    PayrollModel = get_payroll_model(dbtype)
    EmployeeModel = get_employee_model(dbtype)
    # Lấy tất cả các bản lương từ cơ sở dữ liệu
    payrolls = PayrollModel.query.all()

    # Nếu không có bản lương nào, trả về thông báo
    if not payrolls:
        return jsonify({'message': 'Không có bản lương nào trong hệ thống'}), 404

    # Chuyển đổi các bản lương thành danh sách để trả về
    payroll_list = []
    for payroll in payrolls:
        # Lấy thông tin nhân viên từ bảng Employee
        employee = EmployeeModel.query.get(payroll.employee_id)
        if employee:
            payroll_list.append({
                'payroll_id': payroll.id,
                'employee_id': payroll.employee_id,
                'salary': payroll.salary,
                'time': payroll.time.strftime('%Y-%m-%d'), 
                'employee_name': employee.name ,
                'department': employee.department, 
                'job_title': employee.job_title 
            })

    return jsonify(payroll_list), 200


@payroll_bp.route('/<dbtype>', methods=['POST'])
@role_required('Admin', 'Payroll management') 
def add_payroll(dbtype):
    PayrollModel = get_payroll_model(dbtype)
    EmployeeModel = get_employee_model(dbtype)
    data = request.get_json()
    employee_id = data.get('employee_id')
    salary = data.get('salary')
    time = data.get('time')  

    if not employee_id or not salary or not time:
        return jsonify({'message': 'Thiếu thông tin bắt buộc (employee_id, salary, time)'}), 400

    employee = EmployeeModel.query.get(employee_id)
    if not employee:
        return jsonify({'message': 'Không tìm thấy nhân viên'}), 404

    try:
        time = datetime.strptime(time, '%Y-%m-%d')
    except ValueError:
        return jsonify({'message': 'Định dạng thời gian không hợp lệ.'}), 400

    existing = PayrollModel.query.filter(
    PayrollModel.employee_id == employee_id,
    db.extract('month', PayrollModel.time) == time.month,
    db.extract('year', PayrollModel.time) == time.year
).first()


    if existing:
        return jsonify({'message': 'Nhân viên này đã có bản lương trong tháng này'}), 400
    
    new_payroll = PayrollModel(
        employee_id=employee_id,    
        salary=salary,
        time=time
    )

    db.session.add(new_payroll)
    db.session.commit()

    return jsonify({'message': 'Thêm bản lương thành công!'}), 201

@payroll_bp.route('/update/<dbtype>', methods=['PUT'])
@role_required('Admin', 'Payroll management') 

def update_payroll(dbtype):
    PayrollModel = get_payroll_model(dbtype)
    EmployeeModel = get_employee_model(dbtype)
    data = request.get_json()
    payroll_id = data.get('payroll_id')  
    new_salary = data.get('salary')
    new_time = data.get('time')

    payroll = PayrollModel.query.filter_by(id=payroll_id).first()

    if not payroll:
        return jsonify({'message': 'Bản lương không tồn tại'}), 404

    # Cập nhật các thông tin mới
    if new_salary:
        payroll.salary = new_salary
    if new_time:
        try:
            new_time_obj = datetime.strptime(new_time, '%Y-%m-%d')
            payroll.time = new_time_obj
        except ValueError:
            return jsonify({'message': 'Sai định dạng thời gian. Định dạng đúng: YYYY-MM-DD'}), 400


    db.session.commit()
    return jsonify({'message': 'Cập nhật bản lương thành công'}), 200


@payroll_bp.route('/delete/<dbtype>', methods=['DELETE'])
@role_required('Admin', 'Payroll management') 

def delete_payroll(dbtype):
    PayrollModel = get_payroll_model(dbtype)    
    data = request.get_json()
    payroll_id = data.get('payroll_id')
    
    if not payroll_id:
        return jsonify({'error': 'payroll_id không được bỏ trống'}), 400

    payroll = PayrollModel.query.filter_by(id=payroll_id).first()
    if not payroll:
         return jsonify({'error': 'Bản lương không tồn tại'}), 404
    db.session.delete(payroll)
    db.session.commit()
    return jsonify({'message': 'Xóa bản lương thành công!'})
 
