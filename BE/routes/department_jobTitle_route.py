from flask import Blueprint, jsonify, request
from models.department_jobtitle import DepartmentJobTitle, DepartmentJobTitleMySQL
from models.employees import Employee, EmployeeMySQL
from models import db

department_job_title_bp = Blueprint('department_job_title', __name__)

def get_department_jobtitle_model(dbtype):
    return DepartmentJobTitleMySQL if dbtype == 'mysql' else DepartmentJobTitle

def get_employee_model(dbtype):
    return EmployeeMySQL if dbtype == 'mysql' else Employee 

@department_job_title_bp.route('/<dbtype>', methods=['GET'])  # ROUTE giống payroll
def get_all_department_job_titles(dbtype):
    DepartmentJobTitleModel = get_department_jobtitle_model(dbtype)
    EmployeeModel = get_employee_model(dbtype)

    try:
        # Lấy tất cả các bản ghi department-job-title
        records = DepartmentJobTitleModel.query.all()

        if not records:
            return jsonify({'message': 'Không có bản ghi nào trong hệ thống'}), 404

        result = []
        for record in records:

            record_data = {
                'id_department': record.department_id,
                'id_job_title': record.job_title_id,
                'id_employee': record.employee_id,
            }

            # Nếu có employee_id, lấy thông tin nhân viên
            if record.employee_id:
                employee = EmployeeModel.query.get(record.employee_id)
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
