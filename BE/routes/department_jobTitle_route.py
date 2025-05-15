from flask import Blueprint, jsonify
from models.department_jobtitle import DepartmentJobTitle
from models.employees import Employee
from models import db

department_job_title_bp = Blueprint('department_job_title', __name__)

@department_job_title_bp.route('/', methods=['GET'])  # CHỈ DẤU "/"
def get_all_department_job_titles():
    try:
        records = DepartmentJobTitle.query.all()
        result = []
        for record in records:
            # Lấy tên department và job_title từ employee qua quan hệ
            record_data = {
                'id_department': record.department_id,
                'id_job_title': record.job_title_id,
                'id_employee': record.employee_id,
            }
            if record.employee_id:
                employee = Employee.query.get(record.employee_id)
                if employee:
                    record_data.update({
                        'name': employee.name,
                        'department': employee.department,
                        'job_title': employee.job_title
                    })
            result.append(record_data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
