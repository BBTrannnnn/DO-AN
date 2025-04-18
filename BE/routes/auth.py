from flask import Blueprint, request, jsonify
from models.user import User,db
from models.history import History,db
from datetime import datetime

auth = Blueprint('auth', __name__)


@auth.route('/get_users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "password": u.password,
        "role": u.role
    } for u in users])
@auth.route('/login', methods=['POST'])

def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and password == user.password:  # So sánh mật khẩu trực tiếp
        return jsonify({
            'message': 'Đăng nhập thành công!',
            'role': user.role
        }), 200
    else:
        return jsonify({'message': 'Tên tài khoản hoặc mật khẩu sai!'}), 401
    
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'employee')

    # Kiểm tra nếu tài khoản đã tồn tại
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Tài khoản đã tồn tại'}), 400

    new_user = User(username=username, password=password, role=role)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Thêm tài khoản thành công!!'}), 201

@auth.route('/delete', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    username = data.get('username')

    user = User.query.filter_by(username=username).first()

    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Xóa tài khoản thành công'}), 200
    else:
        return jsonify({'message': 'Tài khoản không tồn tại'}), 404
    
@auth.route('/update', methods=['PUT'])
def update_user():
    data = request.get_json()
    username = data.get('username')

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'message': 'Tài khoản không tồn tại'}), 404

    # Cập nhật thông tin nếu có
    new_password = data.get('password')
    new_role = data.get('role')

    if new_password:
        user.password = new_password
    if new_role:
        user.role = new_role

    db.session.commit()
    return jsonify({'message': 'Cập nhật tài khoản thành công'}), 200

@auth.route('/log_history', methods=['POST'])
def log_history():
    data = request.get_json()
    action = data.get('action')
    username = data.get('username')
    target_user = data.get('target_user')

    history = History(action=action, username=username, target_user=target_user)
    db.session.add(history)
    db.session.commit()
    
    return jsonify({'message': 'Lịch sử được ghi nhận!'}), 200

@auth.route('/get_history', methods=['GET'])
def get_history():
    histories = History.query.order_by(History.timestamp.desc()).all()
    return jsonify([{
        'action': h.action,
        'username': h.username,
        'target_user': h.target_user,
        'timestamp': h.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for h in histories]), 200

