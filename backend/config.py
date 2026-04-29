import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "timetable-secret-key-2026")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-timetable-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ── MongoDB ───────────────────────────────────────────────────────────────
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "scis_timetable")

    # ── Email domain ──────────────────────────────────────────────────────────
    ALLOWED_EMAIL_DOMAIN = "uohyd.ac.in"
    ADMIN_EMAIL_PREFIX = "admin"

    # ── Security ──────────────────────────────────────────────────────────────
    MAX_LOGIN_ATTEMPTS = 5
    ACCOUNT_LOCKOUT_DURATION = timedelta(minutes=30)
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_REQUIRE_UPPERCASE = True
    PASSWORD_REQUIRE_LOWERCASE = True
    PASSWORD_REQUIRE_DIGIT = True
    PASSWORD_REQUIRE_SPECIAL = True
