
from flask import Blueprint, request, jsonify
from models.user import User,db,UserMySQl
from models.history import History,db
from models.payrolls import Payroll,db
from models.employees import Employee,db
from datetime import datetime
import pytz
from  routes.decorators import role_required
from flask import current_app




auth = Blueprint('auth', __name__)

# Hàm chọn model theo dbtype
def get_user_model(dbtype):
    return UserMySQl if dbtype == 'mysql' else User

# ✅ Danh sách tài khoản
@auth.route('/get_users/<dbtype>', methods=['GET'])
def get_users(dbtype):
    UserModel = get_user_model(dbtype)
    users = UserModel.query.all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "password": u.password,
        "role": u.role
    } for u in users]), 200


# Danh sách các thao tác trong lịch sử
@auth.route('/get_history', methods=['GET']) 

def get_history():
    histories = History.query.order_by(History.timestamp.desc()).all()
    return jsonify([{
        'action': h.action,
        'username': h.username,
        'target_user': h.target_user,
        'timestamp': h.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for h in histories]), 200


@auth.route('/login/<dbtype>', methods=['POST'])
def login(dbtype):
    UserModel = get_user_model(dbtype)
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = UserModel.query.filter_by(username=username).first()

    if user and current_app.bcrypt.check_password_hash(user.password, password):
        token = user.generate_token()
        return jsonify({
            'message': 'Đăng nhập thành công!',
            'role': user.role.strip().capitalize(),
            'token': token
        }), 200
    else:
        return jsonify({'message': 'Tên tài khoản hoặc mật khẩu sai!'}), 401

    

    
#Thêm tài khoản
@auth.route('/register/<dbtype>', methods=['POST'])
@role_required('Admin')
def register(dbtype):
    UserModel = get_user_model(dbtype)
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'employee').strip().capitalize()

    if UserModel.query.filter_by(username=username).first():
        return jsonify({'message': 'Tài khoản đã tồn tại'}), 400

    hashed_password = current_app.bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = UserModel(username=username, password=hashed_password, role=role)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': f'Thêm tài khoản thành công vào {dbtype}!'}), 201


# Xóa tài khoản
@auth.route('/delete/<dbtype>', methods=['DELETE'])
@role_required('Admin')
def delete_user(dbtype):
    UserModel = get_user_model(dbtype)
    data = request.get_json()
    username = data.get('username')

    user = UserModel.query.filter_by(username=username).first()

    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': f'Xóa tài khoản khỏi {dbtype} thành công'}), 200
    else:
        return jsonify({'message': 'Tài khoản không tồn tại'}), 404

# Cập nhật tài khoản   
@auth.route('/update/<dbtype>', methods=['PUT'])
@role_required('Admin')
def update_user(dbtype):
    UserModel = get_user_model(dbtype)
    data = request.get_json()
    old_username = data.get('old_username')
    new_username = data.get('new_username')
    new_password = data.get('password')
    new_role = data.get('role')

    user = UserModel.query.filter_by(username=old_username).first()

    if not user:
        return jsonify({'message': 'Tài khoản không tồn tại'}), 404


    if new_username:
        user.username = new_username
    if new_password:
        user.password = current_app.bcrypt.generate_password_hash(new_password).decode('utf-8')
    if new_role:
        user.role = new_role

    db.session.commit()
    return jsonify({'message': f'Cập nhật tài khoản trong {dbtype} thành công'}), 200

# Ghi nhận lịch sử thao tác
@auth.route('/log_history', methods=['POST'])
@role_required('Admin')
def log_history():
    data = request.get_json()

    action = data.get('action')
    username = data.get('username')
    target_user = data.get('target_user')
    timestamp_iso = data.get('timestamp')

    # Kiểm tra timestamp đầu vào
    if not timestamp_iso:
        return jsonify({'error': 'Thiếu timestamp'}), 400

    try:
        # Chuyển từ ISO UTC về datetime object
        utc_time = datetime.fromisoformat(timestamp_iso.replace("Z", "+00:00"))

        # Chuyển sang múi giờ Việt Nam
        vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
        vn_time = utc_time.astimezone(vietnam_tz)

    except Exception as e:
        return jsonify({'error': 'Định dạng thời gian không hợp lệ'}), 400

    # Tạo đối tượng History và lưu vào database
    history = History(
        action=action,
        username=username,
        target_user=target_user,
        timestamp=vn_time  # giả sử trường timestamp của bạn dùng DateTime
    )

    db.session.add(history)
    db.session.commit()

    return jsonify({'message': 'Lịch sử được ghi nhận!'}), 200

