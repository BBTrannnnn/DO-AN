
from flask import Blueprint, jsonify, request
from models.employees import db, Employee
from datetime import datetime

employee_bp = Blueprint('employees', __name__)

@employee_bp.route('/', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    employee_list = [emp.to_dict() for emp in employees]
    return jsonify(employee_list)

@employee_bp.route('//<employee_id>', methods=['GET'])
def get_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    return jsonify(employee.to_dict())

@employee_bp.route('/', methods=['POST'])
def add_employee():
    data = request.get_json()
    if not data or 'id' not in data or 'name' not in data or 'gender' not in data or 'department' not in data or 'job_title' not in data or 'working_status' not in data or 'dob' not in data :
        return jsonify({'message': 'Thiếu thông tin bắt buộc  (id, name)'}), 400
    employee_id = data['id']
    email = data.get('email')
    gender = data.get('gender')
    department = data.get('department')
    job_tiltle = data.get('job_titlle')
    working_status = data.get('working_status')
    dob = data.get('dob')

    existing_employee_id = Employee.query.filter_by(id=employee_id).first()
    if existing_employee_id:
        return jsonify({'message': f'ID "{employee_id}" đã tồn tại!'}), 400

    if email:
        existing_employee_email = Employee.query.filter_by(email=email).first()
        if existing_employee_email:
            return jsonify({'message': f'Email "{email}" đã tồn tại!'}), 400

    

    new_employee = Employee(
        id=data['id'],
        name=data['name'],
        gender=data.get('gender'),
        department=data.get('department'),
        job_title=data.get('job_title'),
        email=data.get('email'),
        working_status=datetime.strptime(data['working_status'], '%Y-%m-%d').date() if data.get('working_status') else None,
        dob=datetime.strptime(data['dob'], '%Y-%m-%d').date() if data.get('dob') else None
    )

    db.session.add(new_employee)
    db.session.commit()
    return jsonify({'message': 'Thêm nhân viên thành công !', 'employee': new_employee.to_dict()}), 201

@employee_bp.route('/<employee_id>', methods=['PUT'])
def update_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    data = request.get_json()

    employee.name = data.get('name', employee.name)
    employee.gender = data.get('gender', employee.gender)
    employee.department = data.get('department', employee.department)
    employee.job_title = data.get('job_title', employee.job_title)
    employee.email = data.get('email', employee.email)
    if data.get('working_status'):
        employee.working_status = datetime.strptime(data['working_status'], '%Y-%m-%d').date()
    if data.get('dob'):
        employee.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()

    db.session.commit()
    return jsonify({'message': 'Cập nhật thông tin nhân viên thành công!', 'employee': employee.to_dict()})

@employee_bp.route('/<employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    db.session.delete(employee)
    db.session.commit()
    return jsonify({'message': 'Xóa nhân viên thành công!'})
