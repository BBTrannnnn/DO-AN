from functools import wraps
from flask import request, jsonify, current_app
import jwt

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'message': 'Thiếu token'}), 401
            
            try:
                token = auth_header.split(" ")[1]
                decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
                role = decoded.get('role')
                if role not in allowed_roles:
                    return jsonify({'message': f'Không có quyền ({role})'}), 403
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token hết hạn'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Token không hợp lệ'}), 401

            return f(*args, **kwargs)
        return wrapper
    return decorator
