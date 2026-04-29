"""
End-to-End Communication Test
Tests: MongoDB <-> Flask Backend <-> HTTP API
Run: python test_e2e.py
"""
import requests
import json
from pymongo import MongoClient
from datetime import datetime

BASE = "http://127.0.0.1:5000/api"
PASS = "\033[92m✅ PASS\033[0m"
FAIL = "\033[91m❌ FAIL\033[0m"
INFO = "\033[94mℹ️ \033[0m"

results = {"pass": 0, "fail": 0}

def check(label, condition, detail=""):
    if condition:
        print(f"  {PASS}  {label}")
        results["pass"] += 1
    else:
        print(f"  {FAIL}  {label}  {detail}")
        results["fail"] += 1
    return condition

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ─────────────────────────────────────────────────────────────
# 1. MONGODB LAYER
# ─────────────────────────────────────────────────────────────
section("LAYER 1 — MongoDB Database")

try:
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=3000)
    client.admin.command("ping")
    db = client["scis_timetable"]
    check("MongoDB is reachable", True)

    cols = db.list_collection_names()
    for col in ["users", "subjects", "rooms", "timetable_entries", "notifications", "audit_logs"]:
        check(f"Collection '{col}' exists", col in cols)

    check("Admin user exists",       db.users.find_one({"role": "admin", "email": "admin@uohyd.ac.in"}) is not None)
    check("24 faculty seeded",       db.users.count_documents({"role": "faculty"}) == 24)
    check("93 subjects seeded",      db.subjects.count_documents({}) == 93)
    check("9 rooms seeded",          db.rooms.count_documents({}) == 9)
    check("120+ timetable entries",  db.timetable_entries.count_documents({}) >= 120)

    check("Index on users.email",       "email_1" in [i["name"] for i in db.users.list_indexes()])
    check("Index on users.roll_number", "roll_number_1" in [i["name"] for i in db.users.list_indexes()])
    check("Index on timetable stream+day", any("stream" in i["name"] for i in db.timetable_entries.list_indexes()))

    # Data integrity checks
    sam = db.users.find_one({"email": "sam@uohyd.ac.in"})
    check("Dr. SAM exists in DB", sam is not None)
    sam_entries = db.timetable_entries.count_documents({"faculty_id": str(sam["_id"])})
    check(f"Dr. SAM has timetable entries ({sam_entries})", sam_entries > 0)

    arundhati = db.users.find_one({"email": "arundhati@uohyd.ac.in"})
    check("Ms. Arundhati exists in DB", arundhati is not None)
    comm_entries = db.timetable_entries.count_documents({"subject_code": "CS490"})
    check(f"Communication Skills entries exist ({comm_entries})", comm_entries > 0)

    nlp_streams = db.timetable_entries.distinct("stream", {"subject_code": "AI474"})
    check(f"NLP in all streams {nlp_streams}", len(nlp_streams) >= 3)

    # Aggregation pipeline test
    pipeline = [{"$group": {"_id": "$stream", "count": {"$sum": 1}}}]
    agg = list(db.timetable_entries.aggregate(pipeline))
    check("Aggregation pipeline works", len(agg) > 0)

except Exception as ex:
    check("MongoDB connection", False, str(ex))

# ─────────────────────────────────────────────────────────────
# 2. FLASK BACKEND LAYER
# ─────────────────────────────────────────────────────────────
section("LAYER 2 — Flask Backend (HTTP API)")

# 2a. Auth — Register
try:
    ts = datetime.utcnow().strftime("%H%M%S")
    reg = requests.post(f"{BASE}/auth/register", json={
        "name": "Test Student",
        "email": f"teststu{ts}@uohyd.ac.in",
        "password": "TestPass@123",
        "role": "student",
        "stream": "M.Tech(CS)",
        "semester": 1
    }, timeout=5)
    check("POST /auth/register (valid)",        reg.status_code == 201, reg.text[:80])
    check("Register returns user object",       "user" in reg.json())
    check("Roll number extracted from email",   reg.json().get("user", {}).get("roll_number") == f"teststu{ts}")

    # Invalid domain
    bad = requests.post(f"{BASE}/auth/register", json={
        "name": "Bad User", "email": "bad@gmail.com",
        "password": "TestPass@123", "role": "student", "stream": "IMT"
    }, timeout=5)
    check("POST /auth/register (wrong domain → 400)", bad.status_code == 400)

    # Weak password
    weak = requests.post(f"{BASE}/auth/register", json={
        "name": "Weak", "email": f"weaktest{ts}@uohyd.ac.in",
        "password": "abc", "role": "student", "stream": "IMT"
    }, timeout=5)
    check("POST /auth/register (weak password → 400)", weak.status_code == 400)

except Exception as ex:
    check("Register endpoint", False, str(ex))

# 2b. Auth — Login
admin_token = None
student_token = None
faculty_token = None

try:
    # Admin login
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "admin@uohyd.ac.in", "password": "Admin@SCIS2026"
    }, timeout=5)
    check("POST /auth/login (admin)",           r.status_code == 200, r.text[:80])
    check("Login returns access_token",         "access_token" in r.json())
    check("Login returns refresh_token",        "refresh_token" in r.json())
    check("Login returns user with role=admin", r.json().get("user", {}).get("role") == "admin")
    admin_token = r.json().get("access_token")

    # Faculty login
    r2 = requests.post(f"{BASE}/auth/login", json={
        "email": "sam@uohyd.ac.in", "password": "Faculty@123"
    }, timeout=5)
    check("POST /auth/login (faculty Dr. SAM)", r2.status_code == 200, r2.text[:80])
    faculty_token = r2.json().get("access_token")

    # Student login (the one we just registered)
    r3 = requests.post(f"{BASE}/auth/login", json={
        "email": f"teststu{ts}@uohyd.ac.in", "password": "TestPass@123"
    }, timeout=5)
    check("POST /auth/login (student)",         r3.status_code == 200, r3.text[:80])
    student_token = r3.json().get("access_token")

    # Wrong password
    r4 = requests.post(f"{BASE}/auth/login", json={
        "email": "admin@uohyd.ac.in", "password": "wrongpass"
    }, timeout=5)
    check("POST /auth/login (wrong password → 401)", r4.status_code == 401)

except Exception as ex:
    check("Login endpoint", False, str(ex))

# 2c. Auth — /me
try:
    ah = {"Authorization": f"Bearer {admin_token}"}
    r = requests.get(f"{BASE}/auth/me", headers=ah, timeout=5)
    check("GET /auth/me (admin)",               r.status_code == 200)
    check("/me returns correct email",          r.json().get("user", {}).get("email") == "admin@uohyd.ac.in")

    # No token → 401
    r2 = requests.get(f"{BASE}/auth/me", timeout=5)
    check("GET /auth/me (no token → 401/422)",  r2.status_code in [401, 422])
except Exception as ex:
    check("/me endpoint", False, str(ex))

# 2d. Timetable endpoints
try:
    ah = {"Authorization": f"Bearer {admin_token}"}

    r = requests.get(f"{BASE}/timetable/", headers=ah, timeout=5)
    check("GET /timetable/ (all entries)",      r.status_code == 200)
    check("Returns 120+ entries",               len(r.json().get("entries", [])) >= 120)

    r2 = requests.get(f"{BASE}/timetable/?stream=M.Tech(CS)", headers=ah, timeout=5)
    check("GET /timetable/?stream=M.Tech(CS)",  r2.status_code == 200)
    check("All entries are M.Tech(CS)",         all(e["stream"] == "M.Tech(CS)" for e in r2.json()["entries"]))

    r3 = requests.get(f"{BASE}/timetable/?day=Monday", headers=ah, timeout=5)
    check("GET /timetable/?day=Monday",         r3.status_code == 200)
    check("All entries are Monday",             all(e["day"] == "Monday" for e in r3.json()["entries"]))

    r4 = requests.get(f"{BASE}/timetable/subjects", headers=ah, timeout=5)
    check("GET /timetable/subjects",            r4.status_code == 200)
    check("Returns 93 subjects",                len(r4.json().get("subjects", [])) == 93)

    r5 = requests.get(f"{BASE}/timetable/rooms", headers=ah, timeout=5)
    check("GET /timetable/rooms",               r5.status_code == 200)
    check("Returns 9 rooms",                    len(r5.json().get("rooms", [])) == 9)

except Exception as ex:
    check("Timetable endpoints", False, str(ex))

# 2e. Faculty timetable
try:
    fh = {"Authorization": f"Bearer {faculty_token}"}
    r = requests.get(f"{BASE}/timetable/faculty", headers=fh, timeout=5)
    check("GET /timetable/faculty (Dr. SAM)",   r.status_code == 200)
    entries = r.json().get("entries", [])
    check(f"Dr. SAM has {len(entries)} entries", len(entries) > 0)
    check("All entries belong to Dr. SAM",      all("SAM" in e.get("faculty_name","") for e in entries))

    # SE on Thursday 11:00-12:00
    thu_se = [e for e in entries if e["day"] == "Thursday" and e["subject_code"] == "CS451"]
    check("Dr. SAM has SE on Thursday",         len(thu_se) > 0)

    # SE Lab on Tuesday
    tue_lab = [e for e in entries if e["day"] == "Tuesday" and e["subject_code"] == "CS453"]
    check("Dr. SAM has SE Lab on Tuesday",      len(tue_lab) > 0)

except Exception as ex:
    check("Faculty timetable", False, str(ex))

# 2f. Student timetable (enroll first)
try:
    sh = {"Authorization": f"Bearer {student_token}"}

    # Enroll in subjects
    enroll = requests.put(f"{BASE}/student/enroll", headers=sh,
        json={"subject_codes": ["CS451", "AI474", "AI473"]}, timeout=5)
    check("PUT /student/enroll",                enroll.status_code == 200)
    check("Enrolled subjects returned",         len(enroll.json().get("enrolled_subjects", [])) > 0)

    # Get student timetable
    r = requests.get(f"{BASE}/timetable/student", headers=sh, timeout=5)
    check("GET /timetable/student",             r.status_code == 200)
    entries = r.json().get("entries", [])
    check(f"Student sees {len(entries)} entries after enroll", len(entries) > 0)
    codes = {e["subject_code"] for e in entries}
    check("Only enrolled subjects shown",       codes.issubset({"CS451", "AI474", "AI473"}))

except Exception as ex:
    check("Student timetable", False, str(ex))

# 2g. Admin endpoints
try:
    ah = {"Authorization": f"Bearer {admin_token}"}

    r = requests.get(f"{BASE}/admin/users", headers=ah, timeout=5)
    check("GET /admin/users",                   r.status_code == 200)
    check("Returns 25+ users",                  len(r.json().get("users", [])) >= 25)

    r2 = requests.get(f"{BASE}/admin/users?role=faculty", headers=ah, timeout=5)
    check("GET /admin/users?role=faculty",      r2.status_code == 200)
    check("Returns 24 faculty",                 len(r2.json().get("users", [])) == 24)

    r3 = requests.get(f"{BASE}/admin/stats", headers=ah, timeout=5)
    check("GET /admin/stats",                   r3.status_code == 200)
    stats = r3.json()
    check("Stats has total_entries",            stats.get("total_entries", 0) >= 120)
    check("Stats has entries_per_programme",    len(stats.get("entries_per_programme", [])) > 0)
    check("Stats has faculty_workload",         len(stats.get("faculty_workload", [])) > 0)

    r4 = requests.get(f"{BASE}/admin/timetable", headers=ah, timeout=5)
    check("GET /admin/timetable",               r4.status_code == 200)

    r5 = requests.get(f"{BASE}/admin/reports/schedule", headers=ah, timeout=5)
    check("GET /admin/reports/schedule",        r5.status_code == 200)

    r6 = requests.get(f"{BASE}/admin/reports/faculty-load", headers=ah, timeout=5)
    check("GET /admin/reports/faculty-load",    r6.status_code == 200)
    report = r6.json().get("report", [])
    check("Faculty load report has entries",    len(report) > 0)
    sam_load = next((x for x in report if "SAM" in x["name"]), None)
    check(f"Dr. SAM load: {sam_load['total_classes'] if sam_load else 0} classes",
          sam_load and sam_load["total_classes"] > 0)

    r7 = requests.get(f"{BASE}/admin/reports/room-utilization", headers=ah, timeout=5)
    check("GET /admin/reports/room-utilization", r7.status_code == 200)

    # Non-admin blocked
    fh = {"Authorization": f"Bearer {faculty_token}"}
    r8 = requests.get(f"{BASE}/admin/users", headers=fh, timeout=5)
    check("Admin route blocked for faculty → 403", r8.status_code == 403)

except Exception as ex:
    check("Admin endpoints", False, str(ex))

# 2h. Token refresh
try:
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "admin@uohyd.ac.in", "password": "Admin@SCIS2026"
    }, timeout=5)
    refresh_token = r.json().get("refresh_token")
    r2 = requests.post(f"{BASE}/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"}, timeout=5)
    check("POST /auth/refresh",                 r2.status_code == 200)
    check("Refresh returns new access_token",   "access_token" in r2.json())
except Exception as ex:
    check("Token refresh", False, str(ex))

# 2i. Audit log written to MongoDB
try:
    audit_count = db.audit_logs.count_documents({})
    check(f"Audit logs written to MongoDB ({audit_count})", audit_count > 0)
    last = db.audit_logs.find_one(sort=[("created_at", -1)])
    check("Audit log has action field",         last and "action" in last)
    check("Audit log has ip_address",           last and "ip_address" in last)
except Exception as ex:
    check("Audit logs", False, str(ex))

# ─────────────────────────────────────────────────────────────
# 3. FRONTEND → BACKEND PROXY
# ─────────────────────────────────────────────────────────────
section("LAYER 3 — Frontend Proxy (port 3000 → 5000)")

try:
    # Detect which port frontend is on
    fe_port = None
    for port in [3000, 3001, 3002]:
        try:
            r = requests.get(f"http://localhost:{port}", timeout=3)
            if r.status_code == 200:
                fe_port = port
                break
        except:
            pass

    check(f"Frontend is reachable (port {fe_port})", fe_port is not None)
    if fe_port:
        r = requests.get(f"http://localhost:{fe_port}", timeout=5)
        check("Returns HTML page", "text/html" in r.headers.get("Content-Type",""))

        # Test proxy: frontend should forward /api/* to backend 5000
        r2 = requests.post(f"http://localhost:{fe_port}/api/auth/login", json={
            "email": "admin@uohyd.ac.in", "password": "Admin@SCIS2026"
        }, timeout=8)
        check("Frontend proxy /api/auth/login works", r2.status_code == 200)
        check("Proxy returns JWT token",              "access_token" in r2.json())

except requests.exceptions.ConnectionError:
    check("Frontend on port 3000", False, "Not reachable — still compiling?")
except Exception as ex:
    check("Frontend proxy", False, str(ex))

# ─────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────
section("SUMMARY")
total = results["pass"] + results["fail"]
pct = int(results["pass"] / total * 100) if total else 0
print(f"\n  Total:  {total}")
print(f"  Passed: {results['pass']}  ({pct}%)")
print(f"  Failed: {results['fail']}")
if results["fail"] == 0:
    print("\n  \033[92m🎉 ALL TESTS PASSED — Full stack is working!\033[0m")
else:
    print(f"\n  \033[91m⚠️  {results['fail']} test(s) failed — check details above\033[0m")
print()
