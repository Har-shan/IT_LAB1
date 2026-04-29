from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import create_indexes, ping, get_db
from routes.auth import auth_bp
from routes.timetable import timetable_bp
from routes.faculty import faculty_bp
from routes.student import student_bp
from routes.admin import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    JWTManager(app)

    app.register_blueprint(auth_bp,       url_prefix="/api/auth")
    app.register_blueprint(timetable_bp,  url_prefix="/api/timetable")
    app.register_blueprint(faculty_bp,    url_prefix="/api/faculty")
    app.register_blueprint(student_bp,    url_prefix="/api/student")
    app.register_blueprint(admin_bp,      url_prefix="/api/admin")

    with app.app_context():
        if not ping():
            raise RuntimeError("❌ Cannot connect to MongoDB. Is it running?")
        print("✅ MongoDB connected")
        create_indexes()
        seed_data()

    return app


# ─────────────────────────────────────────────────────────────────────────────
# SEED DATA
# ─────────────────────────────────────────────────────────────────────────────

def seed_data():
    from werkzeug.security import generate_password_hash
    from database import users_col, subjects_col, rooms_col, timetable_col
    from utils.security import generate_verification_token
    from datetime import datetime

    # Skip if already seeded
    if users_col().find_one({"role": "admin"}):
        print("ℹ️  Database already seeded — skipping")
        return

    now = datetime.utcnow()

    def make_user(name, email, dept, role="faculty"):
        return {
            "name": name, "email": email,
            "roll_number": email.split("@")[0],
            "password": generate_password_hash("Faculty@123" if role == "faculty" else "Admin@SCIS2026"),
            "role": role, "stream": None, "department": dept,
            "section": None, "semester": None, "enrolled_subjects": [],
            "website_url": "", "is_approved": True, "is_email_verified": True,
            "email_verification_token": generate_verification_token(),
            "failed_login_attempts": 0, "account_locked_until": None,
            "last_login": None, "last_password_change": now,
            "created_at": now, "updated_at": now,
        }

    # ── Admin ─────────────────────────────────────────────────────────────────
    admin_doc = make_user("SCIS Admin", "admin@uohyd.ac.in", "SCIS Administration", role="admin")
    admin_doc["password"] = generate_password_hash("Admin@SCIS2026")
    users_col().insert_one(admin_doc)

    # ── Faculty ───────────────────────────────────────────────────────────────
    faculty_data = [
        ("Dr. SAM",       "sam@uohyd.ac.in",       "Software Engineering"),
        ("Dr. CB",        "cb@uohyd.ac.in",         "Image Processing"),
        ("Dr. KSR",       "ksr@uohyd.ac.in",        "Machine Learning"),
        ("Dr. NRR",       "nrr@uohyd.ac.in",        "Blockchain & Internet Technologies"),
        ("Dr. DP",        "dp@uohyd.ac.in",         "Discrete Structures & Security"),
        ("Dr. SKU",       "sku@uohyd.ac.in",        "Numerical Techniques"),
        ("Dr. TSR",       "tsr@uohyd.ac.in",        "Database Systems"),
        ("Dr. AS",        "as@uohyd.ac.in",         "Theory of Computation"),
        ("Dr. NN",        "nn@uohyd.ac.in",         "Software Engineering"),
        ("Dr. AG",        "ag@uohyd.ac.in",         "Computer Graphics"),
        ("Dr. AN",        "an@uohyd.ac.in",         "Computer Networks"),
        ("Dr. AP",        "ap@uohyd.ac.in",         "Computational Engineering"),
        ("Dr. WN",        "wn@uohyd.ac.in",         "Software Project Management & Network Security"),
        ("Dr. MAS",       "mas@uohyd.ac.in",        "System Security & Network Management"),
        ("Dr. BSR",       "bsr@uohyd.ac.in",        "Deep Learning"),
        ("Dr. PSP",       "psp@uohyd.ac.in",        "Soft Computing"),
        ("Dr. SNS",       "sns@uohyd.ac.in",        "Cloud Computing"),
        ("Dr. RW",        "rw@uohyd.ac.in",         "Virtualization"),
        ("Dr. VN",        "vn@uohyd.ac.in",         "Natural Language Processing"),
        ("Dr. NKS",       "nks@uohyd.ac.in",        "Internet of Things"),
        ("Dr. RPL",       "rpl@uohyd.ac.in",        "Operating Systems"),
        ("Dr. AKD",       "akd@uohyd.ac.in",        "Data Structures"),
        ("Dr. ASK",       "ask@uohyd.ac.in",        "Object Oriented Programming"),
        ("Ms. Arundhati", "arundhati@uohyd.ac.in",  "Communication Skills"),
    ]
    users_col().insert_many([make_user(n, e, d) for n, e, d in faculty_data])

    # ── Rooms ─────────────────────────────────────────────────────────────────
    rooms_col().insert_many([
        {"name": "R-3",    "capacity": 60},
        {"name": "R-6",    "capacity": 60},
        {"name": "R-7",    "capacity": 60},
        {"name": "R-9",    "capacity": 60},
        {"name": "R-10",   "capacity": 60},
        {"name": "R-11",   "capacity": 60},
        {"name": "R-13",   "capacity": 80},
        {"name": "AI Lab", "capacity": 30},
        {"name": "LHC3F9", "capacity": 120},
    ])

    # ── Subjects ──────────────────────────────────────────────────────────────
    def subj(name, code, stream, stype):
        return {"name": name, "code": code, "stream": stream, "type": stype}

    subjects = []
    for stream in ["M.Tech(CS)", "M.Tech(AI)"]:
        subjects += [
            subj("Software Engineering",  "CS451", stream, "core"),
            subj("SE Lab",                "CS453", stream, "core"),
            subj("IT Lab",                "CS452", stream, "core"),
            subj("Communication Skills",  "CS490", stream, "core"),
        ]
    for stream in ["M.Tech(CS)", "M.Tech(AI)", "IMT", "MCA"]:
        subjects += [
            # E1
            subj("System Security",                        "CS473", stream, "elective"),
            subj("Network Security",                       "CS475", stream, "elective"),
            # E2
            subj("Deep Learning",                          "AI473", stream, "elective"),
            subj("Soft Computing",                         "CS474", stream, "elective"),
            # E3
            subj("Machine Learning",                       "AI472", stream, "elective"),
            subj("Blockchain Technologies",                "CS426", stream, "elective"),
            # E4
            subj("Advanced Network Management",            "CS472", stream, "elective"),
            subj("Cloud Computing",                        "CS471", stream, "elective"),
            subj("Ethical Hacking & Computer Forensics",   "CS476", stream, "elective"),
            # E5
            subj("Colour Image Processing",                "CS481", stream, "elective"),
            subj("Distributed Data Processing on Cloud",   "CS482", stream, "elective"),
            subj("Virtualization",                         "CS483", stream, "elective"),
            # E6
            subj("Natural Language Processing",            "AI474", stream, "elective"),
            subj("Internet of Things",                     "CS477", stream, "elective"),
        ]
    # IMT core
    subjects += [
        subj("Discrete & Formal Structures",                          "CS211", "IMT", "core"),
        subj("Discrete Mathematics",                                  "CS212", "IMT", "core"),
        subj("Engineering Physics-2",                                 "PH201", "IMT", "core"),
        subj("Engineering Mathematics-II",                            "MA201", "IMT", "core"),
        subj("Engineering Drawing",                                   "ME201", "IMT", "core"),
        subj("Creativity & Innovation",                               "HU201", "IMT", "core"),
        subj("DFS Lab",                                               "CS213", "IMT", "core"),
        subj("Computer Based Numerical & Optimization Techniques",    "CS311", "IMT", "core"),
        subj("Database Management Systems",                           "CS312", "IMT", "core"),
        subj("Theory of Computation",                                 "CS313", "IMT", "core"),
        subj("Universal Human Values",                                "HU301", "IMT", "core"),
        subj("CBNOT Lab",                                             "CS314", "IMT", "core"),
        subj("DBMS Lab",                                              "CS315", "IMT", "core"),
        subj("Software Engineering",                                  "CS411", "IMT", "core"),
        subj("SE Lab",                                                "CS413", "IMT", "core"),
        subj("Computer Graphics",                                     "CS412", "IMT", "core"),
        subj("Computer Networks",                                     "CS414", "IMT", "core"),
        subj("Computer Graphics Lab",                                 "CS415", "IMT", "core"),
        subj("IT Lab (CN)",                                           "CS416", "IMT", "core"),
        subj("Computational Engineering",                             "CS417", "IMT", "core"),
        subj("Signals & Systems (Recourse)",                          "EC411", "IMT", "core"),
    ]
    # MCA core
    subjects += [
        subj("Internet Technologies",     "MCA211", "MCA", "core"),
        subj("Internet Technologies Lab", "MCA212", "MCA", "core"),
        subj("Data Structures",           "MCA213", "MCA", "core"),
        subj("Data Structures Lab",       "MCA214", "MCA", "core"),
        subj("Object Oriented Programming","MCA215", "MCA", "core"),
        subj("OOP Lab",                   "MCA216", "MCA", "core"),
        subj("Operating Systems",         "MCA217", "MCA", "core"),
        subj("Software Project Management","MCA218", "MCA", "core"),
    ]
    subjects_col().insert_many(subjects)

    # ── Timetable entries ─────────────────────────────────────────────────────
    # Build faculty_id lookup  {email_prefix -> str(_id)}
    fac = {}
    for u in users_col().find({"role": "faculty"}):
        fac[u["email"].split("@")[0]] = str(u["_id"])

    # Build room_id lookup  {name -> str(_id)}
    rm = {r["name"]: str(r["_id"]) for r in rooms_col().find()}

    def e(code, name, fkey, rkey, day, start, end, stream, sem=None, t="core"):
        return {
            "subject_code": code, "subject_name": name,
            "faculty_id": fac[fkey], "faculty_name": f"Dr. {fkey.upper()}" if fkey != "arundhati" else "Ms. Arundhati",
            "faculty_website": "",
            "room_id": rm[rkey], "room_name": rkey,
            "day": day, "start_time": start, "end_time": end,
            "stream": stream, "section": None, "semester": sem, "type": t,
            "created_at": now, "updated_at": now,
        }

    entries = []

    # ── MONDAY ────────────────────────────────────────────────────────────────
    for s in ["M.Tech(CS)", "M.Tech(AI)"]:
        entries += [
            e("AI474","Natural Language Processing",      "vn",  "R-13","Monday","09:00","11:00",s,t="elective"),
            e("CS477","Internet of Things",               "nks", "R-3", "Monday","09:00","11:00",s,t="elective"),
            e("CS451","Software Engineering",             "sam", "R-13","Monday","11:00","13:00",s),
            e("CS481","Colour Image Processing",          "cb",  "R-3", "Monday","14:00","16:00",s,t="elective"),
            e("CS482","Distributed Data Processing on Cloud","sns","R-9","Monday","14:00","16:00",s,t="elective"),
            e("CS483","Virtualization",                   "rw",  "R-13","Monday","14:00","16:00",s,t="elective"),
            e("AI473","Deep Learning",                    "bsr", "R-3", "Monday","16:00","18:00",s,t="elective"),
            e("CS474","Soft Computing",                   "psp", "R-9", "Monday","16:00","18:00",s,t="elective"),
        ]
    entries += [
        # IMT II
        e("CS211","Discrete & Formal Structures",         "dp",  "R-10","Monday","09:00","11:00","IMT",2),
        e("CS212","Discrete Mathematics",                 "dp",  "R-10","Monday","11:00","13:00","IMT",2),
        # IMT IV
        e("CS311","Computer Based Numerical & Optimization Techniques","sku","R-11","Monday","09:00","11:00","IMT",4),
        e("CS312","Database Management Systems",          "tsr", "R-11","Monday","11:00","13:00","IMT",4),
        e("CS313","Theory of Computation",                "as",  "R-11","Monday","14:00","16:00","IMT",4),
        # IMT VI
        e("AI474","Natural Language Processing",          "vn",  "R-13","Monday","09:00","11:00","IMT",6,"elective"),
        e("CS411","Software Engineering",                 "nn",  "R-6", "Monday","11:00","13:00","IMT",6),
        e("EC411","Signals & Systems (Recourse)",         "as",  "R-11","Monday","16:00","18:00","IMT",6),
        # IMT VIII
        e("AI474","Natural Language Processing",          "vn",  "R-13","Monday","09:00","11:00","IMT",8,"elective"),
        e("CS481","Colour Image Processing",              "cb",  "R-3", "Monday","14:00","16:00","IMT",8,"elective"),
        e("AI473","Deep Learning",                        "bsr", "R-3", "Monday","16:00","18:00","IMT",8,"elective"),
        # MCA II
        e("MCA212","Internet Technologies Lab",           "nrr", "AI Lab","Monday","09:00","11:00","MCA",2),
        e("CS481","Colour Image Processing",              "cb",  "R-3", "Monday","14:00","16:00","MCA",2,"elective"),
        e("AI473","Deep Learning",                        "bsr", "R-3", "Monday","16:00","18:00","MCA",2,"elective"),
    ]

    # ── TUESDAY ───────────────────────────────────────────────────────────────
    for s in ["M.Tech(CS)", "M.Tech(AI)"]:
        entries += [
            e("CS473","System Security",                  "mas", "R-3", "Tuesday","09:00","11:00",s,"elective"),
            e("CS475","Network Security",                 "wn",  "R-13","Tuesday","09:00","11:00",s,"elective"),
            e("AI472","Machine Learning",                 "ksr", "R-13","Tuesday","11:00","13:00",s,"elective"),
            e("CS426","Blockchain Technologies",          "nrr", "R-3", "Tuesday","11:00","13:00",s,"elective"),
            e("CS453","SE Lab",                           "sam", "AI Lab","Tuesday","14:00","17:00",s),
            e("CS472","Advanced Network Management",      "mas", "R-13","Tuesday","17:00","18:00",s,"elective"),
            e("CS471","Cloud Computing",                  "sns", "R-3", "Tuesday","17:00","18:00",s,"elective"),
            e("CS476","Ethical Hacking & Computer Forensics","dp","R-6","Tuesday","17:00","18:00",s,"elective"),
        ]
    entries += [
        # IMT II
        e("CS211","Discrete & Formal Structures",         "dp",  "R-10","Tuesday","10:00","11:00","IMT",2),
        e("HU201","Creativity & Innovation",              "arundhati","R-10","Tuesday","12:00","16:00","IMT",2),
        # IMT IV
        e("CS313","Theory of Computation",                "as",  "R-11","Tuesday","09:00","10:00","IMT",4),
        e("HU301","Universal Human Values",               "arundhati","R-13","Tuesday","11:00","14:00","IMT",4),
        # IMT VI
        e("CS413","SE Lab",                               "nn",  "AI Lab","Tuesday","10:00","13:00","IMT",6),
        e("CS412","Computer Graphics",                    "ag",  "R-6", "Tuesday","14:00","16:00","IMT",6),
        e("CS414","Computer Networks",                    "an",  "R-6", "Tuesday","16:00","17:00","IMT",6),
        # IMT VIII
        e("CS473","System Security",                      "mas", "R-3", "Tuesday","09:00","11:00","IMT",8,"elective"),
        e("AI472","Machine Learning",                     "ksr", "R-13","Tuesday","11:00","13:00","IMT",8,"elective"),
        e("HU301","Universal Human Values",               "arundhati","R-13","Tuesday","14:00","17:00","IMT",8),
        e("CS472","Advanced Network Management",          "mas", "R-13","Tuesday","17:00","18:00","IMT",8,"elective"),
        # MCA II
        e("CS473","System Security",                      "mas", "R-3", "Tuesday","09:00","11:00","MCA",2,"elective"),
        e("AI472","Machine Learning",                     "ksr", "R-13","Tuesday","11:00","13:00","MCA",2,"elective"),
        e("MCA211","Internet Technologies",               "nrr", "R-7", "Tuesday","14:00","16:00","MCA",2),
        e("MCA217","Operating Systems",                   "rpl", "R-3", "Tuesday","16:00","17:00","MCA",2),
    ]

    # ── WEDNESDAY ─────────────────────────────────────────────────────────────
    entries += [
        e("AI474","Natural Language Processing",          "vn",  "R-13","Wednesday","09:00","11:00","M.Tech(CS)","elective"),
        e("AI473","Deep Learning",                        "bsr", "R-3", "Wednesday","11:00","13:00","M.Tech(CS)","elective"),
        e("CS472","Advanced Network Management",          "mas", "R-13","Wednesday","13:00","14:00","M.Tech(CS)","elective"),
        e("CS452","IT Lab",                               "cb",  "AI Lab","Wednesday","14:00","17:00","M.Tech(CS)"),
        e("AI474","Natural Language Processing",          "vn",  "R-13","Wednesday","09:00","11:00","M.Tech(AI)","elective"),
        e("AI473","Deep Learning",                        "bsr", "R-3", "Wednesday","11:00","13:00","M.Tech(AI)","elective"),
        e("CS472","Advanced Network Management",          "mas", "R-13","Wednesday","13:00","14:00","M.Tech(AI)","elective"),
        e("CS452","IT Lab",                               "ksr", "AI Lab","Wednesday","14:00","17:00","M.Tech(AI)"),
        # IMT II
        e("MA201","Engineering Mathematics-II",           "dp",  "LHC3F9","Wednesday","09:00","10:00","IMT",2),
        e("CS212","Discrete Mathematics",                 "dp",  "R-10","Wednesday","10:00","11:00","IMT",2),
        e("ME201","Engineering Drawing",                  "dp",  "R-10","Wednesday","11:00","14:00","IMT",2),
        # IMT IV
        e("CS315","DBMS Lab",                             "tsr", "AI Lab","Wednesday","10:00","13:00","IMT",4),
        # IMT VI
        e("CS417","Computational Engineering",            "ap",  "R-6", "Wednesday","09:00","11:00","IMT",6),
        # IMT VIII
        e("AI474","Natural Language Processing",          "vn",  "R-13","Wednesday","09:00","11:00","IMT",8,"elective"),
        e("AI473","Deep Learning",                        "bsr", "R-3", "Wednesday","11:00","13:00","IMT",8,"elective"),
        e("CS472","Advanced Network Management",          "mas", "R-13","Wednesday","13:00","14:00","IMT",8,"elective"),
        e("MCA218","Software Project Management",         "wn",  "R-7", "Wednesday","14:00","16:00","IMT",8),
        # MCA II
        e("MCA213","Data Structures",                     "akd", "R-10","Wednesday","09:00","11:00","MCA",2),
        e("AI473","Deep Learning",                        "bsr", "R-3", "Wednesday","11:00","13:00","MCA",2,"elective"),
        e("CS472","Advanced Network Management",          "mas", "R-13","Wednesday","13:00","14:00","MCA",2,"elective"),
        e("MCA217","Operating Systems",                   "rpl", "R-3", "Wednesday","14:00","16:00","MCA",2),
    ]

    # ── THURSDAY ──────────────────────────────────────────────────────────────
    for s in ["M.Tech(CS)", "M.Tech(AI)"]:
        entries += [
            e("CS473","System Security",                  "mas", "R-3", "Thursday","09:00","11:00",s,"elective"),
            e("CS451","Software Engineering",             "sam", "R-13","Thursday","11:00","12:00",s),
            e("CS490","Communication Skills",             "arundhati","R-13","Thursday","12:00","13:00",s),
            e("CS481","Colour Image Processing",          "cb",  "R-3", "Thursday","13:00","15:00",s,"elective"),
        ]
    entries += [
        # IMT II
        e("ME201","Engineering Drawing",                  "dp",  "R-10","Thursday","11:00","14:00","IMT",2),
        # IMT IV
        e("CS311","Computer Based Numerical & Optimization Techniques","sku","R-11","Thursday","09:00","10:00","IMT",4),
        e("CS314","CBNOT Lab",                            "sku", "AI Lab","Thursday","12:00","15:00","IMT",4),
        # IMT VI
        e("CS473","System Security",                      "mas", "R-3", "Thursday","09:00","11:00","IMT",6,"elective"),
        e("CS412","Computer Graphics",                    "ag",  "R-6", "Thursday","11:00","12:00","IMT",6),
        e("CS411","Software Engineering",                 "nn",  "R-6", "Thursday","12:00","13:00","IMT",6),
        e("CS414","Computer Networks",                    "an",  "R-6", "Thursday","13:00","15:00","IMT",6),
        # IMT VIII
        e("CS473","System Security",                      "mas", "R-3", "Thursday","09:00","11:00","IMT",8,"elective"),
        e("CS481","Colour Image Processing",              "cb",  "R-3", "Thursday","13:00","15:00","IMT",8,"elective"),
        # MCA II
        e("MCA216","OOP Lab",                             "ask", "AI Lab","Thursday","09:00","12:00","MCA",2),
        e("MCA215","Object Oriented Programming",         "ask", "R-3", "Thursday","12:00","13:00","MCA",2),
        e("MCA213","Data Structures",                     "akd", "R-10","Thursday","13:00","14:00","MCA",2),
        e("MCA214","Data Structures Lab",                 "akd", "AI Lab","Thursday","14:00","17:00","MCA",2),
    ]

    # ── FRIDAY ────────────────────────────────────────────────────────────────
    for s in ["M.Tech(CS)", "M.Tech(AI)"]:
        entries += [
            e("AI472","Machine Learning",                 "ksr", "R-13","Friday","09:00","11:00",s,"elective"),
            e("CS472","Advanced Network Management",      "mas", "R-13","Friday","11:00","13:00",s,"elective"),
            e("CS490","Communication Skills",             "arundhati","R-13","Friday","13:00","15:00",s),
        ]
    entries += [
        # IMT II
        e("MA201","Engineering Mathematics-II",           "dp",  "LHC3F9","Friday","09:00","11:00","IMT",2),
        e("CS213","DFS Lab",                              "dp",  "AI Lab","Friday","11:00","14:00","IMT",2),
        # IMT IV
        e("CS312","Database Management Systems",          "tsr", "R-11","Friday","11:00","12:00","IMT",4),
        # IMT VI
        e("CS416","IT Lab (CN)",                          "an",  "AI Lab","Friday","09:00","12:00","IMT",6),
        e("CS417","Computational Engineering",            "ap",  "R-6", "Friday","12:00","13:00","IMT",6),
        e("CS415","Computer Graphics Lab",                "ag",  "AI Lab","Friday","13:00","15:00","IMT",6),
        # IMT VIII
        e("AI472","Machine Learning",                     "ksr", "R-13","Friday","09:00","11:00","IMT",8,"elective"),
        e("CS472","Advanced Network Management",          "mas", "R-13","Friday","11:00","13:00","IMT",8,"elective"),
        e("MCA218","Software Project Management",         "wn",  "R-7", "Friday","13:00","14:00","IMT",8),
        # MCA II
        e("AI472","Machine Learning",                     "ksr", "R-13","Friday","09:00","11:00","MCA",2,"elective"),
        e("CS472","Advanced Network Management",          "mas", "R-13","Friday","11:00","13:00","MCA",2,"elective"),
        e("MCA215","Object Oriented Programming",         "ask", "R-3", "Friday","13:00","15:00","MCA",2),
    ]

    timetable_col().insert_many(entries)
    print(f"✅ Seeded: 1 admin, {len(faculty_data)} faculty, {len(subjects)} subjects, "
          f"9 rooms, {len(entries)} timetable entries")


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
