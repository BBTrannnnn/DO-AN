from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from models.user import User
from routes.auth import auth



app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app)

app.register_blueprint(auth, url_prefix='/api')

with app.app_context():
    db.create_all()
    # Thêm tài khoản admin mặc định nếu chưa có
    if not User.query.filter_by(username='admin').first():
        admin_user = User(username='admin', password='admin123', role='Admin')
        db.session.add(admin_user)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)
