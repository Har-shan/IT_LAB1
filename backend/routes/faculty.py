from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import TimetableEntry, User, Room, Subject, Notification
from extensions import db

faculty_bp = Blueprint("faculty", __name__)

def require_faculty(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != "faculty":
            return jsonify({"error": "Faculty access required"}), 403
        return f(*args, **kwargs)
    return decorated


@faculty_bp.route("/entries", methods=["POST"])
@jwt_required()
@require_faculty
def create_entry():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    data = request.get_json()

    required = ["subject_code", "subject_name", "room_id", "day",
                "start_time", "end_time", "stream", "section", "semester", "type"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    # Conflict check: same room, day, overlapping time
    room = Room.query.get(data["room_id"])
    conflict = TimetableEntry.query.filter_by(
        room_id=data["room_id"],
        day=data["day"]
    ).filter(
        TimetableEntry.start_time < data["end_time"],
        TimetableEntry.end_time > data["start_time"]
    ).first()

    if conflict:
        return jsonify({
            "error": f"Room conflict: {room.name} is already booked from "
                     f"{conflict.start_time} to {conflict.end_time} on {data['day']}"
        }), 409

    # Faculty conflict check
    faculty_conflict = TimetableEntry.query.filter_by(
        faculty_id=user.id,
        day=data["day"]
    ).filter(
        TimetableEntry.start_time < data["end_time"],
        TimetableEntry.end_time > data["start_time"]
    ).first()

    if faculty_conflict:
        return jsonify({
            "error": f"You already have {faculty_conflict.subject_name} scheduled "
                     f"from {faculty_conflict.start_time} to {faculty_conflict.end_time} on {data['day']}"
        }), 409

    entry = TimetableEntry(
        subject_code=data["subject_code"],
        subject_name=data["subject_name"],
        faculty_id=user.id,
        faculty_name=user.name,
        faculty_website=user.website_url or "",
        room_id=data["room_id"],
        room_name=room.name,
        day=data["day"],
        start_time=data["start_time"],
        end_time=data["end_time"],
        stream=data["stream"],
        section=data["section"],
        semester=int(data["semester"]),
        type=data["type"],
    )
    db.session.add(entry)
    db.session.commit()

    # Notify students in that stream/section
    students = User.query.filter_by(
        role="student", stream=data["stream"], section=data["section"]
    ).all()
    for student in students:
        notif = Notification(
            user_id=student.id,
            message=f"New class added: {data['subject_name']} on {data['day']} "
                    f"from {data['start_time']} to {data['end_time']} in {room.name}",
            type="update"
        )
        db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Entry created", "entry": entry.to_dict()}), 201


@faculty_bp.route("/entries/<int:entry_id>", methods=["PUT"])
@jwt_required()
@require_faculty
def update_entry(entry_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    entry = TimetableEntry.query.get(entry_id)

    if not entry:
        return jsonify({"error": "Entry not found"}), 404
    if entry.faculty_id != user.id:
        return jsonify({"error": "You can only edit your own entries"}), 403

    data = request.get_json()

    new_room_id = data.get("room_id", entry.room_id)
    new_day = data.get("day", entry.day)
    new_start = data.get("start_time", entry.start_time)
    new_end = data.get("end_time", entry.end_time)

    # Conflict check excluding current entry
    conflict = TimetableEntry.query.filter(
        TimetableEntry.id != entry_id,
        TimetableEntry.room_id == new_room_id,
        TimetableEntry.day == new_day,
        TimetableEntry.start_time < new_end,
        TimetableEntry.end_time > new_start
    ).first()

    if conflict:
        return jsonify({"error": f"Room conflict with {conflict.subject_name}"}), 409

    room = Room.query.get(new_room_id)
    old_info = f"{entry.subject_name} on {entry.day} {entry.start_time}-{entry.end_time}"

    entry.subject_code = data.get("subject_code", entry.subject_code)
    entry.subject_name = data.get("subject_name", entry.subject_name)
    entry.room_id = new_room_id
    entry.room_name = room.name if room else entry.room_name
    entry.day = new_day
    entry.start_time = new_start
    entry.end_time = new_end
    entry.stream = data.get("stream", entry.stream)
    entry.section = data.get("section", entry.section)
    entry.semester = data.get("semester", entry.semester)
    entry.type = data.get("type", entry.type)
    db.session.commit()

    # Notify students
    students = User.query.filter_by(
        role="student", stream=entry.stream, section=entry.section
    ).all()
    for student in students:
        notif = Notification(
            user_id=student.id,
            message=f"Timetable updated: {old_info} has been rescheduled to "
                    f"{entry.day} {entry.start_time}-{entry.end_time} in {entry.room_name}",
            type="update"
        )
        db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Entry updated", "entry": entry.to_dict()}), 200


@faculty_bp.route("/entries/<int:entry_id>", methods=["DELETE"])
@jwt_required()
@require_faculty
def delete_entry(entry_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    entry = TimetableEntry.query.get(entry_id)

    if not entry:
        return jsonify({"error": "Entry not found"}), 404
    if entry.faculty_id != user.id:
        return jsonify({"error": "You can only delete your own entries"}), 403

    # Notify students
    students = User.query.filter_by(
        role="student", stream=entry.stream, section=entry.section
    ).all()
    for student in students:
        notif = Notification(
            user_id=student.id,
            message=f"Class cancelled: {entry.subject_name} on {entry.day} "
                    f"{entry.start_time}-{entry.end_time} has been removed",
            type="update"
        )
        db.session.add(notif)

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Entry deleted"}), 200


@faculty_bp.route("/profile", methods=["GET"])
@jwt_required()
@require_faculty
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    return jsonify({"user": user.to_dict()}), 200


@faculty_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_faculty():
    faculty = User.query.filter_by(role="faculty").all()
    return jsonify({"faculty": [f.to_dict() for f in faculty]}), 200
