from models import db
from models.employees import Employee

class Attendance(db.Model):
    __bind_key__ = 'sqlserver'  
    __tablename__ = 'attendances'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Unicode(10), db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    working_days = db.Column(db.Integer, nullable=False)
    absence = db.Column(db.Integer, nullable=False)
    leave = db.Column(db.Integer, nullable=False)
    time = db.Column(db.Date, nullable=False)  # Ví dụ: '04/2025'

    employee = db.relationship('Employee', backref=db.backref('attendances', cascade='all, delete-orphan'))


    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'employee_name': self.employee.name,
            'department': self.employee.department,
            'job_title': self.employee.job_title,
            'working_days': self.working_days,
            'absence': self.absence,
            'leave': self.leave,
            'time': self.time.strftime('%Y-%m-%d') if self.time else None
        }
