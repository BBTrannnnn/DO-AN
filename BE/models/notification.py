# models/notifications.py
from models import db
from datetime import datetime
import pytz

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(10), db.ForeignKey('employees.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

  
    employee = db.relationship('Employee', backref=db.backref('notifications', cascade='all, delete-orphan'))
    def __repr__(self):
        return f"<Notification {self.id} - {self.employee_id} - {self.message} - {self.created_at.strftime('%d/%m/%Y %H:%M:%S')}>"
    def to_dict(self):
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        created_at_vn = self.created_at.replace(tzinfo=pytz.utc).astimezone(vn_tz)
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'employee_name': self.employee.name if self.employee else None,
            'message': self.message,
            'created_at': created_at_vn.strftime('%Y-%m-%d %H:%M:%S')
        }