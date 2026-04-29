from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from extensions import db
from routes.auth import auth_bp
from routes.timetable import timetable_bp
from routes.faculty import faculty_bp
from routes.student import student_bp
from routes.admin import admin_bp
from datetime import datetime

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(timetable_bp, url_prefix="/api/timetable")
    app.register_blueprint(faculty_bp, url_prefix="/api/faculty")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    with app.app_context():
        db.create_all()
        seed_data()

    return app

def seed_data():
    from models import User, Subject, Room, TimetableEntry
    from werkzeug.security import generate_password_hash

    if User.query.first():
        return

    # ── Admin account ─────────────────────────────────────────────────────────
    admin = User(
        name="SCIS Admin",
        email="admin@uohyd.ac.in",
        roll_number="admin",
        password=generate_password_hash("Admin@SCIS2026"),
        role="admin",
        stream=None,
        department="SCIS Administration",
        is_approved=True,
        is_email_verified=True,
        last_password_change=datetime.utcnow()
    )
    db.session.add(admin)
    db.session.commit()

    # ── Faculty Members ───────────────────────────────────────────────────────
    faculty_list = [
        ("Dr. SAM", "sam@uohyd.ac.in", "Software Engineering"),
        ("Dr. CB", "cb@uohyd.ac.in", "Image Processing"),
        ("Dr. KSR", "ksr@uohyd.ac.in", "Machine Learning"),
        ("Dr. NRR", "nrr@uohyd.ac.in", "Blockchain & Internet Technologies"),
        ("Dr. DP", "dp@uohyd.ac.in", "Discrete Structures & Security"),
        ("Dr. SKU", "sku@uohyd.ac.in", "Numerical Techniques"),
        ("Dr. TSR", "tsr@uohyd.ac.in", "Database Systems"),
        ("Dr. AS", "as@uohyd.ac.in", "Theory of Computation"),
        ("Dr. NN", "nn@uohyd.ac.in", "Software Engineering"),
        ("Dr. AG", "ag@uohyd.ac.in", "Computer Graphics"),
        ("Dr. AN", "an@uohyd.ac.in", "Computer Networks"),
        ("Dr. AP", "ap@uohyd.ac.in", "Computational Engineering"),
        ("Dr. WN", "wn@uohyd.ac.in", "Software Project Management & Network Security"),
        ("Dr. MAS", "mas@uohyd.ac.in", "System Security & Network Management"),
        ("Dr. BSR", "bsr@uohyd.ac.in", "Deep Learning"),
        ("Dr. PSP", "psp@uohyd.ac.in", "Soft Computing"),
        ("Dr. SNS", "sns@uohyd.ac.in", "Cloud Computing"),
        ("Dr. RW", "rw@uohyd.ac.in", "Virtualization"),
        ("Dr. VN", "vn@uohyd.ac.in", "Natural Language Processing"),
        ("Dr. NKS", "nks@uohyd.ac.in", "Internet of Things"),
        ("Dr. RPL", "rpl@uohyd.ac.in", "Operating Systems"),
        ("Dr. AKD", "akd@uohyd.ac.in", "Data Structures"),
        ("Dr. ASK", "ask@uohyd.ac.in", "Object Oriented Programming"),
        ("Ms. Arundhati", "arundhati@uohyd.ac.in", "Communication Skills"),
    ]
    
    for name, email, dept in faculty_list:
        faculty = User(
            name=name,
            email=email,
            roll_number=email.split('@')[0],
            password=generate_password_hash("Faculty@123"),
            role="faculty",
            stream=None,
            department=dept,
            is_approved=True,
            is_email_verified=True,
            last_password_change=datetime.utcnow()
        )
        db.session.add(faculty)
    db.session.commit()

    # ── SCIS Subjects (Jan 2026) - Complete List ──────────────────────────────
    subjects = [
        # M.Tech(CS) & M.Tech(AI) Core Subjects
        Subject(name="Software Engineering", code="CS451", stream="M.Tech(CS)", type="core"),
        Subject(name="Software Engineering", code="CS451", stream="M.Tech(AI)", type="core"),
        Subject(name="SE Lab", code="CS453", stream="M.Tech(CS)", type="core"),
        Subject(name="SE Lab", code="CS453", stream="M.Tech(AI)", type="core"),
        Subject(name="IT Lab", code="CS452", stream="M.Tech(CS)", type="core"),
        Subject(name="IT Lab", code="CS452", stream="M.Tech(AI)", type="core"),
        Subject(name="Communication Skills", code="CS490", stream="M.Tech(CS)", type="core"),
        Subject(name="Communication Skills", code="CS490", stream="M.Tech(AI)", type="core"),
        
        # Elective Bin E1
        Subject(name="System Security", code="CS473", stream="M.Tech(CS)", type="elective"),
        Subject(name="System Security", code="CS473", stream="M.Tech(AI)", type="elective"),
        Subject(name="System Security", code="CS473", stream="IMT", type="elective"),
        Subject(name="System Security", code="CS473", stream="MCA", type="elective"),
        Subject(name="Network Security", code="CS475", stream="M.Tech(CS)", type="elective"),
        Subject(name="Network Security", code="CS475", stream="M.Tech(AI)", type="elective"),
        Subject(name="Network Security", code="CS475", stream="IMT", type="elective"),
        Subject(name="Network Security", code="CS475", stream="MCA", type="elective"),
        
        # Elective Bin E2
        Subject(name="Deep Learning", code="AI473", stream="M.Tech(CS)", type="elective"),
        Subject(name="Deep Learning", code="AI473", stream="M.Tech(AI)", type="elective"),
        Subject(name="Deep Learning", code="AI473", stream="IMT", type="elective"),
        Subject(name="Deep Learning", code="AI473", stream="MCA", type="elective"),
        Subject(name="Soft Computing", code="CS474", stream="M.Tech(CS)", type="elective"),
        Subject(name="Soft Computing", code="CS474", stream="M.Tech(AI)", type="elective"),
        Subject(name="Soft Computing", code="CS474", stream="IMT", type="elective"),
        Subject(name="Soft Computing", code="CS474", stream="MCA", type="elective"),
        
        # Elective Bin E3
        Subject(name="Machine Learning", code="AI472", stream="M.Tech(CS)", type="elective"),
        Subject(name="Machine Learning", code="AI472", stream="M.Tech(AI)", type="elective"),
        Subject(name="Machine Learning", code="AI472", stream="IMT", type="elective"),
        Subject(name="Machine Learning", code="AI472", stream="MCA", type="elective"),
        Subject(name="Blockchain Technologies", code="CS426", stream="M.Tech(CS)", type="elective"),
        Subject(name="Blockchain Technologies", code="CS426", stream="M.Tech(AI)", type="elective"),
        Subject(name="Blockchain Technologies", code="CS426", stream="IMT", type="elective"),
        Subject(name="Blockchain Technologies", code="CS426", stream="MCA", type="elective"),
        
        # Elective Bin E4
        Subject(name="Advanced Network Management", code="CS472", stream="M.Tech(CS)", type="elective"),
        Subject(name="Advanced Network Management", code="CS472", stream="M.Tech(AI)", type="elective"),
        Subject(name="Advanced Network Management", code="CS472", stream="IMT", type="elective"),
        Subject(name="Advanced Network Management", code="CS472", stream="MCA", type="elective"),
        Subject(name="Cloud Computing", code="CS471", stream="M.Tech(CS)", type="elective"),
        Subject(name="Cloud Computing", code="CS471", stream="M.Tech(AI)", type="elective"),
        Subject(name="Cloud Computing", code="CS471", stream="IMT", type="elective"),
        Subject(name="Cloud Computing", code="CS471", stream="MCA", type="elective"),
        Subject(name="Ethical Hacking & Computer Forensics", code="CS476", stream="M.Tech(CS)", type="elective"),
        Subject(name="Ethical Hacking & Computer Forensics", code="CS476", stream="M.Tech(AI)", type="elective"),
        Subject(name="Ethical Hacking & Computer Forensics", code="CS476", stream="IMT", type="elective"),
        Subject(name="Ethical Hacking & Computer Forensics", code="CS476", stream="MCA", type="elective"),
        
        # Elective Bin E5
        Subject(name="Colour Image Processing", code="CS481", stream="M.Tech(CS)", type="elective"),
        Subject(name="Colour Image Processing", code="CS481", stream="M.Tech(AI)", type="elective"),
        Subject(name="Colour Image Processing", code="CS481", stream="IMT", type="elective"),
        Subject(name="Colour Image Processing", code="CS481", stream="MCA", type="elective"),
        Subject(name="Distributed Data Processing on Cloud", code="CS482", stream="M.Tech(CS)", type="elective"),
        Subject(name="Distributed Data Processing on Cloud", code="CS482", stream="M.Tech(AI)", type="elective"),
        Subject(name="Distributed Data Processing on Cloud", code="CS482", stream="IMT", type="elective"),
        Subject(name="Distributed Data Processing on Cloud", code="CS482", stream="MCA", type="elective"),
        Subject(name="Virtualization", code="CS483", stream="M.Tech(CS)", type="elective"),
        Subject(name="Virtualization", code="CS483", stream="M.Tech(AI)", type="elective"),
        Subject(name="Virtualization", code="CS483", stream="IMT", type="elective"),
        Subject(name="Virtualization", code="CS483", stream="MCA", type="elective"),
        
        # Elective Bin E6 - NLP available for ALL departments
        Subject(name="Natural Language Processing", code="AI474", stream="M.Tech(CS)", type="elective"),
        Subject(name="Natural Language Processing", code="AI474", stream="M.Tech(AI)", type="elective"),
        Subject(name="Natural Language Processing", code="AI474", stream="IMT", type="elective"),
        Subject(name="Natural Language Processing", code="AI474", stream="MCA", type="elective"),
        Subject(name="Internet of Things", code="CS477", stream="M.Tech(CS)", type="elective"),
        Subject(name="Internet of Things", code="CS477", stream="M.Tech(AI)", type="elective"),
        Subject(name="Internet of Things", code="CS477", stream="IMT", type="elective"),
        Subject(name="Internet of Things", code="CS477", stream="MCA", type="elective"),
        
        # IMT II Core
        Subject(name="Discrete & Formal Structures", code="CS211", stream="IMT", type="core"),
        Subject(name="Discrete Mathematics", code="CS212", stream="IMT", type="core"),
        Subject(name="Engineering Physics-2", code="PH201", stream="IMT", type="core"),
        Subject(name="Engineering Mathematics-II", code="MA201", stream="IMT", type="core"),
        Subject(name="Engineering Drawing", code="ME201", stream="IMT", type="core"),
        Subject(name="Creativity & Innovation", code="HU201", stream="IMT", type="core"),
        Subject(name="DFS Lab", code="CS213", stream="IMT", type="core"),
        
        # IMT IV Core
        Subject(name="Computer Based Numerical & Optimization Techniques", code="CS311", stream="IMT", type="core"),
        Subject(name="Database Management Systems", code="CS312", stream="IMT", type="core"),
        Subject(name="Theory of Computation", code="CS313", stream="IMT", type="core"),
        Subject(name="Universal Human Values", code="HU301", stream="IMT", type="core"),
        Subject(name="CBNOT Lab", code="CS314", stream="IMT", type="core"),
        Subject(name="DBMS Lab", code="CS315", stream="IMT", type="core"),
        
        # IMT VI Core
        Subject(name="Software Engineering", code="CS411", stream="IMT", type="core"),
        Subject(name="SE Lab", code="CS413", stream="IMT", type="core"),
        Subject(name="Computer Graphics", code="CS412", stream="IMT", type="core"),
        Subject(name="Computer Networks", code="CS414", stream="IMT", type="core"),
        Subject(name="Computer Graphics Lab", code="CS415", stream="IMT", type="core"),
        Subject(name="IT Lab (CN)", code="CS416", stream="IMT", type="core"),
        Subject(name="Computational Engineering", code="CS417", stream="IMT", type="core"),
        Subject(name="Signals & Systems (Recourse)", code="EC411", stream="IMT", type="core"),
        
        # MCA II Core
        Subject(name="Internet Technologies", code="MCA211", stream="MCA", type="core"),
        Subject(name="Internet Technologies Lab", code="MCA212", stream="MCA", type="core"),
        Subject(name="Data Structures", code="MCA213", stream="MCA", type="core"),
        Subject(name="Data Structures Lab", code="MCA214", stream="MCA", type="core"),
        Subject(name="Object Oriented Programming", code="MCA215", stream="MCA", type="core"),
        Subject(name="OOP Lab", code="MCA216", stream="MCA", type="core"),
        Subject(name="Operating Systems", code="MCA217", stream="MCA", type="core"),
        Subject(name="Software Project Management", code="MCA218", stream="MCA", type="core"),
    ]
    db.session.add_all(subjects)
    db.session.commit()

    # ── SCIS Rooms ────────────────────────────────────────────────────────────
    rooms = [
        Room(name="R-3", capacity=60),
        Room(name="R-6", capacity=60),
        Room(name="R-7", capacity=60),
        Room(name="R-9", capacity=60),
        Room(name="R-10", capacity=60),
        Room(name="R-11", capacity=60),
        Room(name="R-13", capacity=80),
        Room(name="AI Lab", capacity=30),
        Room(name="LHC3F9", capacity=120),
    ]
    db.session.add_all(rooms)
    db.session.commit()

    # Get faculty and room IDs for timetable entries
    sam = User.query.filter_by(email="sam@uohyd.ac.in").first()
    cb = User.query.filter_by(email="cb@uohyd.ac.in").first()
    ksr = User.query.filter_by(email="ksr@uohyd.ac.in").first()
    nrr = User.query.filter_by(email="nrr@uohyd.ac.in").first()
    dp = User.query.filter_by(email="dp@uohyd.ac.in").first()
    sku = User.query.filter_by(email="sku@uohyd.ac.in").first()
    tsr = User.query.filter_by(email="tsr@uohyd.ac.in").first()
    as_prof = User.query.filter_by(email="as@uohyd.ac.in").first()
    nn = User.query.filter_by(email="nn@uohyd.ac.in").first()
    ag = User.query.filter_by(email="ag@uohyd.ac.in").first()
    an = User.query.filter_by(email="an@uohyd.ac.in").first()
    ap = User.query.filter_by(email="ap@uohyd.ac.in").first()
    wn = User.query.filter_by(email="wn@uohyd.ac.in").first()
    mas = User.query.filter_by(email="mas@uohyd.ac.in").first()
    bsr = User.query.filter_by(email="bsr@uohyd.ac.in").first()
    psp = User.query.filter_by(email="psp@uohyd.ac.in").first()
    sns = User.query.filter_by(email="sns@uohyd.ac.in").first()
    rw = User.query.filter_by(email="rw@uohyd.ac.in").first()
    vn = User.query.filter_by(email="vn@uohyd.ac.in").first()
    nks = User.query.filter_by(email="nks@uohyd.ac.in").first()
    rpl = User.query.filter_by(email="rpl@uohyd.ac.in").first()
    akd = User.query.filter_by(email="akd@uohyd.ac.in").first()
    ask = User.query.filter_by(email="ask@uohyd.ac.in").first()
    arundhati = User.query.filter_by(email="arundhati@uohyd.ac.in").first()

    r3 = Room.query.filter_by(name="R-3").first()
    r6 = Room.query.filter_by(name="R-6").first()
    r7 = Room.query.filter_by(name="R-7").first()
    r9 = Room.query.filter_by(name="R-9").first()
    r10 = Room.query.filter_by(name="R-10").first()
    r11 = Room.query.filter_by(name="R-11").first()
    r13 = Room.query.filter_by(name="R-13").first()
    ai_lab = Room.query.filter_by(name="AI Lab").first()
    lhc = Room.query.filter_by(name="LHC3F9").first()

    # ── Timetable Entries (Jan 2026 Schedule) ─────────────────────────────────
    from complete_timetable_seed import add_complete_timetable
    timetable_entries = add_complete_timetable(db, TimetableEntry, User, Room)
    
    db.session.add_all(timetable_entries)
    db.session.commit()
    
    print(f"✅ Seeded {len(timetable_entries)} timetable entries")

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
