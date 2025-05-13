
from flask import Blueprint, request, jsonify
from models.user import User,db
from models.history import History,db
from models.payrolls import Payroll,db
from models.employees import Employee,db
from datetime import datetime
import pytz
from flask import current_app


auth = Blueprint('auth', __name__)

# Danh sách các tài khoản
@auth.route('/get_users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "password": u.password,
        "role": u.role
    } for u in users])



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




@auth.route('/get_payrolls', methods=['GET'])
def get_payrolls():
    try:
        # Truy vấn dữ liệu payrolls và thông tin nhân viên với các trường cụ thể
        results = db.session.query(Payroll, Employee).join(Employee).all()

        # Xử lý kết quả truy vấn
        data = []
        for payroll, emp in results:
            data.append({
                "id": payroll.id,
                "employee_id": emp.id,
                "name": emp.name,
                "department": emp.department,
                "job_title": emp.job_title,
                "payroll": str(payroll.amount),
                "time": payroll.time.strftime("%Y-%m-%d %H:%M:%S") if payroll.time else None
            })

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Đăng nhập
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and current_app.bcrypt.check_password_hash(user.password, password):  # So sánh mật khẩu trực tiếp
        return jsonify({
            'message': 'Đăng nhập thành công!',
            'role': user.role.strip().capitalize()

        }), 200
    else:
        return jsonify({'message': 'Tên tài khoản hoặc mật khẩu sai!'}), 401
    

    
#Thêm tài khoản
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'employee').strip().capitalize()  # Mặc định là 'employee' nếu không có giá trị

    # Kiểm tra nếu tài khoản đã tồn tại
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Tài khoản đã tồn tại'}), 400
    
    hashed_password = current_app.bcrypt.generate_password_hash(password).decode('utf-8')


    new_user = User(username=username, password=hashed_password, role=role)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Thêm tài khoản thành công!!'}), 201



# Xóa tài khoản
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

# Cập nhật tài khoản   
@auth.route('/update', methods=['PUT'])
def update_user():
    data = request.get_json()
    old_username = data.get('old_username')  # tên tài khoản hiện tại
    new_username = data.get('new_username')  # tên tài khoản mới
    new_password = data.get('password')
    new_role = data.get('role')

    user = User.query.filter_by(username=old_username).first()

    if not user:
        return jsonify({'message': 'Tài khoản không tồn tại'}), 404

    # Cập nhật các thông tin
    if new_username:
        user.username = new_username
    if new_password:
        user.password = current_app.bcrypt.generate_password_hash(new_password).decode('utf-8')
    if new_role:
        user.role = new_role

    db.session.commit()
    return jsonify({'message': 'Cập nhật tài khoản thành công'}), 200


# Ghi nhận lịch sử thao tác
@auth.route('/log_history', methods=['POST'])
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

