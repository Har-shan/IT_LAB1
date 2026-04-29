"""Security utilities for validation, sanitization, and audit logging"""
import re
import secrets
from datetime import datetime, timedelta
from flask import request
from config import Config
from models import AuditLog
from extensions import db


def validate_email_domain(email, role):
    """
    Validate that email belongs to @uohyd.ac.in domain
    Admin emails must be admin@uohyd.ac.in
    """
    email = email.lower().strip()
    
    if not email.endswith(f"@{Config.ALLOWED_EMAIL_DOMAIN}"):
        return False, f"Only @{Config.ALLOWED_EMAIL_DOMAIN} emails are allowed"
    
    # Extract the part before @
    local_part = email.split("@")[0]
    
    # Admin validation
    if role == "admin":
        if local_part != Config.ADMIN_EMAIL_PREFIX:
            return False, "Invalid admin email"
    
    # Ensure local part is not empty and contains valid characters
    if not local_part or not re.match(r'^[a-zA-Z0-9._-]+$', local_part):
        return False, "Invalid email format"
    
    return True, local_part  # Return roll number (local part)


def validate_password_strength(password):
    """
    Validate password meets security requirements:
    - Minimum length
    - Contains uppercase, lowercase, digit, special character
    """
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
        errors.append("Password must contain at least one special character (!@#$%^&*...)")
    
    # Check for common weak passwords
    weak_passwords = ['password', '12345678', 'qwerty123', 'admin123', 'welcome123']
    if password.lower() in weak_passwords:
        errors.append("Password is too common. Please choose a stronger password")
    
    return len(errors) == 0, errors


def sanitize_input(text, max_length=None):
    """Sanitize user input to prevent XSS and injection attacks"""
    if not text:
        return text
    
    # Strip whitespace
    text = text.strip()
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Limit length if specified
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text


def generate_verification_token():
    """Generate a secure random token for email verification"""
    return secrets.token_urlsafe(32)


def check_account_lockout(user):
    """
    Check if user account is locked due to failed login attempts
    Returns (is_locked, message)
    """
    if user.account_locked_until and user.account_locked_until > datetime.utcnow():
        remaining = (user.account_locked_until - datetime.utcnow()).total_seconds() / 60
        return True, f"Account locked. Try again in {int(remaining)} minutes"
    
    # Reset lock if time has passed
    if user.account_locked_until and user.account_locked_until <= datetime.utcnow():
        user.account_locked_until = None
        user.failed_login_attempts = 0
        db.session.commit()
    
    return False, None


def handle_failed_login(user):
    """Handle failed login attempt - increment counter and lock if needed"""
    user.failed_login_attempts += 1
    
    if user.failed_login_attempts >= Config.MAX_LOGIN_ATTEMPTS:
        user.account_locked_until = datetime.utcnow() + Config.ACCOUNT_LOCKOUT_DURATION
        db.session.commit()
        return f"Account locked due to {Config.MAX_LOGIN_ATTEMPTS} failed attempts. Try again in 30 minutes"
    
    db.session.commit()
    remaining = Config.MAX_LOGIN_ATTEMPTS - user.failed_login_attempts
    return f"Invalid credentials. {remaining} attempts remaining before account lockout"


def reset_failed_login_attempts(user):
    """Reset failed login attempts on successful login"""
    user.failed_login_attempts = 0
    user.account_locked_until = None
    user.last_login = datetime.utcnow()
    db.session.commit()


def log_audit_event(user_id, action, details=None):
    """
    Log security-relevant events for audit trail
    Actions: login, logout, failed_login, password_change, profile_update, 
             account_locked, suspicious_activity, etc.
    """
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent', '')[:300],
            details=details
        )
        db.session.add(audit_log)
        db.session.commit()
    except Exception as e:
        # Don't let audit logging failure break the application
        print(f"Audit logging failed: {e}")


def get_client_ip():
    """Get client IP address, considering proxies"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    return request.remote_addr


def validate_role(role):
    """Validate that role is one of the allowed values"""
    allowed_roles = ['student', 'faculty', 'admin']
    return role in allowed_roles


def check_password_age(user, max_days=90):
    """
    Check if password is older than max_days
    Returns (needs_change, days_old)
    """
    if not user.last_password_change:
        return False, 0
    
    age = datetime.utcnow() - user.last_password_change
    days_old = age.days
    
    return days_old > max_days, days_old


def validate_url(url):
    """Validate URL format for faculty website"""
    if not url:
        return True, url
    
    url = url.strip()
    
    # Add https:// if no protocol specified
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Basic URL validation
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(url):
        return False, "Invalid URL format"
    
    return True, url
