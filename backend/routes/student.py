from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from database import users_col, subjects_col
from functools import wraps

student_bp = Blueprint("student", __name__)


def require_student(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        uid = get_jwt_identity()
        user = users_col().find_one({"_id": ObjectId(uid)})
        if not user or user["role"] != "student":
            return jsonify({"error": "Student access required"}), 403
        return f(*args, **kwargs)
    return decorated


@student_bp.route("/profile", methods=["GET"])
@jwt_required()
@require_student
def get_profile():
    uid = get_jwt_identity()
    from routes.auth import user_to_dict
    user = users_col().find_one({"_id": ObjectId(uid)})
    return jsonify({"user": user_to_dict(user)}), 200


@student_bp.route("/enroll", methods=["PUT"])
@jwt_required()
@require_student
def update_enrollment():
    uid = get_jwt_identity()
    user = users_col().find_one({"_id": ObjectId(uid)})
    data = request.get_json()
    codes = data.get("subject_codes", [])

    # Validate codes exist for this stream
    valid = list(subjects_col().find({"code": {"$in": codes}, "stream": user["stream"]}))
    valid_codes = list({s["code"] for s in valid})

    users_col().update_one({"_id": ObjectId(uid)}, {"$set": {"enrolled_subjects": valid_codes}})
    return jsonify({"message": "Enrollment updated", "enrolled_subjects": valid_codes}), 200


@student_bp.route("/subjects", methods=["GET"])
@jwt_required()
@require_student
def get_available_subjects():
    uid = get_jwt_identity()
    user = users_col().find_one({"_id": ObjectId(uid)})
    subjects = list(subjects_col().find({"stream": user["stream"]}))
    enrolled = user.get("enrolled_subjects", [])
    result = []
    for s in subjects:
        result.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "code": s["code"],
            "stream": s["stream"],
            "type": s["type"],
            "enrolled": s["code"] in enrolled,
        })
    return jsonify({"subjects": result}), 200
