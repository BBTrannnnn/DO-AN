from datetime import datetime
from models import db
from models.employees import Employee

class Payroll(db.Model):
    __bind_key__ = 'sqlserver'
    __tablename__ = 'payroll'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    salary = db.Column(db.Numeric(10, 3))  # 
    time = db.Column(db.Date, nullable=False)

    employee = db.relationship('Employee', backref=db.backref('payrolls', cascade='all, delete-orphan'))
    def __repr__(self):
        
        return f"<Payroll {self.employee_id} - {self.time.strftime('%d/%m/%Y')} - {self.salary}>"

class PayrollMySQL(db.Model):
    __bind_key__ = 'mysql'
    __tablename__ = 'payroll'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.String(10), nullable=False)
    salary = db.Column(db.Numeric(10, 3))
    time = db.Column(db.Date, nullable=False)

    def __repr__(self):
        return f"<PayrollMySQL {self.employee_id} - {self.time.strftime('%d/%m/%Y')} - {self.salary}>"

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'salary': float(self.salary) if self.salary else None,
            'time': self.time.isoformat() if self.time else None,
        }