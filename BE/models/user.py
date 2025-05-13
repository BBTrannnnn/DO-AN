from models import db
from datetime import datetime, timedelta
from flask import current_app
import jwt
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), default='employee')

    def __repr__(self):
        return f"<User {self.username}>"
    def generate_token(self):
        payload = {
            'username': self.username,
            'role': self.role,
            'exp': datetime.utcnow() + timedelta(hours=2)
        }
        return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
