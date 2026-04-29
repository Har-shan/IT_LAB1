from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from database import timetable_col, rooms_col, notifications_col, users_col
from datetime import datetime
from functools import wraps

faculty_bp = Blueprint("faculty", __name__)


def require_faculty(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        uid = get_jwt_identity()
        user = users_col().find_one({"_id": ObjectId(uid)})
        if not user or user["role"] != "faculty":
            return jsonify({"error": "Faculty access required"}), 403
        return f(*args, **kwargs)
    return decorated


def entry_to_dict(e):
    return {
        "id": str(e["_id"]),
        "subject_code": e.get("subject_code"),
        "subject_name": e.get("subject_name"),
        "faculty_id": e.get("faculty_id"),
        "faculty_name": e.get("faculty_name"),
        "faculty_website": e.get("faculty_website", ""),
        "room_id": e.get("room_id"),
        "room_name": e.get("room_name"),
        "day": e.get("day"),
        "start_time": e.get("start_time"),
        "end_time": e.get("end_time"),
        "stream": e.get("stream"),
        "section": e.get("section"),
        "semester": e.get("semester"),
        "type": e.get("type"),
    }


def _room_conflict(room_id, day, start, end, exclude_id=None):
    q = {"room_id": room_id, "day": day,
         "start_time": {"$lt": end}, "end_time": {"$gt": start}}
    if exclude_id:
        q["_id"] = {"$ne": ObjectId(exclude_id)}
    return timetable_col().find_one(q)


def _faculty_conflict(faculty_id, day, start, end, exclude_id=None):
    q = {"faculty_id": faculty_id, "day": day,
         "start_time": {"$lt": end}, "end_time": {"$gt": start}}
    if exclude_id:
        q["_id"] = {"$ne": ObjectId(exclude_id)}
    return timetable_col().find_one(q)


def _notify_students(stream, message):
    students = list(users_col().find({"role": "student", "stream": stream}))
    now = datetime.utcnow()
    if students:
        notifications_col().insert_many([
            {"user_id": str(s["_id"]), "message": message,
             "type": "update", "is_read": False, "created_at": now}
            for s in students
        ])


@faculty_bp.route("/entries", methods=["POST"])
@jwt_required()
@require_faculty
def create_entry():
    uid = get_jwt_identity()
    user = users_col().find_one({"_id": ObjectId(uid)})
    data = request.get_json()

    required = ["subject_code", "subject_name", "room_id", "day",
                "start_time", "end_time", "stream", "type"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    room = rooms_col().find_one({"_id": ObjectId(data["room_id"])})
    if not room:
        return jsonify({"error": "Room not found"}), 404

    conflict = _room_conflict(data["room_id"], data["day"], data["start_time"], data["end_time"])
    if conflict:
        return jsonify({"error": f"Room conflict: {room['name']} already booked "
                                  f"{conflict['start_time']}-{conflict['end_time']} on {data['day']}"}), 409

    fac_conflict = _faculty_conflict(uid, data["day"], data["start_time"], data["end_time"])
    if fac_conflict:
        return jsonify({"error": f"You already have {fac_conflict['subject_name']} "
                                  f"{fac_conflict['start_time']}-{fac_conflict['end_time']} on {data['day']}"}), 409

    now = datetime.utcnow()
    doc = {
        "subject_code": data["subject_code"],
        "subject_name": data["subject_name"],
        "faculty_id": uid,
        "faculty_name": user["name"],
        "faculty_website": user.get("website_url", ""),
        "room_id": data["room_id"],
        "room_name": room["name"],
        "day": data["day"],
        "start_time": data["start_time"],
        "end_time": data["end_time"],
        "stream": data["stream"],
        "section": data.get("section"),
        "semester": data.get("semester"),
        "type": data["type"],
        "created_at": now,
        "updated_at": now,
    }
    result = timetable_col().insert_one(doc)
    doc["_id"] = result.inserted_id

    _notify_students(data["stream"],
        f"New class added: {data['subject_name']} on {data['day']} "
        f"{data['start_time']}-{data['end_time']} in {room['name']}")

    return jsonify({"message": "Entry created", "entry": entry_to_dict(doc)}), 201


@faculty_bp.route("/entries/<entry_id>", methods=["PUT"])
@jwt_required()
@require_faculty
def update_entry(entry_id):
    uid = get_jwt_identity()
    entry = timetable_col().find_one({"_id": ObjectId(entry_id)})
    if not entry:
        return jsonify({"error": "Entry not found"}), 404
    if entry["faculty_id"] != uid:
        return jsonify({"error": "You can only edit your own entries"}), 403

    data = request.get_json()
    new_room_id = data.get("room_id", entry["room_id"])
    new_day = data.get("day", entry["day"])
    new_start = data.get("start_time", entry["start_time"])
    new_end = data.get("end_time", entry["end_time"])

    conflict = _room_conflict(new_room_id, new_day, new_start, new_end, exclude_id=entry_id)
    if conflict:
        return jsonify({"error": f"Room conflict with {conflict['subject_name']}"}), 409

    room = rooms_col().find_one({"_id": ObjectId(new_room_id)})
    updates = {
        "subject_code": data.get("subject_code", entry["subject_code"]),
        "subject_name": data.get("subject_name", entry["subject_name"]),
        "room_id": new_room_id,
        "room_name": room["name"] if room else entry["room_name"],
        "day": new_day,
        "start_time": new_start,
        "end_time": new_end,
        "stream": data.get("stream", entry["stream"]),
        "semester": data.get("semester", entry.get("semester")),
        "type": data.get("type", entry["type"]),
        "updated_at": datetime.utcnow(),
    }
    timetable_col().update_one({"_id": ObjectId(entry_id)}, {"$set": updates})

    _notify_students(updates["stream"],
        f"Timetable updated: {entry['subject_name']} rescheduled to "
        f"{new_day} {new_start}-{new_end} in {updates['room_name']}")

    updated = timetable_col().find_one({"_id": ObjectId(entry_id)})
    return jsonify({"message": "Entry updated", "entry": entry_to_dict(updated)}), 200


@faculty_bp.route("/entries/<entry_id>", methods=["DELETE"])
@jwt_required()
@require_faculty
def delete_entry(entry_id):
    uid = get_jwt_identity()
    entry = timetable_col().find_one({"_id": ObjectId(entry_id)})
    if not entry:
        return jsonify({"error": "Entry not found"}), 404
    if entry["faculty_id"] != uid:
        return jsonify({"error": "You can only delete your own entries"}), 403

    _notify_students(entry["stream"],
        f"Class cancelled: {entry['subject_name']} on {entry['day']} "
        f"{entry['start_time']}-{entry['end_time']} has been removed")

    timetable_col().delete_one({"_id": ObjectId(entry_id)})
    return jsonify({"message": "Entry deleted"}), 200


@faculty_bp.route("/profile", methods=["GET"])
@jwt_required()
@require_faculty
def get_profile():
    uid = get_jwt_identity()
    from routes.auth import user_to_dict
    user = users_col().find_one({"_id": ObjectId(uid)})
    return jsonify({"user": user_to_dict(user)}), 200


@faculty_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_faculty():
    from routes.auth import user_to_dict
    faculty = list(users_col().find({"role": "faculty"}))
    return jsonify({"faculty": [user_to_dict(f) for f in faculty]}), 200
