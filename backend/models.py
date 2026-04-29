from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    roll_number = db.Column(db.String(50), unique=True, nullable=False, index=True)  # extracted from email
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'faculty', 'admin'
    stream = db.Column(db.String(30))
    department = db.Column(db.String(100))
    section = db.Column(db.String(10))
    semester = db.Column(db.Integer)
    enrolled_subjects = db.Column(db.Text)  # comma-separated subject codes
    website_url = db.Column(db.String(300))  # faculty personal/academic website
    is_approved = db.Column(db.Boolean, default=True)  # admin can revoke access
    is_email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(100))
    failed_login_attempts = db.Column(db.Integer, default=0)
    account_locked_until = db.Column(db.DateTime)
    last_login = db.Column(db.DateTime)
    last_password_change = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "roll_number": self.roll_number,
            "role": self.role,
            "stream": self.stream,
            "department": self.department,
            "section": self.section,
            "semester": self.semester,
            "enrolled_subjects": self.enrolled_subjects.split(",") if self.enrolled_subjects else [],
            "website_url": self.website_url or "",
            "is_approved": self.is_approved,
            "is_email_verified": self.is_email_verified,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Subject(db.Model):
    __tablename__ = "subjects"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), nullable=False)
    stream = db.Column(db.String(30))
    type = db.Column(db.String(20))  # 'core' or 'elective'
    
    # Unique constraint on code + stream combination
    __table_args__ = (
        db.UniqueConstraint('code', 'stream', name='uix_code_stream'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "stream": self.stream,
            "type": self.type,
        }


class Room(db.Model):
    __tablename__ = "rooms"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "capacity": self.capacity,
        }


class TimetableEntry(db.Model):
    __tablename__ = "timetable_entries"
    id = db.Column(db.Integer, primary_key=True)
    subject_code = db.Column(db.String(20), nullable=False)
    subject_name = db.Column(db.String(100), nullable=False)
    faculty_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    faculty_name = db.Column(db.String(100))
    faculty_website = db.Column(db.String(300))  # snapshot of faculty website at time of entry
    room_id = db.Column(db.Integer, db.ForeignKey("rooms.id"))
    room_name = db.Column(db.String(50))
    day = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(10), nullable=False)
    end_time = db.Column(db.String(10), nullable=False)
    stream = db.Column(db.String(30), nullable=False)
    section = db.Column(db.String(10))
    semester = db.Column(db.Integer)
    type = db.Column(db.String(20))  # 'core' or 'elective'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "subject_code": self.subject_code,
            "subject_name": self.subject_name,
            "faculty_id": self.faculty_id,
            "faculty_name": self.faculty_name,
            "faculty_website": self.faculty_website or "",
            "room_id": self.room_id,
            "room_name": self.room_name,
            "day": self.day,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "stream": self.stream,
            "section": self.section,
            "semester": self.semester,
            "type": self.type,
        }


class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30))  # 'update', 'reminder', 'info'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }


class AuditLog(db.Model):
    """Security audit log for tracking important actions"""
    __tablename__ = "audit_logs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    action = db.Column(db.String(100), nullable=False)  # 'login', 'logout', 'failed_login', 'password_change', etc.
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(300))
    details = db.Column(db.Text)  # JSON string with additional details
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "ip_address": self.ip_address,
            "details": self.details,
            "created_at": self.created_at.isoformat(),
        }
