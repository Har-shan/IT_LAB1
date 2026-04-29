"""
MongoDB connection and collection helpers.
All collections are accessed via get_db().
"""
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure
from config import Config

_client = None

def get_client():
    global _client
    if _client is None:
        _client = MongoClient(Config.MONGO_URI)
    return _client

def get_db():
    return get_client()[Config.MONGO_DB_NAME]

# ── Collection accessors ──────────────────────────────────────────────────────

def users_col():
    return get_db()["users"]

def subjects_col():
    return get_db()["subjects"]

def rooms_col():
    return get_db()["rooms"]

def timetable_col():
    return get_db()["timetable_entries"]

def notifications_col():
    return get_db()["notifications"]

def audit_col():
    return get_db()["audit_logs"]

# ── Index creation (called once on startup) ───────────────────────────────────

def create_indexes():
    users_col().create_index("email", unique=True)
    users_col().create_index("roll_number", unique=True)
    subjects_col().create_index([("code", ASCENDING), ("stream", ASCENDING)], unique=True)
    timetable_col().create_index([("stream", ASCENDING), ("day", ASCENDING)])
    timetable_col().create_index("faculty_id")
    audit_col().create_index("created_at")
    notifications_col().create_index([("user_id", ASCENDING), ("is_read", ASCENDING)])
    print("✅ MongoDB indexes created")

def ping():
    try:
        get_client().admin.command("ping")
        return True
    except ConnectionFailure:
        return False
