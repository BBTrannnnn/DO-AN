from flask import Blueprint, request, jsonify
from models import db
from models.attendances import Attendance
from models.employees import Employee

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/', methods=['GET'])
def get_all_attendance():
    records = Attendance.query.all()
    attendance_list = [r.to_dict() for r in records]
    return jsonify(attendance_list)
    
@attendance_bp.route('/<int:id>', methods=['GET'])
def get_attendance_by_id(id):
    record = Attendance.query.get_or_404(id)
    return jsonify(record.to_dict())

@attendance_bp.route('/', methods=['POST'])
def create_attendance():
    data = request.get_json()
    if not data or 'employee_id' not in data or 'working_days' not in data or 'absence' not in data or 'leave' not in data or 'time' not in data:
        return jsonify({'message': 'Missing required data (employee_id, working_days, absence, leave, time)'}), 400

    employee_id = data['employee_id']
    working_days = data['working_days']
    absence = data['absence']
    leave = data['leave']
    time = data['time']

    # Kiểm tra xem employee_id có tồn tại trong bảng Employees không
    existing_employee = Employee.query.filter_by(id=employee_id).first()
    if not existing_employee:
        return jsonify({'message': f'Employee ID "{employee_id}" không tồn tại!'}), 400

    try:
        new_record = Attendance(
            employee_id=employee_id,
            working_days=working_days,
            absence=absence,
            leave=leave,
            time=time
        )
        db.session.add(new_record)
        db.session.commit()
        return jsonify({'message': 'Attendance added successfully!', 'attendance': new_record.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@attendance_bp.route('/<int:id>', methods=['PUT'])
def update_attendance(id):
    record = Attendance.query.get_or_404(id)
    data = request.get_json()

    record.working_days = data.get('working_days', record.working_days)
    record.absence = data.get('absence', record.absence)
    record.leave = data.get('leave', record.leave)
    record.time = data.get('time', record.time)

    try:
        db.session.commit()
        return jsonify({'message': 'Attendance updated successfully!', 'attendance': record.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@attendance_bp.route('/<int:id>', methods=['DELETE'])
def delete_attendance(id):
    record = Attendance.query.get_or_404(id)
    try:
        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': 'Attendance deleted successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
