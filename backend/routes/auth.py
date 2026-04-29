from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                 jwt_required, get_jwt_identity)
from bson import ObjectId
from database import users_col
from utils.security import (
    validate_email_domain, validate_password_strength, sanitize_input,
    check_account_lockout, handle_failed_login, reset_failed_login,
    log_audit_event, validate_role, validate_url, generate_verification_token
)
from datetime import datetime
import json

auth_bp = Blueprint("auth", __name__)


def user_to_dict(u):
    return {
        "id": str(u["_id"]),
        "name": u.get("name"),
        "email": u.get("email"),
        "roll_number": u.get("roll_number"),
        "role": u.get("role"),
        "stream": u.get("stream"),
        "department": u.get("department"),
        "section": u.get("section"),
        "semester": u.get("semester"),
        "enrolled_subjects": u.get("enrolled_subjects", []),
        "website_url": u.get("website_url", ""),
        "is_approved": u.get("is_approved", True),
        "is_email_verified": u.get("is_email_verified", False),
        "last_login": u["last_login"].isoformat() if u.get("last_login") else None,
        "created_at": u["created_at"].isoformat() if u.get("created_at") else None,
    }


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = sanitize_input(data.get("name", ""), max_length=100)
    email = sanitize_input(data.get("email", ""), max_length=120).lower()
    password = data.get("password", "")
    role = sanitize_input(data.get("role", ""), max_length=20)
    stream = sanitize_input(data.get("stream"), max_length=30)
    semester = data.get("semester")
    department = sanitize_input(data.get("department"), max_length=100)

    if not all([name, email, password, role]):
        return jsonify({"error": "Missing required fields"}), 400

    if not validate_role(role):
        return jsonify({"error": "Invalid role. Must be student or faculty"}), 400

    is_valid, result = validate_email_domain(email, role)
    if not is_valid:
        return jsonify({"error": result}), 400
    roll_number = result

    is_strong, errors = validate_password_strength(password)
    if not is_strong:
        return jsonify({"error": "Password does not meet requirements", "details": errors}), 400

    col = users_col()
    if col.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400
    if col.find_one({"roll_number": roll_number}):
        return jsonify({"error": "Roll number already registered"}), 400

    now = datetime.utcnow()
    doc = {
        "name": name,
        "email": email,
        "roll_number": roll_number,
        "password": generate_password_hash(password),
        "role": role,
        "stream": stream,
        "department": department,
        "section": None,
        "semester": semester,
        "enrolled_subjects": [],
        "website_url": "",
        "is_approved": True,
        "is_email_verified": False,
        "email_verification_token": generate_verification_token(),
        "failed_login_attempts": 0,
        "account_locked_until": None,
        "last_login": None,
        "last_password_change": now,
        "created_at": now,
        "updated_at": now,
    }
    result = col.insert_one(doc)
    doc["_id"] = result.inserted_id
    log_audit_event(str(result.inserted_id), "registration",
                    json.dumps({"email": email, "role": role}))
    return jsonify({"message": "Registration successful! Please sign in.",
                    "user": user_to_dict(doc)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = sanitize_input(data.get("email", ""), max_length=120).lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    col = users_col()
    user = col.find_one({"email": email})
    if not user:
        log_audit_event(None, "failed_login", json.dumps({"reason": "user_not_found", "email": email}))
        return jsonify({"error": "Invalid email or password"}), 401

    is_locked, msg = check_account_lockout(user)
    if is_locked:
        return jsonify({"error": msg}), 403

    if not check_password_hash(user["password"], password):
        err = handle_failed_login(user, col)
        return jsonify({"error": err}), 401

    if not user.get("is_approved", True):
        return jsonify({"error": "Your account has been suspended. Contact admin."}), 403

    reset_failed_login(user, col)
    uid = str(user["_id"])
    access_token = create_access_token(identity=uid)
    refresh_token = create_refresh_token(identity=uid)
    log_audit_event(uid, "login", json.dumps({"email": email, "role": user["role"]}))
    return jsonify({"access_token": access_token, "refresh_token": refresh_token,
                    "user": user_to_dict(user)}), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    uid = get_jwt_identity()
    return jsonify({"access_token": create_access_token(identity=uid)}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    uid = get_jwt_identity()
    user = users_col().find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user_to_dict(user)}), 200


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    uid = get_jwt_identity()
    col = users_col()
    user = col.find_one({"_id": ObjectId(uid)})
    data = request.get_json()
    old_pw = data.get("old_password", "")
    new_pw = data.get("new_password", "")

    if not check_password_hash(user["password"], old_pw):
        return jsonify({"error": "Current password is incorrect"}), 400
    is_strong, errors = validate_password_strength(new_pw)
    if not is_strong:
        return jsonify({"error": "New password does not meet requirements", "details": errors}), 400
    if check_password_hash(user["password"], new_pw):
        return jsonify({"error": "New password must be different from current password"}), 400

    col.update_one({"_id": ObjectId(uid)}, {"$set": {
        "password": generate_password_hash(new_pw),
        "last_password_change": datetime.utcnow()
    }})
    log_audit_event(uid, "password_change", None)
    return jsonify({"message": "Password updated successfully"}), 200


@auth_bp.route("/update-profile", methods=["PUT"])
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    col = users_col()
    user = col.find_one({"_id": ObjectId(uid)})
    data = request.get_json()
    updates = {"updated_at": datetime.utcnow()}

    if "name" in data and data["name"].strip():
        updates["name"] = sanitize_input(data["name"], max_length=100)
    if user["role"] == "faculty":
        if "website_url" in data:
            ok, url = validate_url(sanitize_input(data["website_url"], max_length=300))
            if not ok:
                return jsonify({"error": url}), 400
            updates["website_url"] = url
        if "department" in data:
            updates["department"] = sanitize_input(data["department"], max_length=100)

    col.update_one({"_id": ObjectId(uid)}, {"$set": updates})

    # Sync faculty name/website to timetable entries
    if user["role"] == "faculty":
        from database import timetable_col
        sync = {}
        if "name" in updates:
            sync["faculty_name"] = updates["name"]
        if "website_url" in updates:
            sync["faculty_website"] = updates["website_url"]
        if sync:
            timetable_col().update_many({"faculty_id": uid}, {"$set": sync})

    updated = col.find_one({"_id": ObjectId(uid)})
    log_audit_event(uid, "profile_update", None)
    return jsonify({"message": "Profile updated successfully", "user": user_to_dict(updated)}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    uid = get_jwt_identity()
    log_audit_event(uid, "logout", None)
    return jsonify({"message": "Logged out successfully"}), 200
