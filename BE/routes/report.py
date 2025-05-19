from flask import Blueprint, jsonify
from models import db
from models.employees import Employee
from models.payrolls import Payroll
from sqlalchemy import func, cast, String

report_bp = Blueprint('report', __name__)

@report_bp.route('/report', methods=['GET'])
def get_report():
    try:
        # 1. Employee overview: tổng số nhân viên, phân theo giới tính
        total_employees = db.session.query(func.count(Employee.id)).scalar()
        male_employees = db.session.query(func.count(Employee.id)).filter(Employee.gender == 'Male').scalar()
        female_employees = db.session.query(func.count(Employee.id)).filter(Employee.gender == 'Female').scalar()

        employee_overview = {
            'total': total_employees,
            'male': male_employees,
            'female': female_employees,
        }

        # 2. Payroll summary theo department
        payroll_summary = db.session.query(
            Employee.department,
            func.count(Payroll.id),
            func.sum(Payroll.salary)
        ).join(Payroll, Payroll.employee_id == Employee.id) \
         .group_by(Employee.department).all()

        payroll_report = []
        for department, count_payrolls, total_salary in payroll_summary:
            payroll_report.append({
                'department': department,
                'payroll_count': count_payrolls,
                'total_salary': total_salary
            })

        # 3. Monthly payroll stats
        from sqlalchemy.sql import literal_column
        month_expr = func.concat(
            func.right(func.concat(literal_column("'0'"), cast(func.month(Payroll.time), String)), 2),
            literal_column("'/'"),
            cast(func.year(Payroll.time), String)
        )
        subquery = db.session.query(
            Payroll.id,
            Payroll.employee_id,
            Payroll.salary,
            month_expr.label('month')
        ).subquery()

        monthly_stats = db.session.query(
            subquery.c.month,
            func.count(func.distinct(subquery.c.employee_id)),
            func.sum(subquery.c.salary)
        ).group_by(subquery.c.month).order_by(subquery.c.month).all()

        monthly_report = []
        for month, employee_count, total_salary in monthly_stats:
            monthly_report.append({
                'month': month,
                'employee_count': employee_count,
                'total_salary': total_salary
            })

        return jsonify({
            'employee_overview': employee_overview,
            'payroll_report': payroll_report,
            'monthly_report': monthly_report
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
