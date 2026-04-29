from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from bson import ObjectId
from database import users_col, timetable_col, subjects_col, rooms_col, notifications_col
from datetime import datetime
from functools import wraps

admin_bp = Blueprint("admin", __name__)


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        uid = get_jwt_identity()
        user = users_col().find_one({"_id": ObjectId(uid)})
        if not user or user["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403
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


# ── Stats ─────────────────────────────────────────────────────────────────────

@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@require_admin
def get_stats():
    col_t = timetable_col()

    # Entries per stream
    pipeline_stream = [{"$group": {"_id": "$stream", "count": {"$sum": 1}}}]
    # Entries per day
    pipeline_day = [{"$group": {"_id": "$day", "count": {"$sum": 1}}}]
    # Faculty workload
    pipeline_wl = [
        {"$group": {"_id": "$faculty_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 10}
    ]

    return jsonify({
        "total_users": users_col().count_documents({}),
        "total_faculty": users_col().count_documents({"role": "faculty"}),
        "total_students": users_col().count_documents({"role": "student"}),
        "total_entries": col_t.count_documents({}),
        "total_subjects": subjects_col().count_documents({}),
        "total_rooms": rooms_col().count_documents({}),
        "entries_per_programme": [{"stream": r["_id"], "count": r["count"]}
                                   for r in col_t.aggregate(pipeline_stream)],
        "entries_per_day": [{"day": r["_id"], "count": r["count"]}
                             for r in col_t.aggregate(pipeline_day)],
        "faculty_workload": [{"faculty": r["_id"], "count": r["count"]}
                              for r in col_t.aggregate(pipeline_wl)],
    }), 200


# ── User Management ───────────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@require_admin
def get_users():
    from routes.auth import user_to_dict
    q = {}
    if request.args.get("role"):
        q["role"] = request.args["role"]
    users = list(users_col().find(q).sort("created_at", -1))
    return jsonify({"users": [user_to_dict(u) for u in users]}), 200


@admin_bp.route("/users/<user_id>", methods=["GET"])
@jwt_required()
@require_admin
def get_user(user_id):
    from routes.auth import user_to_dict
    user = users_col().find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user_to_dict(user)}), 200


@admin_bp.route("/users/<user_id>", methods=["PUT"])
@jwt_required()
@require_admin
def update_user(user_id):
    from routes.auth import user_to_dict
    user = users_col().find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    updates = {}
    for field in ["name", "role", "stream", "section", "semester", "department",
                  "is_approved", "website_url"]:
        if field in data:
            updates[field] = data[field]

    if updates:
        users_col().update_one({"_id": ObjectId(user_id)}, {"$set": updates})
        if user["role"] == "faculty" and ("name" in updates or "website_url" in updates):
            sync = {}
            if "name" in updates: sync["faculty_name"] = updates["name"]
            if "website_url" in updates: sync["faculty_website"] = updates["website_url"]
            timetable_col().update_many({"faculty_id": user_id}, {"$set": sync})

    updated = users_col().find_one({"_id": ObjectId(user_id)})
    return jsonify({"message": "User updated", "user": user_to_dict(updated)}), 200


@admin_bp.route("/users/<user_id>/approve", methods=["PUT"])
@jwt_required()
@require_admin
def toggle_approval(user_id):
    user = users_col().find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user["role"] == "admin":
        return jsonify({"error": "Cannot modify admin accounts"}), 400
    new_status = not user.get("is_approved", True)
    users_col().update_one({"_id": ObjectId(user_id)}, {"$set": {"is_approved": new_status}})
    return jsonify({"message": "approved" if new_status else "suspended",
                    "is_approved": new_status}), 200


@admin_bp.route("/users/<user_id>/reset-password", methods=["PUT"])
@jwt_required()
@require_admin
def reset_password(user_id):
    user = users_col().find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json()
    new_pw = data.get("new_password", "")
    if len(new_pw) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    users_col().update_one({"_id": ObjectId(user_id)},
                           {"$set": {"password": generate_password_hash(new_pw)}})
    return jsonify({"message": "Password reset successfully"}), 200


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def delete_user(user_id):
    user = users_col().find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user["role"] == "admin":
        return jsonify({"error": "Cannot delete admin accounts"}), 400
    if user["role"] == "faculty":
        timetable_col().delete_many({"faculty_id": user_id})
    notifications_col().delete_many({"user_id": user_id})
    users_col().delete_one({"_id": ObjectId(user_id)})
    return jsonify({"message": "User deleted"}), 200


# ── Timetable Management ──────────────────────────────────────────────────────

@admin_bp.route("/timetable", methods=["GET"])
@jwt_required()
@require_admin
def get_all_timetable():
    q = {}
    if request.args.get("stream"):    q["stream"] = request.args["stream"]
    if request.args.get("day"):       q["day"] = request.args["day"]
    if request.args.get("faculty_id"): q["faculty_id"] = request.args["faculty_id"]
    entries = list(timetable_col().find(q).sort(
        [("stream", 1), ("day", 1), ("start_time", 1)]))
    return jsonify({"entries": [entry_to_dict(e) for e in entries]}), 200


@admin_bp.route("/timetable", methods=["POST"])
@jwt_required()
@require_admin
def admin_create_entry():
    data = request.get_json()
    required = ["subject_code", "subject_name", "faculty_id", "room_id",
                "day", "start_time", "end_time", "stream", "type"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    faculty = users_col().find_one({"_id": ObjectId(data["faculty_id"])})
    if not faculty:
        return jsonify({"error": "Faculty not found"}), 404
    room = rooms_col().find_one({"_id": ObjectId(data["room_id"])})
    if not room:
        return jsonify({"error": "Room not found"}), 404

    conflict = timetable_col().find_one({
        "room_id": data["room_id"], "day": data["day"],
        "start_time": {"$lt": data["end_time"]},
        "end_time": {"$gt": data["start_time"]}
    })
    if conflict:
        return jsonify({"error": f"Room conflict: {room['name']} already booked "
                                  f"{conflict['start_time']}-{conflict['end_time']} on {data['day']}"}), 409

    now = datetime.utcnow()
    doc = {
        "subject_code": data["subject_code"],
        "subject_name": data["subject_name"],
        "faculty_id": data["faculty_id"],
        "faculty_name": faculty["name"],
        "faculty_website": faculty.get("website_url", ""),
        "room_id": data["room_id"],
        "room_name": room["name"],
        "day": data["day"],
        "start_time": data["start_time"],
        "end_time": data["end_time"],
        "stream": data["stream"],
        "section": data.get("section"),
        "semester": data.get("semester"),
        "type": data["type"],
        "created_at": now, "updated_at": now,
    }
    result = timetable_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return jsonify({"message": "Entry created", "entry": entry_to_dict(doc)}), 201


@admin_bp.route("/timetable/<entry_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def admin_delete_entry(entry_id):
    result = timetable_col().delete_one({"_id": ObjectId(entry_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Entry not found"}), 404
    return jsonify({"message": "Entry deleted"}), 200


# ── Reports ───────────────────────────────────────────────────────────────────

@admin_bp.route("/reports/schedule", methods=["GET"])
@jwt_required()
@require_admin
def schedule_report():
    entries = list(timetable_col().find().sort(
        [("stream", 1), ("day", 1), ("start_time", 1)]))
    report = {}
    for e in entries:
        key = e["stream"]
        report.setdefault(key, {}).setdefault(e["day"], []).append(entry_to_dict(e))
    return jsonify({"report": report}), 200


@admin_bp.route("/reports/faculty-load", methods=["GET"])
@jwt_required()
@require_admin
def faculty_load_report():
    faculty_list = list(users_col().find({"role": "faculty"}))
    report = []
    for f in faculty_list:
        fid = str(f["_id"])
        entries = list(timetable_col().find({"faculty_id": fid}))
        total_hours = sum(
            int(e["end_time"].split(":")[0]) - int(e["start_time"].split(":")[0])
            for e in entries
        )
        report.append({
            "faculty_id": fid,
            "name": f["name"],
            "email": f["email"],
            "department": f.get("department", ""),
            "total_classes": len(entries),
            "total_hours_per_week": total_hours,
        })
    report.sort(key=lambda x: x["total_hours_per_week"], reverse=True)
    return jsonify({"report": report}), 200


@admin_bp.route("/reports/room-utilization", methods=["GET"])
@jwt_required()
@require_admin
def room_utilization_report():
    rooms = list(rooms_col().find())
    report = []
    for r in rooms:
        rid = str(r["_id"])
        count = timetable_col().count_documents({"room_id": rid})
        report.append({"room_id": rid, "name": r["name"],
                        "capacity": r.get("capacity"), "total_bookings": count})
    report.sort(key=lambda x: x["total_bookings"], reverse=True)
    return jsonify({"report": report}), 200


# ── Subject & Room Management ─────────────────────────────────────────────────

@admin_bp.route("/subjects", methods=["POST"])
@jwt_required()
@require_admin
def create_subject():
    data = request.get_json()
    if subjects_col().find_one({"code": data.get("code"), "stream": data.get("stream")}):
        return jsonify({"error": "Subject already exists for this stream"}), 400
    result = subjects_col().insert_one({
        "name": data["name"], "code": data["code"],
        "stream": data.get("stream"), "type": data.get("type", "core")
    })
    return jsonify({"message": "Subject created",
                    "subject": {"id": str(result.inserted_id), **data}}), 201


@admin_bp.route("/subjects/<subj_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def delete_subject(subj_id):
    result = subjects_col().delete_one({"_id": ObjectId(subj_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Subject not found"}), 404
    return jsonify({"message": "Subject deleted"}), 200


@admin_bp.route("/rooms", methods=["POST"])
@jwt_required()
@require_admin
def create_room():
    data = request.get_json()
    result = rooms_col().insert_one({"name": data["name"], "capacity": data.get("capacity", 60)})
    return jsonify({"message": "Room created",
                    "room": {"id": str(result.inserted_id), "name": data["name"],
                             "capacity": data.get("capacity", 60)}}), 201


@admin_bp.route("/rooms/<room_id>", methods=["DELETE"])
@jwt_required()
@require_admin
def delete_room(room_id):
    result = rooms_col().delete_one({"_id": ObjectId(room_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Room not found"}), 404
    return jsonify({"message": "Room deleted"}), 200
