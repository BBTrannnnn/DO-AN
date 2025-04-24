
from flask import Blueprint, jsonify, request
from models import db, Employee
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
    if not data or 'id' not in data or 'name' not in data:
        return jsonify({'message': 'Missing required data (id, name)'}), 400

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
    return jsonify({'message': 'Employee added successfully!', 'employee': new_employee.to_dict()}), 201

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
    return jsonify({'message': 'Employee updated successfully!', 'employee': employee.to_dict()})

@employee_bp.route('/<employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)

    # Thêm logic kiểm tra ràng buộc payroll/dividends ở đây
    # Ví dụ đơn giản:
    if employee.payrolls:
        return jsonify({'message': 'Cannot delete employee with associated payroll data.'}), 400

    db.session.delete(employee)
    db.session.commit()
    return jsonify({'message': 'Employee deleted successfully!'})