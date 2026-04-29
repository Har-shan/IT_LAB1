from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import TimetableEntry, User, Subject, Room, Notification
from extensions import db

timetable_bp = Blueprint("timetable", __name__)

@timetable_bp.route("/", methods=["GET"])
@jwt_required()
def get_timetable():
    stream = request.args.get("stream")
    section = request.args.get("section")
    semester = request.args.get("semester")
    day = request.args.get("day")
    subject_code = request.args.get("subject_code")
    faculty_id = request.args.get("faculty_id")
    room_name = request.args.get("room_name")
    entry_type = request.args.get("type")

    query = TimetableEntry.query
    if stream:
        query = query.filter_by(stream=stream)
    if section:
        query = query.filter_by(section=section)
    if semester:
        query = query.filter_by(semester=int(semester))
    if day:
        query = query.filter_by(day=day)
    if subject_code:
        query = query.filter_by(subject_code=subject_code)
    if faculty_id:
        query = query.filter_by(faculty_id=int(faculty_id))
    if room_name:
        query = query.filter_by(room_name=room_name)
    if entry_type:
        query = query.filter_by(type=entry_type)

    entries = query.order_by(TimetableEntry.day, TimetableEntry.start_time).all()
    return jsonify({"entries": [e.to_dict() for e in entries]}), 200


@timetable_bp.route("/student", methods=["GET"])
@jwt_required()
def get_student_timetable():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != "student":
        return jsonify({"error": "Unauthorized"}), 403

    enrolled = user.enrolled_subjects.split(",") if user.enrolled_subjects else []
    day = request.args.get("day")

    # Build query based on stream and semester (no section)
    query = TimetableEntry.query.filter(
        TimetableEntry.stream == user.stream
    )
    
    # Add semester filter if user has semester
    if user.semester:
        query = query.filter(
            (TimetableEntry.semester == user.semester) | (TimetableEntry.semester == None)
        )
    
    # Filter by enrolled subjects if any
    if enrolled:
        query = query.filter(TimetableEntry.subject_code.in_(enrolled))
    
    if day:
        query = query.filter_by(day=day)

    entries = query.order_by(TimetableEntry.day, TimetableEntry.start_time).all()
    return jsonify({"entries": [e.to_dict() for e in entries]}), 200


@timetable_bp.route("/faculty", methods=["GET"])
@jwt_required()
def get_faculty_timetable():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != "faculty":
        return jsonify({"error": "Unauthorized"}), 403

    day = request.args.get("day")
    query = TimetableEntry.query.filter_by(faculty_id=user.id)
    if day:
        query = query.filter_by(day=day)

    entries = query.order_by(TimetableEntry.day, TimetableEntry.start_time).all()
    return jsonify({"entries": [e.to_dict() for e in entries]}), 200


@timetable_bp.route("/subjects", methods=["GET"])
@jwt_required()
def get_subjects():
    stream = request.args.get("stream")
    query = Subject.query
    if stream:
        query = query.filter_by(stream=stream)
    subjects = query.all()
    return jsonify({"subjects": [s.to_dict() for s in subjects]}), 200


@timetable_bp.route("/rooms", methods=["GET"])
@jwt_required()
def get_rooms():
    rooms = Room.query.all()
    return jsonify({"rooms": [r.to_dict() for r in rooms]}), 200


@timetable_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(
        user_id=int(user_id)
    ).order_by(Notification.created_at.desc()).limit(20).all()
    return jsonify({"notifications": [n.to_dict() for n in notifications]}), 200


@timetable_bp.route("/notifications/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_read(notif_id):
    user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=notif_id, user_id=int(user_id)).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200
