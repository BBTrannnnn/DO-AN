from models import db
from datetime import datetime, timedelta
from flask import current_app
import jwt
class User(db.Model):
    __bind_key__ = 'sqlserver'
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), default='employee')

    def __repr__(self):
        return f"<User {self.username}>"
    
    def generate_token(self, expires_in=3600):
        """Tạo token JWT cho người dùng"""
        payload = {
            'id': self.id,
            'username': self.username,
            'role': [self.role],
            'exp': datetime.utcnow() + timedelta(seconds=expires_in)
        }
        # Mã hóa token bằng JWT
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return token  # Token sẽ trả về dưới dạng chuỗi
    
class UserMySQl(db.Model):
    __bind_key__ = 'mysql'
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), default='employee')

    def __repr__(self):
        return f"<User {self.username}>"
    
    def generate_token(self, expires_in=3600):
        """Tạo token JWT cho người dùng"""
        payload = {
            'id': self.id,
            'username': self.username,
            'role': [self.role],
            'exp': datetime.utcnow() + timedelta(seconds=expires_in)
        }
        # Mã hóa token bằng JWT
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return token  # Token sẽ trả về dưới dạng chuỗi
