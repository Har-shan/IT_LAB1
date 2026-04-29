from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import User, TimetableEntry, Subject, Room, Notification
from extensions import db
from functools import wraps

admin_bp = Blueprint("admin", __name__)


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated


# ── Dashboard Stats ────────────────────────────────────────────────────────────

@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@require_admin
def get_stats():
    total_users = User.query.count()
    total_faculty = User.query.filter_by(role="faculty").count()
    total_students = User.query.filter_by(role="student").count()
    total_entries = TimetableEntry.query.count()
    total_subjects = Subject.query.count()
    total_rooms = Room.query.count()

    # Entries per programme
    programmes = db.session.query(
        TimetableEntry.stream,
        db.func.count(TimetableEntry.id)
    ).group_by(TimetableEntry.stream).all()

    # Entries per day
    per_day = db.session.query(
        TimetableEntry.day,
        db.func.count(TimetableEntry.id)
    ).group_by(TimetableEntry.day).all()

    # Faculty workload (entries per faculty)
    workload = db.session.query(
        TimetableEntry.faculty_name,
        db.func.count(TimetableEntry.id)
    ).group_by(TimetableEntry.faculty_name).order_by(
        db.func.count(TimetableEntry.id).desc()
    ).limit(10).all()

    return jsonify({
        "total_users": total_users,
        "total_faculty": total_faculty,
        "total_students": total_students,
        "total_entries": total_entries,
        "total_subjects": total_subjects,
        "total_rooms": total_rooms,
        "entries_per_programme": [{"stream": s, "count": c} for s, c in programmes],
        "entries_per_day": [{"day": d, "count": c} for d, c in per_day],
        "faculty_workload": [{"faculty": f, "count": c} for f, c in workload],
    }), 200


# ── User Management ────────────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@require_admin
def get_users():
    role = request.args.get("role")
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
@require_admin
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@require_admin
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if "name" in data:
        user.name = data["name"].strip()
    if "role" in data and data["role"] in ("student", "faculty"):
        user.role = data["role"]
    if "stream" in data:
        user.stream = data["stream"]
    if "section" in data:
        user.section = data["section"]
    if "semester" in data:
        user.semester = data["semester"]
    if "department" in data:
        user.department = data["department"]
    if "is_approved" in data:
        user.is_approved = bool(data["is_approved"])
    if "website_url" in data:
        user.website_url = data["website_url"]

    db.session.commit()

    # Sync faculty name/website to timetable entries
    if user.role == "faculty":
        TimetableEntry.query.filter_by(faculty_id=user.id).update({
            "faculty_name": user.name,
            "faculty_website": user.website_url or ""
        })
        db.session.commit()

    return jsonify({"message": "User updated", "user": user.to_dict()}), 200


@admin_bp.route("/users/<int:user_id>/approve", methods=["PUT"])
@jwt_required()
@require_admin
def toggle_approval(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role == "admin":
        return jsonify({"error": "Cannot modify admin accounts"}), 400

    user.is_approved = not user.is_approved
    db.session.commit()
    status = "approved" if user.is_approved else "suspended"
    return jsonify({"message": f"User {status}", "is_approved": user.is_approved}), 200


@admin_bp.route("/users/<int:user_id>/reset-password", methods=["PUT"])
@jwt_required()
@require_admin
def reset_password(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    new_password = data.get("new_password", "")
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    user.password = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Password reset successfully"}), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role == "admin":
        return jsonify({"error": "Cannot delete admin accounts"}), 400

    # Remove timetable entries if faculty
    if user.role == "faculty":
        TimetableEntry.query.filter_by(faculty_id=user.id).delete()

    # Remove notifications
    Notification.query.filter_by(user_id=user.id).delete()

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


# ── Timetable Management (Admin can manage all entries) ───────────────────────

@admin_bp.route("/timetable", methods=["GET"])
@jwt_required()
@require_admin
def get_all_timetable():
    stream = request.args.get("stream")
    section = request.args.get("section")
    day = request.args.get("day")
    faculty_id = request.args.get("faculty_id")

    query = TimetableEntry.query
    if stream:
        query = query.filter_by(stream=stream)
    if section:
        query = query.filter_by(section=section)
    if day:
        query = query.filter_by(day=day)
    if faculty_id:
        query = query.filter_by(faculty_id=int(faculty_id))

    entries = query.order_by(TimetableEntry.stream, TimetableEntry.day, TimetableEntry.start_time).all()
    return jsonify({"entries": [e.to_dict() for e in entries]}), 200


@admin_bp.route("/timetable", methods=["POST"])
@jwt_required()
@require_admin
def admin_create_entry():
    data = request.get_json()
    required = ["subject_code", "subject_name", "faculty_id", "room_id",
                "day", "start_time", "end_time", "stream", "section", "semester", "type"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    faculty = User.query.get(int(data["faculty_id"]))
    if not faculty:
        return jsonify({"error": "Faculty not found"}), 404

    room = Room.query.get(int(data["room_id"]))
    if not room:
        return jsonify({"error": "Room not found"}), 404

    # Conflict check
    conflict = TimetableEntry.query.filter_by(
        room_id=data["room_id"], day=data["day"]
    ).filter(
        TimetableEntry.start_time < data["end_time"],
        TimetableEntry.end_time > data["start_time"]
    ).first()
    if conflict:
        return jsonify({"error": f"Room conflict: {room.name} already booked {conflict.start_time}-{conflict.end_time} on {data['day']}"}), 409

    entry = TimetableEntry(
        subject_code=data["subject_code"],
        subject_name=data["subject_name"],
        faculty_id=faculty.id,
        faculty_name=faculty.name,
        faculty_website=faculty.website_url or "",
        room_id=room.id,
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
    return jsonify({"message": "Entry created", "entry": entry.to_dict()}), 201


@admin_bp.route("/timetable/<int:entry_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def admin_delete_entry(entry_id):
    entry = TimetableEntry.query.get(entry_id)
    if not entry:
        return jsonify({"error": "Entry not found"}), 404
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Entry deleted"}), 200


# ── Reports ────────────────────────────────────────────────────────────────────

@admin_bp.route("/reports/schedule", methods=["GET"])
@jwt_required()
@require_admin
def schedule_report():
    """Full schedule grouped by programme and day."""
    entries = TimetableEntry.query.order_by(
        TimetableEntry.stream, TimetableEntry.section,
        TimetableEntry.day, TimetableEntry.start_time
    ).all()

    report = {}
    for e in entries:
        key = f"{e.stream} - {e.section}"
        if key not in report:
            report[key] = {}
        if e.day not in report[key]:
            report[key][e.day] = []
        report[key][e.day].append(e.to_dict())

    return jsonify({"report": report}), 200


@admin_bp.route("/reports/faculty-load", methods=["GET"])
@jwt_required()
@require_admin
def faculty_load_report():
    """Hours per faculty per week."""
    faculty_list = User.query.filter_by(role="faculty").all()
    report = []
    for f in faculty_list:
        entries = TimetableEntry.query.filter_by(faculty_id=f.id).all()
        total_hours = sum(
            (int(e.end_time.split(":")[0]) - int(e.start_time.split(":")[0]))
            for e in entries
        )
        report.append({
            "faculty_id": f.id,
            "name": f.name,
            "email": f.email,
            "stream": f.stream,
            "total_classes": len(entries),
            "total_hours_per_week": total_hours,
            "website_url": f.website_url or "",
        })
    report.sort(key=lambda x: x["total_hours_per_week"], reverse=True)
    return jsonify({"report": report}), 200


@admin_bp.route("/reports/room-utilization", methods=["GET"])
@jwt_required()
@require_admin
def room_utilization_report():
    """Usage count per room."""
    rooms = Room.query.all()
    report = []
    for r in rooms:
        count = TimetableEntry.query.filter_by(room_id=r.id).count()
        report.append({
            "room_id": r.id,
            "name": r.name,
            "capacity": r.capacity,
            "total_bookings": count,
        })
    report.sort(key=lambda x: x["total_bookings"], reverse=True)
    return jsonify({"report": report}), 200


# ── Subject & Room Management ──────────────────────────────────────────────────

@admin_bp.route("/subjects", methods=["POST"])
@jwt_required()
@require_admin
def create_subject():
    data = request.get_json()
    from models import Subject
    if Subject.query.filter_by(code=data.get("code")).first():
        return jsonify({"error": "Subject code already exists"}), 400
    subj = Subject(
        name=data["name"], code=data["code"],
        stream=data.get("stream"), type=data.get("type", "core")
    )
    db.session.add(subj)
    db.session.commit()
    return jsonify({"message": "Subject created", "subject": subj.to_dict()}), 201


@admin_bp.route("/subjects/<int:subj_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def delete_subject(subj_id):
    from models import Subject
    subj = Subject.query.get(subj_id)
    if not subj:
        return jsonify({"error": "Subject not found"}), 404
    db.session.delete(subj)
    db.session.commit()
    return jsonify({"message": "Subject deleted"}), 200


@admin_bp.route("/rooms", methods=["POST"])
@jwt_required()
@require_admin
def create_room():
    data = request.get_json()
    room = Room(name=data["name"], capacity=data.get("capacity", 60))
    db.session.add(room)
    db.session.commit()
    return jsonify({"message": "Room created", "room": room.to_dict()}), 201


@admin_bp.route("/rooms/<int:room_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def delete_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404
    db.session.delete(room)
    db.session.commit()
    return jsonify({"message": "Room deleted"}), 200
