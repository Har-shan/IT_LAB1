from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Subject
from extensions import db

student_bp = Blueprint("student", __name__)

def require_student(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != "student":
            return jsonify({"error": "Student access required"}), 403
        return f(*args, **kwargs)
    return decorated


@student_bp.route("/profile", methods=["GET"])
@jwt_required()
@require_student
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    return jsonify({"user": user.to_dict()}), 200


@student_bp.route("/enroll", methods=["PUT"])
@jwt_required()
@require_student
def update_enrollment():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    data = request.get_json()
    subject_codes = data.get("subject_codes", [])

    # Validate subject codes exist
    valid_subjects = Subject.query.filter(
        Subject.code.in_(subject_codes),
        Subject.stream == user.stream
    ).all()
    valid_codes = [s.code for s in valid_subjects]

    user.enrolled_subjects = ",".join(valid_codes)
    db.session.commit()
    return jsonify({
        "message": "Enrollment updated",
        "enrolled_subjects": valid_codes
    }), 200


@student_bp.route("/subjects", methods=["GET"])
@jwt_required()
@require_student
def get_available_subjects():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    subjects = Subject.query.filter_by(stream=user.stream).all()
    enrolled = user.enrolled_subjects.split(",") if user.enrolled_subjects else []
    result = []
    for s in subjects:
        d = s.to_dict()
        d["enrolled"] = s.code in enrolled
        result.append(d)
    return jsonify({"subjects": result}), 200
