"""Security utilities — validation, sanitization, audit logging (MongoDB version)"""
import re
import secrets
from datetime import datetime, timedelta
from flask import request
from config import Config


def validate_email_domain(email, role):
    email = email.lower().strip()
    if not email.endswith(f"@{Config.ALLOWED_EMAIL_DOMAIN}"):
        return False, f"Only @{Config.ALLOWED_EMAIL_DOMAIN} emails are allowed"
    local_part = email.split("@")[0]
    if role == "admin" and local_part != Config.ADMIN_EMAIL_PREFIX:
        return False, "Invalid admin email"
    if not local_part or not re.match(r'^[a-zA-Z0-9._-]+$', local_part):
        return False, "Invalid email format"
    return True, local_part


def validate_password_strength(password):
    errors = []
    if len(password) < Config.PASSWORD_MIN_LENGTH:
        errors.append(f"Password must be at least {Config.PASSWORD_MIN_LENGTH} characters")
    if Config.PASSWORD_REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    if Config.PASSWORD_REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    if Config.PASSWORD_REQUIRE_DIGIT and not re.search(r'\d', password):
        errors.append("Password must contain at least one digit")
    if Config.PASSWORD_REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    weak = ['password', '12345678', 'qwerty123', 'admin123', 'welcome123']
    if password.lower() in weak:
        errors.append("Password is too common")
    return len(errors) == 0, errors


def sanitize_input(text, max_length=None):
    if not text:
        return text
    text = text.strip().replace('\x00', '')
    if max_length and len(text) > max_length:
        text = text[:max_length]
    return text


def generate_verification_token():
    return secrets.token_urlsafe(32)


def check_account_lockout(user_doc):
    locked_until = user_doc.get("account_locked_until")
    if locked_until and locked_until > datetime.utcnow():
        remaining = int((locked_until - datetime.utcnow()).total_seconds() / 60)
        return True, f"Account locked. Try again in {remaining} minutes"
    return False, None


def handle_failed_login(user_doc, users_col):
    attempts = user_doc.get("failed_login_attempts", 0) + 1
    update = {"failed_login_attempts": attempts}
    if attempts >= Config.MAX_LOGIN_ATTEMPTS:
        update["account_locked_until"] = datetime.utcnow() + Config.ACCOUNT_LOCKOUT_DURATION
        users_col.update_one({"_id": user_doc["_id"]}, {"$set": update})
        return f"Account locked due to {Config.MAX_LOGIN_ATTEMPTS} failed attempts. Try again in 30 minutes"
    users_col.update_one({"_id": user_doc["_id"]}, {"$set": update})
    return f"Invalid credentials. {Config.MAX_LOGIN_ATTEMPTS - attempts} attempts remaining before lockout"


def reset_failed_login(user_doc, users_col):
    users_col.update_one({"_id": user_doc["_id"]}, {"$set": {
        "failed_login_attempts": 0,
        "account_locked_until": None,
        "last_login": datetime.utcnow()
    }})


def log_audit_event(user_id, action, details=None):
    try:
        from database import audit_col
        import json
        audit_col().insert_one({
            "user_id": user_id,
            "action": action,
            "ip_address": get_client_ip(),
            "user_agent": request.headers.get("User-Agent", "")[:300],
            "details": details,
            "created_at": datetime.utcnow()
        })
    except Exception as e:
        print(f"Audit log error: {e}")


def get_client_ip():
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0].strip()
    return request.remote_addr


def validate_role(role):
    return role in ("student", "faculty", "admin")


def validate_url(url):
    if not url:
        return True, url
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|localhost|\d{1,3}(?:\.\d{1,3}){3})'
        r'(?::\d+)?(?:/?|[/?]\S+)$', re.IGNORECASE)
    if not pattern.match(url):
        return False, "Invalid URL format"
    return True, url
