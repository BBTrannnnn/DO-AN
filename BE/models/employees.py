from datetime import datetime
from models import db


class Employee(db.Model):
    __bind_key__ = 'sqlserver'
    __tablename__ = 'employees'

    id = db.Column(db.String(10), primary_key=True)  # '0001'
    name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10))
    department = db.Column(db.String(100))
    job_title = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    working_status = db.Column(db.Date)  # Ngày bắt đầu làm việc
    dob = db.Column(db.Date)             # Ngày sinh

    #payrolls = db.relationship('Payroll', backref='employee', lazy=True, )
    
    
    def __repr__(self):
        return f"<Employee {self.id} - {self.name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'gender': self.gender,
            'department': self.department,
            'job_title': self.job_title,
            'email': self.email,
            'working_status': self.working_status.isoformat() if self.working_status else None,
            'dob': self.dob.isoformat() if self.dob else None
        }
    
class EmployeeMySQL(db.Model):
    __bind_key__ = 'mysql'
    __tablename__ = 'employees'

    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10))
    department = db.Column(db.String(100))
    job_title = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    working_status = db.Column(db.Date)
    dob = db.Column(db.Date)

    def __repr__(self):
        return f"<EmployeeMySQL {self.id} - {self.name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'gender': self.gender,
            'department': self.department,
            'job_title': self.job_title,
            'email': self.email,
            'working_status': self.working_status.isoformat() if self.working_status else None,
            'dob': self.dob.isoformat() if self.dob else None
        }
