from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
from .employees import Employee
from .attendances import Attendance 
from .department_jobtitle import DepartmentJobTitle
