from datetime import datetime
from models import db

class History(db.Model):
    __bind_key__ = 'sqlserver'
    __tablename__ = 'history'

    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    target_user = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<History {self.action} {self.target_user} at {self.timestamp}>"
