from functools import wraps
from flask import request, jsonify
import jwt
from flask import current_app

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'message': 'Token không được cung cấp'}), 401

            try:
                # Xử lý định dạng Bearer token
                if token.startswith('Bearer '):
                    token = token[7:]
                else:
                    return jsonify({'message': 'Token không đúng định dạng'}), 401

                # Giải mã JWT
                payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
                user_roles = payload.get('role')

                print(f"[DEBUG] Vai trò người dùng: {user_roles}")

                if not user_roles:
                    return jsonify({'message': 'Không có vai trò nào trong token'}), 403

                # Ép kiểu nếu chỉ có 1 vai trò dạng string
                if isinstance(user_roles, str):
                    user_roles = [user_roles]

                # Kiểm tra nếu người dùng KHÔNG có bất kỳ vai trò nào phù hợp
                allowed_roles = [r.lower() for r in roles]
                user_roles_lower = [r.lower() for r in user_roles]

                if not set(allowed_roles).intersection(set(user_roles_lower)):
                    return jsonify({'message': f'Truy cập bị từ chối. Cần vai trò: {roles}'}), 403

                request.user = payload

            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token đã hết hạn'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Token không hợp lệ'}), 401

            return f(*args, **kwargs)
        return wrapper
    return decorator
