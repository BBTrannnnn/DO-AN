from datetime import datetime
from models import db

class Payroll(db.Model):
    __tablename__ = 'payrolls'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    salary = db.Column(db.Numeric(10, 2))  # 
    time = db.Column(db.String(7))  # Dạng MM/YYYY, ví dụ: '03/2025'

    def __repr__(self):
        return f"<Payroll {self.employee_id} - {self.time} - {self.salary}>"

