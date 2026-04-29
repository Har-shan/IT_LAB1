# 🎓 University of Hyderabad - Timetable Management System

A comprehensive, secure, and interactive timetable management platform for the School of Computer and Information Sciences (SCIS), University of Hyderabad.

## 🌟 Key Features

### For Students
- 📅 **Personalized Timetable**: View your schedule based on stream, section, and semester
- 📚 **Subject Management**: Enroll in elective subjects
- 👤 **Profile Management**: Update personal information
- 🔔 **Real-time Notifications**: Get updates about schedule changes
- 🔍 **Faculty Information**: Access faculty websites and contact details

### For Faculty
- 📊 **Schedule Overview**: View all assigned classes
- ✏️ **Profile Updates**: Manage personal website and department info
- 👥 **Student Insights**: See enrolled students per class
- 📝 **Class Management**: Track room assignments and timings

### For Administrators
- 🗓️ **Timetable Creation**: Create and manage complete schedules
- 👥 **User Management**: Approve, suspend, or manage user accounts
- 📈 **Analytics Dashboard**: View system statistics and usage
- 🔐 **Security Monitoring**: Access audit logs and security events
- 📊 **Reports**: Generate comprehensive reports

---

## 🔐 Security Features

### Enhanced Security Implementation
This system implements **enterprise-grade security** measures:

#### Authentication & Authorization
- ✅ **Email Domain Restriction**: Only `@uohyd.ac.in` emails allowed
- ✅ **Roll Number System**: Automatically extracted from email
- ✅ **Strong Password Policy**: 8+ chars with uppercase, lowercase, digit, and special character
- ✅ **Account Lockout**: 5 failed attempts = 30-minute lockout
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Role-Based Access Control**: Separate permissions for admin, faculty, and students

#### Data Protection
- ✅ **Input Sanitization**: XSS prevention on all inputs
- ✅ **SQL Injection Prevention**: Parameterized queries via SQLAlchemy ORM
- ✅ **Password Hashing**: Werkzeug secure password hashing with salt
- ✅ **Audit Logging**: Complete trail of security events
- ✅ **IP Tracking**: Monitor login locations and suspicious activity

#### Additional Security
- ✅ **Email Verification Ready**: Token-based verification system
- ✅ **Session Management**: Access and refresh tokens
- ✅ **URL Validation**: Secure faculty website links
- ✅ **CORS Protection**: Restricted cross-origin requests
- ✅ **Database Indexing**: Optimized queries with indexed fields

**See [SECURITY.md](SECURITY.md) for complete security documentation.**

---

## 🚀 Technology Stack

### Backend
- **Framework**: Flask 3.0.3
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: Flask-JWT-Extended
- **Security**: Werkzeug, Flask-Limiter, email-validator
- **API**: RESTful architecture

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **UI**: Custom CSS with modern design
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## 🔑 Default Credentials

### Admin Account
- **Email**: `admin@uohyd.ac.in`
- **Password**: `Admin@SCIS2026`
- **⚠️ IMPORTANT**: Change this password immediately after first login!

### Test Accounts
You can register new accounts using any `@uohyd.ac.in` email:
- **Students**: `rollnumber@uohyd.ac.in` (e.g., `21scse1001@uohyd.ac.in`)
- **Faculty**: `facultyid@uohyd.ac.in` (e.g., `profsmith@uohyd.ac.in`)

---

## 📁 Project Structure

```
timetable-management/
├── backend/
│   ├── routes/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── admin.py         # Admin operations
│   │   ├── faculty.py       # Faculty operations
│   │   ├── student.py       # Student operations
│   │   └── timetable.py     # Timetable CRUD
│   ├── utils/
│   │   └── security.py      # Security utilities
│   ├── models.py            # Database models
│   ├── config.py            # Configuration
│   ├── extensions.py        # Flask extensions
│   ├── app.py              # Application entry point
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context providers
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── faculty/     # Faculty pages
│   │   │   └── student/     # Student pages
│   │   ├── services/        # API services
│   │   └── main.jsx         # Application entry
│   └── package.json         # Node dependencies
│
├── SECURITY.md              # Security documentation
└── README.md               # This file
```

---

## 🔧 Configuration

### Backend Configuration (`backend/config.py`)

```python
# Email Domain
ALLOWED_EMAIL_DOMAIN = "uohyd.ac.in"

# Security Settings
MAX_LOGIN_ATTEMPTS = 5
ACCOUNT_LOCKOUT_DURATION = 30 minutes
PASSWORD_MIN_LENGTH = 8

# JWT Settings
JWT_ACCESS_TOKEN_EXPIRES = 8 hours
JWT_REFRESH_TOKEN_EXPIRES = 30 days
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DATABASE_URL=sqlite:///timetable.db
FLASK_ENV=development
```

---

## 📊 Database Schema

### Core Tables
- **users**: User accounts with authentication and profile data
- **subjects**: Course/subject information
- **rooms**: Classroom/venue details
- **timetable_entries**: Schedule entries linking subjects, faculty, rooms, and timings
- **notifications**: User notifications
- **audit_logs**: Security and activity audit trail

### Key Relationships
- Users (faculty) → Timetable Entries (one-to-many)
- Subjects → Timetable Entries (one-to-many)
- Rooms → Timetable Entries (one-to-many)
- Users → Notifications (one-to-many)
- Users → Audit Logs (one-to-many)

---

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: CSS variables for easy theming
- **Smooth Animations**: Fade-in effects and transitions
- **Toast Notifications**: Real-time feedback
- **Loading States**: Clear loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML and ARIA labels

---

## 🔄 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user
- `PUT /change-password` - Change password
- `PUT /update-profile` - Update profile
- `POST /logout` - Logout (audit log)

### Admin (`/api/admin`)
- `GET /users` - List all users
- `PUT /users/:id/approve` - Approve/suspend user
- `GET /stats` - System statistics
- `GET /audit-logs` - Security audit logs

### Faculty (`/api/faculty`)
- `GET /schedule` - Get faculty schedule
- `GET /students` - Get enrolled students

### Student (`/api/student`)
- `GET /timetable` - Get student timetable
- `POST /enroll` - Enroll in elective
- `GET /subjects` - Available subjects

### Timetable (`/api/timetable`)
- `GET /` - Get timetable entries
- `POST /` - Create entry (admin)
- `PUT /:id` - Update entry (admin)
- `DELETE /:id` - Delete entry (admin)

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Register with valid @uohyd.ac.in email
- [ ] Register with invalid email domain (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password 5 times (should lock account)
- [ ] Change password with weak password (should fail)
- [ ] Update profile information
- [ ] View timetable as student
- [ ] Create timetable entry as admin
- [ ] Check audit logs as admin

---

## 🚀 Deployment

### Production Checklist
1. **Change Default Credentials**: Update admin password
2. **Environment Variables**: Set production SECRET_KEY and JWT_SECRET_KEY
3. **Database**: Migrate to PostgreSQL or MySQL for production
4. **HTTPS**: Enable SSL/TLS certificates
5. **CORS**: Update allowed origins
6. **Rate Limiting**: Enable Flask-Limiter
7. **Monitoring**: Set up logging and monitoring
8. **Backups**: Configure automated database backups

### Recommended Hosting
- **Backend**: Heroku, AWS, DigitalOcean, Railway
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, DigitalOcean Managed Database

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📝 License

This project is developed for the University of Hyderabad, School of Computer and Information Sciences.

---

## 👥 Team

**Developed by**: SCIS Development Team  
**Institution**: University of Hyderabad  
**Department**: School of Computer and Information Sciences  
**Year**: 2026

---

## 📞 Support

For issues, questions, or suggestions:
- **Email**: admin@uohyd.ac.in
- **Issue Tracker**: GitHub Issues
- **Documentation**: See SECURITY.md for security-related queries

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Email verification system
- [ ] Two-factor authentication (2FA)
- [ ] Mobile app (React Native)
- [ ] Calendar export (iCal format)
- [ ] SMS notifications
- [ ] Attendance tracking
- [ ] Assignment management
- [ ] Grade management
- [ ] Discussion forums
- [ ] File sharing
- [ ] Video conferencing integration
- [ ] AI-powered schedule optimization
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF, Excel)

---

## 🙏 Acknowledgments

- University of Hyderabad for the opportunity
- SCIS faculty for guidance and requirements
- Open-source community for amazing tools and libraries

---

**Made with ❤️ for University of Hyderabad**
