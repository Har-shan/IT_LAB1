from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from database import timetable_col, subjects_col, rooms_col, notifications_col, users_col

timetable_bp = Blueprint("timetable", __name__)


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


@timetable_bp.route("/", methods=["GET"])
@jwt_required()
def get_timetable():
    q = {}
    if request.args.get("stream"):   q["stream"] = request.args["stream"]
    if request.args.get("semester"): q["semester"] = int(request.args["semester"])
    if request.args.get("day"):      q["day"] = request.args["day"]
    if request.args.get("subject_code"): q["subject_code"] = request.args["subject_code"]
    if request.args.get("faculty_id"):   q["faculty_id"] = request.args["faculty_id"]
    if request.args.get("room_name"):    q["room_name"] = request.args["room_name"]
    if request.args.get("type"):         q["type"] = request.args["type"]

    entries = list(timetable_col().find(q).sort([("day", 1), ("start_time", 1)]))
    return jsonify({"entries": [entry_to_dict(e) for e in entries]}), 200


@timetable_bp.route("/student", methods=["GET"])
@jwt_required()
def get_student_timetable():
    uid = get_jwt_identity()
    user = users_col().find_one({"_id": ObjectId(uid)})
    if not user or user["role"] != "student":
        return jsonify({"error": "Unauthorized"}), 403

    enrolled = user.get("enrolled_subjects", [])
    q = {"stream": user["stream"]}
    if user.get("semester"):
        q["$or"] = [{"semester": user["semester"]}, {"semester": None}]
    if enrolled:
        q["subject_code"] = {"$in": enrolled}
    if request.args.get("day"):
        q["day"] = request.args["day"]

    entries = list(timetable_col().find(q).sort([("day", 1), ("start_time", 1)]))
    return jsonify({"entries": [entry_to_dict(e) for e in entries]}), 200


@timetable_bp.route("/faculty", methods=["GET"])
@jwt_required()
def get_faculty_timetable():
    uid = get_jwt_identity()
    user = users_col().find_one({"_id": ObjectId(uid)})
    if not user or user["role"] != "faculty":
        return jsonify({"error": "Unauthorized"}), 403

    q = {"faculty_id": uid}
    if request.args.get("day"):
        q["day"] = request.args["day"]
    entries = list(timetable_col().find(q).sort([("day", 1), ("start_time", 1)]))
    return jsonify({"entries": [entry_to_dict(e) for e in entries]}), 200


@timetable_bp.route("/subjects", methods=["GET"])
@jwt_required()
def get_subjects():
    q = {}
    if request.args.get("stream"):
        q["stream"] = request.args["stream"]
    subjects = list(subjects_col().find(q))
    return jsonify({"subjects": [
        {"id": str(s["_id"]), "name": s["name"], "code": s["code"],
         "stream": s["stream"], "type": s["type"]}
        for s in subjects
    ]}), 200


@timetable_bp.route("/rooms", methods=["GET"])
@jwt_required()
def get_rooms():
    rooms = list(rooms_col().find())
    return jsonify({"rooms": [
        {"id": str(r["_id"]), "name": r["name"], "capacity": r.get("capacity")}
        for r in rooms
    ]}), 200


@timetable_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    uid = get_jwt_identity()
    notifs = list(notifications_col().find({"user_id": uid})
                  .sort("created_at", -1).limit(20))
    return jsonify({"notifications": [
        {"id": str(n["_id"]), "user_id": n["user_id"], "message": n["message"],
         "type": n["type"], "is_read": n.get("is_read", False),
         "created_at": n["created_at"].isoformat()}
        for n in notifs
    ]}), 200


@timetable_bp.route("/notifications/<notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_read(notif_id):
    uid = get_jwt_identity()
    result = notifications_col().update_one(
        {"_id": ObjectId(notif_id), "user_id": uid},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify({"message": "Marked as read"}), 200
