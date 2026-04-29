"""
Complete SCIS Timetable - January 2026
This file contains all timetable entries from the PDF
Run this after the initial seed to add all timetable entries
"""

def add_complete_timetable(db, TimetableEntry, User, Room):
    """Add all timetable entries from SCIS Jan 2026 schedule"""
    
    # Get all faculty
    faculty = {
        'sam': User.query.filter_by(email="sam@uohyd.ac.in").first(),
        'cb': User.query.filter_by(email="cb@uohyd.ac.in").first(),
        'ksr': User.query.filter_by(email="ksr@uohyd.ac.in").first(),
        'nrr': User.query.filter_by(email="nrr@uohyd.ac.in").first(),
        'dp': User.query.filter_by(email="dp@uohyd.ac.in").first(),
        'sku': User.query.filter_by(email="sku@uohyd.ac.in").first(),
        'tsr': User.query.filter_by(email="tsr@uohyd.ac.in").first(),
        'as': User.query.filter_by(email="as@uohyd.ac.in").first(),
        'nn': User.query.filter_by(email="nn@uohyd.ac.in").first(),
        'ag': User.query.filter_by(email="ag@uohyd.ac.in").first(),
        'an': User.query.filter_by(email="an@uohyd.ac.in").first(),
        'ap': User.query.filter_by(email="ap@uohyd.ac.in").first(),
        'wn': User.query.filter_by(email="wn@uohyd.ac.in").first(),
        'mas': User.query.filter_by(email="mas@uohyd.ac.in").first(),
        'bsr': User.query.filter_by(email="bsr@uohyd.ac.in").first(),
        'psp': User.query.filter_by(email="psp@uohyd.ac.in").first(),
        'sns': User.query.filter_by(email="sns@uohyd.ac.in").first(),
        'rw': User.query.filter_by(email="rw@uohyd.ac.in").first(),
        'vn': User.query.filter_by(email="vn@uohyd.ac.in").first(),
        'nks': User.query.filter_by(email="nks@uohyd.ac.in").first(),
        'rpl': User.query.filter_by(email="rpl@uohyd.ac.in").first(),
        'akd': User.query.filter_by(email="akd@uohyd.ac.in").first(),
        'ask': User.query.filter_by(email="ask@uohyd.ac.in").first(),
        'arundhati': User.query.filter_by(email="arundhati@uohyd.ac.in").first(),
    }
    
    # Get all rooms
    rooms = {
        'r3': Room.query.filter_by(name="R-3").first(),
        'r6': Room.query.filter_by(name="R-6").first(),
        'r7': Room.query.filter_by(name="R-7").first(),
        'r9': Room.query.filter_by(name="R-9").first(),
        'r10': Room.query.filter_by(name="R-10").first(),
        'r11': Room.query.filter_by(name="R-11").first(),
        'r13': Room.query.filter_by(name="R-13").first(),
        'ai_lab': Room.query.filter_by(name="AI Lab").first(),
        'lhc': Room.query.filter_by(name="LHC3F9").first(),
    }
    
    entries = []
    
    # Helper function
    def add_entry(code, name, fac_key, room_key, day, start, end, stream, sem=None, type_='core'):
        fac = faculty[fac_key]
        room = rooms[room_key]
        entries.append(TimetableEntry(
            subject_code=code, subject_name=name,
            faculty_id=fac.id, faculty_name=fac.name,
            room_id=room.id, room_name=room.name,
            day=day, start_time=start, end_time=end,
            stream=stream, semester=sem, type=type_
        ))
    
    # ========== MONDAY ==========
    
    # M.Tech(CS) & M.Tech(AI) - Monday
    for stream in ['M.Tech(CS)', 'M.Tech(AI)']:
        # E6: NLP (VN, R-13) & IOT (NKS, R-3) 09:00-11:00
        add_entry('AI474', 'Natural Language Processing', 'vn', 'r13', 'Monday', '09:00', '11:00', stream, type_='elective')
        add_entry('CS477', 'Internet of Things', 'nks', 'r3', 'Monday', '09:00', '11:00', stream, type_='elective')
        
        # SE (SAM, R-13) 11:00-13:00
        add_entry('CS451', 'Software Engineering', 'sam', 'r13', 'Monday', '11:00', '13:00', stream)
        
        # E5: CIP (CB, R-3), DDPC (SNS, R-9), VIR (RW, R-13) 14:00-16:00
        add_entry('CS481', 'Colour Image Processing', 'cb', 'r3', 'Monday', '14:00', '16:00', stream, type_='elective')
        add_entry('CS482', 'Distributed Data Processing on Cloud', 'sns', 'r9', 'Monday', '14:00', '16:00', stream, type_='elective')
        add_entry('CS483', 'Virtualization', 'rw', 'r13', 'Monday', '14:00', '16:00', stream, type_='elective')
        
        # E2: DL (BSR, R-3), SC (PSP, R-9) 16:00-18:00
        add_entry('AI473', 'Deep Learning', 'bsr', 'r3', 'Monday', '16:00', '18:00', stream, type_='elective')
        add_entry('CS474', 'Soft Computing', 'psp', 'r9', 'Monday', '16:00', '18:00', stream, type_='elective')
    
    # IMT II - Monday
    add_entry('CS211', 'Discrete & Formal Structures', 'dp', 'r10', 'Monday', '09:00', '11:00', 'IMT', 2)
    add_entry('CS212', 'Discrete Mathematics', 'dp', 'r10', 'Monday', '11:00', '13:00', 'IMT', 2)
    
    # IMT IV - Monday
    add_entry('CS311', 'Computer Based Numerical & Optimization Techniques', 'sku', 'r11', 'Monday', '09:00', '11:00', 'IMT', 4)
    add_entry('CS312', 'Database Management Systems', 'tsr', 'r11', 'Monday', '11:00', '13:00', 'IMT', 4)
    add_entry('CS313', 'Theory of Computation', 'as', 'r11', 'Monday', '14:00', '16:00', 'IMT', 4)
    
    # IMT VI - Monday
    add_entry('AI474', 'Natural Language Processing', 'vn', 'r13', 'Monday', '09:00', '11:00', 'IMT', 6, 'elective')
    add_entry('CS411', 'Software Engineering', 'nn', 'r6', 'Monday', '11:00', '13:00', 'IMT', 6)
    
    # IMT VIII - Monday (same as M.Tech electives)
    add_entry('AI474', 'Natural Language Processing', 'vn', 'r13', 'Monday', '09:00', '11:00', 'IMT', 8, 'elective')
    add_entry('CS481', 'Colour Image Processing', 'cb', 'r3', 'Monday', '14:00', '16:00', 'IMT', 8, 'elective')
    add_entry('AI473', 'Deep Learning', 'bsr', 'r3', 'Monday', '16:00', '18:00', 'IMT', 8, 'elective')
    
    # MCA II - Monday
    add_entry('MCA212', 'Internet Technologies Lab', 'nrr', 'ai_lab', 'Monday', '09:00', '11:00', 'MCA', 2)
    add_entry('CS481', 'Colour Image Processing', 'cb', 'r3', 'Monday', '14:00', '16:00', 'MCA', 2, 'elective')
    add_entry('AI473', 'Deep Learning', 'bsr', 'r3', 'Monday', '16:00', '18:00', 'MCA', 2, 'elective')
    
    # ========== TUESDAY ==========
    
    # M.Tech(CS) & M.Tech(AI) - Tuesday
    for stream in ['M.Tech(CS)', 'M.Tech(AI)']:
        # E1: SS (MAS, R-3), NS (WN, R-13) 09:00-11:00
        add_entry('CS473', 'System Security', 'mas', 'r3', 'Tuesday', '09:00', '11:00', stream, type_='elective')
        add_entry('CS475', 'Network Security', 'wn', 'r13', 'Tuesday', '09:00', '11:00', stream, type_='elective')
        
        # E3: ML (KSR, R-13), BCT (NRR, R-3) 11:00-13:00
        add_entry('AI472', 'Machine Learning', 'ksr', 'r13', 'Tuesday', '11:00', '13:00', stream, type_='elective')
        add_entry('CS426', 'Blockchain Technologies', 'nrr', 'r3', 'Tuesday', '11:00', '13:00', stream, type_='elective')
        
        # SE Lab (SAM, AI Lab) 14:00-17:00
        add_entry('CS453', 'SE Lab', 'sam', 'ai_lab', 'Tuesday', '14:00', '17:00', stream)
        
        # E4: ANM (MAS, R-13), CC (SNS, R-3), EHCF (DP, R-6) 17:00-18:00
        add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Tuesday', '17:00', '18:00', stream, type_='elective')
        add_entry('CS471', 'Cloud Computing', 'sns', 'r3', 'Tuesday', '17:00', '18:00', stream, type_='elective')
        add_entry('CS476', 'Ethical Hacking & Computer Forensics', 'dp', 'r6', 'Tuesday', '17:00', '18:00', stream, type_='elective')
    
    # IMT II - Tuesday
    add_entry('CS211', 'Discrete & Formal Structures', 'dp', 'r10', 'Tuesday', '10:00', '11:00', 'IMT', 2)
    add_entry('HU201', 'Creativity & Innovation', 'arundhati', 'r10', 'Tuesday', '12:00', '16:00', 'IMT', 2)
    
    # IMT IV - Tuesday
    add_entry('CS313', 'Theory of Computation', 'as', 'r11', 'Tuesday', '09:00', '10:00', 'IMT', 4)
    add_entry('HU301', 'Universal Human Values', 'arundhati', 'r13', 'Tuesday', '11:00', '14:00', 'IMT', 4)
    
    # IMT VI - Tuesday
    add_entry('CS413', 'SE Lab', 'nn', 'ai_lab', 'Tuesday', '10:00', '13:00', 'IMT', 6)
    add_entry('CS412', 'Computer Graphics', 'ag', 'r6', 'Tuesday', '14:00', '16:00', 'IMT', 6)
    add_entry('CS414', 'Computer Networks', 'an', 'r6', 'Tuesday', '16:00', '17:00', 'IMT', 6)
    
    # IMT VIII - Tuesday
    add_entry('CS473', 'System Security', 'mas', 'r3', 'Tuesday', '09:00', '11:00', 'IMT', 8, 'elective')
    add_entry('AI472', 'Machine Learning', 'ksr', 'r13', 'Tuesday', '11:00', '13:00', 'IMT', 8, 'elective')
    add_entry('HU301', 'Universal Human Values', 'arundhati', 'r13', 'Tuesday', '14:00', '17:00', 'IMT', 8)
    add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Tuesday', '17:00', '18:00', 'IMT', 8, 'elective')
    
    # MCA II - Tuesday
    add_entry('CS473', 'System Security', 'mas', 'r3', 'Tuesday', '09:00', '11:00', 'MCA', 2, 'elective')
    add_entry('AI472', 'Machine Learning', 'ksr', 'r13', 'Tuesday', '11:00', '13:00', 'MCA', 2, 'elective')
    add_entry('MCA211', 'Internet Technologies', 'nrr', 'r7', 'Tuesday', '14:00', '16:00', 'MCA', 2)
    add_entry('MCA217', 'Operating Systems', 'rpl', 'r3', 'Tuesday', '16:00', '17:00', 'MCA', 2)
    
    # ========== WEDNESDAY ==========
    
    # M.Tech(CS) - Wednesday
    add_entry('AI474', 'Natural Language Processing', 'vn', 'r13', 'Wednesday', '09:00', '11:00', 'M.Tech(CS)', type_='elective')
    add_entry('AI473', 'Deep Learning', 'bsr', 'r3', 'Wednesday', '11:00', '13:00', 'M.Tech(CS)', type_='elective')
    add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Wednesday', '13:00', '14:00', 'M.Tech(CS)', type_='elective')
    add_entry('CS452', 'IT Lab', 'cb', 'ai_lab', 'Wednesday', '14:00', '17:00', 'M.Tech(CS)')
    
    # M.Tech(AI) - Wednesday
    add_entry('AI474', 'Natural Language Processing', 'vn', 'r13', 'Wednesday', '09:00', '11:00', 'M.Tech(AI)', type_='elective')
    add_entry('AI473', 'Deep Learning', 'bsr', 'r3', 'Wednesday', '11:00', '13:00', 'M.Tech(AI)', type_='elective')
    add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Wednesday', '13:00', '14:00', 'M.Tech(AI)', type_='elective')
    add_entry('CS452', 'IT Lab', 'ksr', 'ai_lab', 'Wednesday', '14:00', '17:00', 'M.Tech(AI)')
    
    # IMT II - Wednesday
    add_entry('MA201', 'Engineering Mathematics-II', 'dp', 'lhc', 'Wednesday', '09:00', '10:00', 'IMT', 2)
    add_entry('CS212', 'Discrete Mathematics', 'dp', 'r10', 'Wednesday', '10:00', '11:00', 'IMT', 2)
    add_entry('ME201', 'Engineering Drawing', 'dp', 'r10', 'Wednesday', '11:00', '14:00', 'IMT', 2)
    
    # IMT IV - Wednesday
    add_entry('CS315', 'DBMS Lab', 'tsr', 'ai_lab', 'Wednesday', '10:00', '13:00', 'IMT', 4)
    
    # IMT VI - Wednesday
    add_entry('CS417', 'Computational Engineering', 'ap', 'r6', 'Wednesday', '09:00', '11:00', 'IMT', 6)
    
    # IMT VIII - Wednesday
    add_entry('AI474', 'Natural Language Processing', 'vn', 'r13', 'Wednesday', '09:00', '11:00', 'IMT', 8, 'elective')
    add_entry('AI473', 'Deep Learning', 'bsr', 'r3', 'Wednesday', '11:00', '13:00', 'IMT', 8, 'elective')
    add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Wednesday', '13:00', '14:00', 'IMT', 8, 'elective')
    add_entry('MCA218', 'Software Project Management', 'wn', 'r7', 'Wednesday', '14:00', '16:00', 'IMT', 8)
    
    # MCA II - Wednesday
    add_entry('MCA213', 'Data Structures', 'akd', 'r10', 'Wednesday', '09:00', '11:00', 'MCA', 2)
    add_entry('AI473', 'Deep Learning', 'bsr', 'r3', 'Wednesday', '11:00', '13:00', 'MCA', 2, 'elective')
    add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Wednesday', '13:00', '14:00', 'MCA', 2, 'elective')
    add_entry('MCA217', 'Operating Systems', 'rpl', 'r3', 'Wednesday', '14:00', '16:00', 'MCA', 2)
    
    # ========== THURSDAY ==========
    
    # M.Tech(CS) & M.Tech(AI) - Thursday
    for stream in ['M.Tech(CS)', 'M.Tech(AI)']:
        add_entry('CS473', 'System Security', 'mas', 'r3', 'Thursday', '09:00', '11:00', stream, type_='elective')
        add_entry('CS451', 'Software Engineering', 'sam', 'r13', 'Thursday', '11:00', '12:00', stream)
        add_entry('CS490', 'Communication Skills', 'arundhati', 'r13', 'Thursday', '12:00', '13:00', stream)
        add_entry('CS481', 'Colour Image Processing', 'cb', 'r3', 'Thursday', '13:00', '15:00', stream, type_='elective')
    
    # IMT II - Thursday
    add_entry('ME201', 'Engineering Drawing', 'dp', 'r10', 'Thursday', '11:00', '14:00', 'IMT', 2)
    
    # IMT IV - Thursday
    add_entry('CS311', 'Computer Based Numerical & Optimization Techniques', 'sku', 'r11', 'Thursday', '09:00', '10:00', 'IMT', 4)
    add_entry('CS314', 'CBNOT Lab', 'sku', 'ai_lab', 'Thursday', '12:00', '15:00', 'IMT', 4)
    
    # IMT VI - Thursday
    add_entry('CS473', 'System Security', 'mas', 'r3', 'Thursday', '09:00', '11:00', 'IMT', 6, 'elective')
    add_entry('CS412', 'Computer Graphics', 'ag', 'r6', 'Thursday', '11:00', '12:00', 'IMT', 6)
    add_entry('CS411', 'Software Engineering', 'nn', 'r6', 'Thursday', '12:00', '13:00', 'IMT', 6)
    add_entry('CS414', 'Computer Networks', 'an', 'r6', 'Thursday', '13:00', '15:00', 'IMT', 6)
    
    # IMT VIII - Thursday
    add_entry('CS473', 'System Security', 'mas', 'r3', 'Thursday', '09:00', '11:00', 'IMT', 8, 'elective')
    add_entry('CS481', 'Colour Image Processing', 'cb', 'r3', 'Thursday', '13:00', '15:00', 'IMT', 8, 'elective')
    
    # MCA II - Thursday
    add_entry('MCA216', 'OOP Lab', 'ask', 'ai_lab', 'Thursday', '09:00', '12:00', 'MCA', 2)
    add_entry('MCA215', 'Object Oriented Programming', 'ask', 'r3', 'Thursday', '12:00', '13:00', 'MCA', 2)
    add_entry('MCA213', 'Data Structures', 'akd', 'r10', 'Thursday', '13:00', '14:00', 'MCA', 2)
    add_entry('MCA214', 'Data Structures Lab', 'akd', 'ai_lab', 'Thursday', '14:00', '17:00', 'MCA', 2)
    
    # ========== FRIDAY ==========
    
    # M.Tech(CS) & M.Tech(AI) - Friday
    for stream in ['M.Tech(CS)', 'M.Tech(AI)']:
        add_entry('AI472', 'Machine Learning', 'ksr', 'r13', 'Friday', '09:00', '11:00', stream, type_='elective')
        add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Friday', '11:00', '13:00', stream, type_='elective')
        add_entry('CS490', 'Communication Skills', 'arundhati', 'r13', 'Friday', '13:00', '15:00', stream)
    
    # IMT II - Friday
    add_entry('MA201', 'Engineering Mathematics-II', 'dp', 'lhc', 'Friday', '09:00', '11:00', 'IMT', 2)
    add_entry('CS213', 'DFS Lab', 'dp', 'ai_lab', 'Friday', '11:00', '14:00', 'IMT', 2)
    
    # IMT IV - Friday
    add_entry('CS312', 'Database Management Systems', 'tsr', 'r11', 'Friday', '11:00', '12:00', 'IMT', 4)
    
    # IMT VI - Friday
    add_entry('CS416', 'IT Lab (CN)', 'an', 'ai_lab', 'Friday', '09:00', '12:00', 'IMT', 6)
    add_entry('CS417', 'Computational Engineering', 'ap', 'r6', 'Friday', '12:00', '13:00', 'IMT', 6)
    add_entry('CS415', 'Computer Graphics Lab', 'ag', 'ai_lab', 'Friday', '13:00', '15:00', 'IMT', 6)
    
    # IMT VIII - Friday
    add_entry('AI472', 'Machine Learning', 'ksr', 'r13', 'Friday', '09:00', '11:00', 'IMT', 8, 'elective')
    add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Friday', '11:00', '13:00', 'IMT', 8, 'elective')
    add_entry('MCA218', 'Software Project Management', 'wn', 'r7', 'Friday', '13:00', '14:00', 'IMT', 8)
    
    # MCA II - Friday
    add_entry('AI472', 'Machine Learning', 'ksr', 'r13', 'Friday', '09:00', '11:00', 'MCA', 2, 'elective')
    add_entry('CS472', 'Advanced Network Management', 'mas', 'r13', 'Friday', '11:00', '13:00', 'MCA', 2, 'elective')
    add_entry('MCA215', 'Object Oriented Programming', 'ask', 'r3', 'Friday', '13:00', '15:00', 'MCA', 2)
    
    return entries
