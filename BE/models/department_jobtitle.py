from models import db
from models.employees import Employee, EmployeeMySQL

class DepartmentJobTitle(db.Model):
    __bind_key__ = 'sqlserver'
    __tablename__ = 'department_job_title'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # ← SỬA: thêm autoincrement
    department_id = db.Column(db.String(10), nullable=False)
    job_title_id = db.Column(db.String(10), nullable=False)
    employee_id = db.Column(db.String(10), db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=True)

    employee = db.relationship(
        'Employee',
        backref=db.backref('department_job_title', cascade='all, delete-orphan', passive_deletes=True)
    )

    def to_dict(self):
        return {
            'id': self.id,
            'department_id': self.department_id,
            'job_title_id': self.job_title_id,
            'employee_id': self.employee_id,
            'employee_name': self.employee.name if self.employee else None,
            'department': self.employee.department if self.employee else None,
            'job_title': self.employee.job_title if self.employee else None,
        }

class DepartmentJobTitleMySQL(db.Model):
    __bind_key__ = 'mysql'
    __tablename__ = 'department_job_title'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # ← SỬA: thêm autoincrement
    department_id = db.Column(db.String(10), nullable=False)
    job_title_id = db.Column(db.String(10), nullable=False)
    employee_id = db.Column(db.String(10), db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=True)

    employee = db.relationship(
        'EmployeeMySQL',
        backref=db.backref('department_job_title', cascade='all, delete-orphan', passive_deletes=True)
    )

    def to_dict(self):
        return {
            'id': self.id,
            'department_id': self.department_id,
            'job_title_id': self.job_title_id,
            'employee_id': self.employee_id,
            'employee_name': self.employee.name if self.employee else None,
            'department': self.employee.department if self.employee else None,
            'job_title': self.employee.job_title if self.employee else None,
        }
