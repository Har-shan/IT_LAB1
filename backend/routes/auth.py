from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import User
from extensions import db
from config import Config
from utils.security import (
    validate_email_domain, validate_password_strength, sanitize_input,
    check_account_lockout, handle_failed_login, reset_failed_login_attempts,
    log_audit_event, validate_role, validate_url, generate_verification_token
)
from datetime import datetime
import json

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user with enhanced security validation
    - Email must be @uohyd.ac.in
    - Roll number extracted from email
    - Strong password requirements
    - Input sanitization
    """
    data = request.get_json()
    
    # Sanitize inputs
    name = sanitize_input(data.get("name", ""), max_length=100)
    email = sanitize_input(data.get("email", ""), max_length=120).lower()
    password = data.get("password", "")
    role = sanitize_input(data.get("role", ""), max_length=20)
    stream = sanitize_input(data.get("stream"), max_length=30)
    section = sanitize_input(data.get("section"), max_length=10)
    semester = data.get("semester")
    department = sanitize_input(data.get("department"), max_length=100)
    website_url = sanitize_input(data.get("website_url", ""), max_length=300)

    # Validate required fields
    if not all([name, email, password, role]):
        log_audit_event(None, "failed_registration", json.dumps({"reason": "missing_fields", "email": email}))
        return jsonify({"error": "Missing required fields"}), 400

    # Validate role
    if not validate_role(role):
        log_audit_event(None, "failed_registration", json.dumps({"reason": "invalid_role", "email": email}))
        return jsonify({"error": "Invalid role. Must be student or faculty"}), 400

    # Validate email domain and extract roll number
    is_valid, result = validate_email_domain(email, role)
    if not is_valid:
        log_audit_event(None, "failed_registration", json.dumps({"reason": "invalid_email_domain", "email": email}))
        return jsonify({"error": result}), 400
    
    roll_number = result  # The local part of email becomes roll number

    # Validate password strength
    is_strong, errors = validate_password_strength(password)
    if not is_strong:
        log_audit_event(None, "failed_registration", json.dumps({"reason": "weak_password", "email": email}))
        return jsonify({"error": "Password does not meet requirements", "details": errors}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        log_audit_event(None, "failed_registration", json.dumps({"reason": "email_exists", "email": email}))
        return jsonify({"error": "Email already registered"}), 400
    
    # Check if roll number already exists
    if User.query.filter_by(roll_number=roll_number).first():
        log_audit_event(None, "failed_registration", json.dumps({"reason": "roll_number_exists", "roll_number": roll_number}))
        return jsonify({"error": "Roll number already registered"}), 400

    # Validate faculty website URL if provided
    if role == "faculty" and website_url:
        is_valid_url, validated_url = validate_url(website_url)
        if not is_valid_url:
            return jsonify({"error": validated_url}), 400
        website_url = validated_url

    # Create user
    user = User(
        name=name,
        email=email,
        roll_number=roll_number,
        password=generate_password_hash(password),
        role=role,
        stream=stream,
        section=section,
        semester=semester,
        department=department,
        website_url=website_url if role == "faculty" else None,
        is_approved=True,  # Auto-approve, admin can revoke later
        is_email_verified=False,  # Email verification can be added later
        email_verification_token=generate_verification_token(),
        last_password_change=datetime.utcnow()
    )
    
    db.session.add(user)
    db.session.commit()

    # Log successful registration
    log_audit_event(user.id, "registration", json.dumps({
        "email": email,
        "role": role,
        "roll_number": roll_number
    }))

    return jsonify({
        "message": "Registration successful! Please sign in.",
        "user": user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Enhanced login with security features:
    - Account lockout after failed attempts
    - Audit logging
    - IP tracking
    """
    data = request.get_json()
    email = sanitize_input(data.get("email", ""), max_length=120).lower()
    password = data.get("password", "")

    if not email or not password:
        log_audit_event(None, "failed_login", json.dumps({"reason": "missing_credentials", "email": email}))
        return jsonify({"error": "Email and password required"}), 400

    # Find user
    user = User.query.filter_by(email=email).first()
    if not user:
        log_audit_event(None, "failed_login", json.dumps({"reason": "user_not_found", "email": email}))
        return jsonify({"error": "Invalid email or password"}), 401

    # Check if account is locked
    is_locked, lock_message = check_account_lockout(user)
    if is_locked:
        log_audit_event(user.id, "login_attempt_while_locked", json.dumps({"email": email}))
        return jsonify({"error": lock_message}), 403

    # Verify password
    if not check_password_hash(user.password, password):
        error_message = handle_failed_login(user)
        log_audit_event(user.id, "failed_login", json.dumps({
            "reason": "invalid_password",
            "attempts": user.failed_login_attempts
        }))
        return jsonify({"error": error_message}), 401

    # Check if account is approved
    if not user.is_approved:
        log_audit_event(user.id, "login_attempt_suspended", json.dumps({"email": email}))
        return jsonify({"error": "Your account has been suspended. Contact admin."}), 403

    # Successful login - reset failed attempts
    reset_failed_login_attempts(user)
    
    # Create tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    # Log successful login
    log_audit_event(user.id, "login", json.dumps({
        "email": email,
        "role": user.role
    }))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token"""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    """Get current user information"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    """
    Change password with enhanced security:
    - Validates old password
    - Enforces strong password requirements
    - Logs password change
    """
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    data = request.get_json()
    
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")

    # Verify old password
    if not check_password_hash(user.password, old_password):
        log_audit_event(user.id, "failed_password_change", json.dumps({"reason": "incorrect_old_password"}))
        return jsonify({"error": "Current password is incorrect"}), 400
    
    # Validate new password strength
    is_strong, errors = validate_password_strength(new_password)
    if not is_strong:
        return jsonify({"error": "New password does not meet requirements", "details": errors}), 400
    
    # Check if new password is same as old
    if check_password_hash(user.password, new_password):
        return jsonify({"error": "New password must be different from current password"}), 400

    # Update password
    user.password = generate_password_hash(new_password)
    user.last_password_change = datetime.utcnow()
    db.session.commit()
    
    # Log password change
    log_audit_event(user.id, "password_change", json.dumps({"success": True}))
    
    return jsonify({"message": "Password updated successfully"}), 200


@auth_bp.route("/update-profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Update user profile with input validation
    Faculty can update: name, website_url, department
    Students can update: name
    """
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    data = request.get_json()

    changes = {}

    # Update name
    if "name" in data and data["name"].strip():
        new_name = sanitize_input(data["name"], max_length=100)
        if new_name != user.name:
            user.name = new_name
            changes["name"] = new_name

    # Faculty-specific updates
    if user.role == "faculty":
        if "website_url" in data:
            url = sanitize_input(data["website_url"], max_length=300)
            is_valid_url, validated_url = validate_url(url)
            if not is_valid_url:
                return jsonify({"error": validated_url}), 400
            if validated_url != user.website_url:
                user.website_url = validated_url
                changes["website_url"] = validated_url
        
        if "department" in data:
            new_dept = sanitize_input(data["department"], max_length=100)
            if new_dept != user.department:
                user.department = new_dept
                changes["department"] = new_dept

    user.updated_at = datetime.utcnow()
    db.session.commit()

    # If faculty, sync website_url to their timetable entries
    if user.role == "faculty" and "website_url" in changes:
        from models import TimetableEntry
        TimetableEntry.query.filter_by(faculty_id=user.id).update(
            {"faculty_website": user.website_url, "faculty_name": user.name}
        )
        db.session.commit()

    # Log profile update
    if changes:
        log_audit_event(user.id, "profile_update", json.dumps(changes))

    return jsonify({"message": "Profile updated successfully", "user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Logout endpoint - logs the event
    Note: JWT tokens are stateless, so actual invalidation would require token blacklisting
    """
    user_id = get_jwt_identity()
    log_audit_event(int(user_id), "logout", json.dumps({"success": True}))
    return jsonify({"message": "Logged out successfully"}), 200
