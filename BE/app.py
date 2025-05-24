from flask import Flask, request
import jwt
from flask_cors import CORS
from config import Config
from models import db
from models.user import User
from routes.auth import auth
from routes.employee_route import employee_bp
from routes.payroll_route import payroll_bp
from flask_bcrypt import Bcrypt
from routes.attendance_route import attendance_bp
from routes.notification_route import notification_bp
from routes.department_jobTitle_route import department_job_title_bp
from routes.report import report_bp



app = Flask(__name__)
app.config.from_object(Config)


bcrypt = Bcrypt(app)
app.bcrypt = bcrypt  # để auth.py có thể dùng lại bcrypt


db.init_app(app)
CORS(app)


@app.before_request
def load_user():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(" ")[1]
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.user = {
                'id': data.get('user_id'),
                'role': data.get('role')
            }
        except Exception:
            request.user = None
    else:
        request.user = None

app.register_blueprint(auth, url_prefix='/api')
app.register_blueprint(employee_bp, url_prefix='/api/employees')
app.register_blueprint(payroll_bp, url_prefix='/api/payrolls')
app.register_blueprint(attendance_bp, url_prefix='/api/attendances')
app.register_blueprint(notification_bp, url_prefix='/api/notifications')
app.register_blueprint(department_job_title_bp, url_prefix='/api/department-job-title')
app.register_blueprint(report_bp, url_prefix='/api')



with app.app_context():
    db.create_all('sqlserver')
    # Thêm tài khoản admin mặc định nếu chưa có
    if not User.query.filter_by(username='admin').first():
        admin_user =User(
        username='admin',
        password=bcrypt.generate_password_hash('admin123').decode('utf-8'),
        role='Admin'
)
        db.session.add(admin_user)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)
