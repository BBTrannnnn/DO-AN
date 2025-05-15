
from flask import Blueprint, jsonify, request
from models.employees import db, Employee
from datetime import datetime
from models.department_jobtitle import DepartmentJobTitle
employee_bp = Blueprint('employees', __name__)

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
    job_title = data.get('job_title')
    working_status = data.get('working_status')
    dob = data.get('dob')

    existing_employee_id = Employee.query.filter_by(id=employee_id).first()
    if existing_employee_id:
        return jsonify({'message': f'ID "{employee_id}" đã tồn tại!'}), 400

    if email:
        existing_employee_email = Employee.query.filter_by(email=email).first()
        if existing_employee_email:
            return jsonify({'message': f'Email "{email}" đã tồn tại!'}), 400

    department_name = data.get('department')
    job_title_name = data.get('job_title')

    # Lấy id tương ứng
    department_id = DEPARTMENT_ID_MAP.get(department_name)
    job_title_id = JOB_TITLE_ID_MAP.get(job_title_name)

    if not department_id or not job_title_id:
        return jsonify({'message': 'Phòng ban hoặc chức vụ không hợp lệ!'}), 400

    

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
    db.session.flush()
    new_dept_job = DepartmentJobTitle(
        department_id=department_id,
        job_title_id=job_title_id,
        employee_id=new_employee.id
    )
    db.session.add(new_dept_job)
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
