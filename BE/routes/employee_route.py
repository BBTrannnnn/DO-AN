
from flask import Blueprint, jsonify, request
from models.employees import db, Employee, EmployeeMySQL
from datetime import datetime
from models.department_jobtitle import DepartmentJobTitle, DepartmentJobTitleMySQL
from routes.decorators import role_required
employee_bp = Blueprint('employees', __name__)



def get_employee_model(dbtype):
    return EmployeeMySQL if dbtype == 'mysql' else Employee

def get_dept_job_model(dbtype):
    return DepartmentJobTitleMySQL if dbtype == 'mysql' else DepartmentJobTitle
DEPARTMENT_ID_MAP = {
    'IT': '1',
    'HR': '2',
    'Sales': '3',
    'Marketing': '4',
    'Finance': '5',
    'Administration':'6',
}

JOB_TITLE_ID_MAP = {
    'Software Engineer': '1.1',
    'Backend Developer': '1.2',
    'Frontend Developer': '1.3',
    'QA Tester': '1.4',
    'DevOps Engineer': '1.5',
    'HR Assistant':'2.1',
    'HR Manager': '2.2',
    'Recruiter': '2.3',
    'Payroll Specialist': '2.4',
    'Sales Executive ' : '3.1',
    'Sales Representative': '3.2',
    'Account Manager': '3.3',
    'Business Development Executive':'3.4',
    'Marketing Specialist ':'4.1',
    'Content Creator':'4.2',
    'SEO Specialist':'4.3',
    'Social Media Manager ':'4.4',
    'Accountant':'5.1',
    'Financial Analyst':'5.2',
    'Auditor':'5.3',
    'Bookkeeper':'5.4',
    'Office Administrator':'6.1',
    'Receptionist':'6.2',
    'Administrative Assistant':'6.3',
    'Data Entry Clerk':'6.4',
}

@employee_bp.route('/<dbtype>', methods=['GET'])
def get_employees(dbtype):
    EmployeeModel = get_employee_model(dbtype)
    employees = EmployeeModel.query.all()
    return jsonify([emp.to_dict() for emp in employees]), 200

@employee_bp.route('/<dbtype>/<employee_id>', methods=['GET'])
def get_employee(dbtype, employee_id):
    EmployeeModel = get_employee_model(dbtype)
    employee = EmployeeModel.query.get_or_404(employee_id)
    return jsonify(employee.to_dict()), 200

@employee_bp.route('/<dbtype>', methods=['POST'])
@role_required('Admin', 'Hr management')
def add_employee(dbtype):
    EmployeeModel = get_employee_model(dbtype)
    DeptJobModel = get_dept_job_model(dbtype)

    data = request.get_json()
    required_fields = ['id', 'name', 'gender', 'department', 'job_title', 'working_status', 'dob']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Thiếu thông tin bắt buộc!'}), 400

    if EmployeeModel.query.filter_by(id=data['id']).first():
        return jsonify({'message': f'ID "{data["id"]}" đã tồn tại!'}), 400

    if data.get('email') and EmployeeModel.query.filter_by(email=data['email']).first():
        return jsonify({'message': f'Email "{data["email"]}" đã tồn tại!'}), 400

    department_id = DEPARTMENT_ID_MAP.get(data['department'])
    job_title_id = JOB_TITLE_ID_MAP.get(data['job_title'])

    if not department_id or not job_title_id:
        return jsonify({'message': 'Phòng ban hoặc chức vụ không hợp lệ!'}), 400

    new_employee = EmployeeModel(
        id=data['id'],
        name=data['name'],
        gender=data['gender'],
        department=data['department'],
        job_title=data['job_title'],
        email=data.get('email'),
        working_status=datetime.strptime(data['working_status'], '%Y-%m-%d').date(),
        dob=datetime.strptime(data['dob'], '%Y-%m-%d').date()
    )

    db.session.add(new_employee)
    db.session.flush()

    new_dept_job = DeptJobModel(
        employee_id=new_employee.id,
        department_id=department_id,
        job_title_id=job_title_id
    )
    db.session.add(new_dept_job)
    db.session.commit()

    return jsonify({'message': 'Thêm nhân viên thành công!', 'employee': new_employee.to_dict()}), 201

@employee_bp.route('/<dbtype>/<employee_id>', methods=['PUT'])
@role_required('Admin', 'Hr management')
def update_employee(dbtype, employee_id):
    EmployeeModel = get_employee_model(dbtype)
    DeptJobModel = get_dept_job_model(dbtype)

    employee = EmployeeModel.query.get_or_404(employee_id)
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

    
    department_name = data.get('department')
    job_title_name = data.get('job_title')

    department_id = DEPARTMENT_ID_MAP.get(department_name)
    job_title_id = JOB_TITLE_ID_MAP.get(job_title_name)

    dept_job = DeptJobModel.query.filter_by(employee_id=employee.id).first()
    if dept_job:
        dept_job.department_id = department_id
        dept_job.job_title_id = job_title_id

    db.session.commit()
    return jsonify({'message': 'Cập nhật thông tin nhân viên thành công!', 'employee': employee.to_dict()}), 200

@employee_bp.route('/<dbtype>/<employee_id>', methods=['DELETE'])
@role_required('Admin', 'Hr management')
def delete_employee(dbtype, employee_id):
    EmployeeModel = get_employee_model(dbtype)
    employee = EmployeeModel.query.get_or_404(employee_id)

    db.session.delete(employee)
    db.session.commit()
    return jsonify({'message': 'Xóa nhân viên thành công!'}), 200
