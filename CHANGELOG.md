# Changelog

All notable changes to the University of Hyderabad Timetable Management System.

---

## [2.0.0] - 2026-04-28

### 🔐 Security Enhancements (MAJOR UPDATE)

#### Email Domain Restriction
- **Changed**: Email domain from multiple domains to single university domain
  - Old: `@admin.edu`, `@faculty.edu`, `@student.edu`
  - New: `@uohyd.ac.in` (University of Hyderabad)
- **Added**: Server-side email domain validation
- **Added**: Frontend email validation with user-friendly error messages

#### Roll Number System
- **Added**: `roll_number` field to User model (unique, indexed)
- **Added**: Automatic extraction of roll number from email
  - Example: `21scse1001@uohyd.ac.in` → Roll Number: `21scse1001`
- **Added**: Roll number display in user profiles
- **Added**: Roll number uniqueness validation

#### Password Security
- **Enhanced**: Password requirements from 6 to 8 characters minimum
- **Added**: Password complexity requirements:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character
- **Added**: Common password detection and blocking
- **Added**: Password reuse prevention (can't use current password)
- **Added**: `last_password_change` timestamp tracking

#### Account Protection
- **Added**: Failed login attempt tracking
- **Added**: Account lockout after 5 failed attempts
- **Added**: 30-minute automatic lockout duration
- **Added**: `failed_login_attempts` counter
- **Added**: `account_locked_until` timestamp
- **Added**: User feedback showing remaining attempts
- **Added**: Admin ability to unlock accounts

#### Audit Logging
- **Added**: New `audit_logs` table for security event tracking
- **Added**: Comprehensive event logging:
  - User registration (success/failure with reasons)
  - Login attempts (success/failure)
  - Password changes
  - Profile updates
  - Account lockouts
  - Suspicious activities
- **Added**: IP address tracking for all security events
- **Added**: User agent (browser/device) logging
- **Added**: Detailed event information in JSON format
- **Added**: Admin interface to view audit logs

#### Input Validation & Sanitization
- **Added**: `utils/security.py` module with security utilities
- **Added**: XSS prevention through input sanitization
- **Added**: Null byte removal from inputs
- **Added**: Length limit enforcement on all text fields
- **Added**: URL validation for faculty websites
- **Added**: Role validation to prevent role escalation

#### Session Management
- **Added**: Refresh token support (30-day expiration)
- **Added**: `/api/auth/refresh` endpoint for token refresh
- **Added**: `/api/auth/logout` endpoint with audit logging
- **Enhanced**: JWT configuration with separate access and refresh token expiration
- **Added**: `last_login` timestamp tracking

#### Database Enhancements
- **Added**: Email field indexing for faster queries
- **Added**: Roll number field indexing
- **Added**: Audit log timestamp indexing
- **Added**: `is_email_verified` flag (prepared for email verification)
- **Added**: `email_verification_token` field
- **Added**: `updated_at` timestamp for profile changes

---

### 📝 Configuration Changes

#### Backend Configuration (`config.py`)
- **Changed**: Email domain configuration structure
  - Removed: `ADMIN_EMAIL_DOMAIN`, `FACULTY_EMAIL_DOMAIN`, `STUDENT_EMAIL_DOMAIN`
  - Added: `ALLOWED_EMAIL_DOMAIN = "uohyd.ac.in"`
  - Added: `ADMIN_EMAIL_PREFIX = "admin"`
- **Added**: Security configuration constants:
  - `MAX_LOGIN_ATTEMPTS = 5`
  - `ACCOUNT_LOCKOUT_DURATION = timedelta(minutes=30)`
  - `PASSWORD_MIN_LENGTH = 8`
  - `PASSWORD_REQUIRE_UPPERCASE = True`
  - `PASSWORD_REQUIRE_LOWERCASE = True`
  - `PASSWORD_REQUIRE_DIGIT = True`
  - `PASSWORD_REQUIRE_SPECIAL = True`
- **Added**: Rate limiting configuration (prepared):
  - `RATELIMIT_ENABLED = True`
  - `RATELIMIT_STORAGE_URL = "memory://"`
  - `RATELIMIT_DEFAULT = "100 per hour"`
  - `RATELIMIT_LOGIN = "5 per minute"`
  - `RATELIMIT_REGISTER = "3 per hour"`

#### Seed Data Changes
- **Changed**: Admin account credentials
  - Old: `admin@admin.edu` / `admin@scis2026`
  - New: `admin@uohyd.ac.in` / `Admin@SCIS2026`
- **Added**: Roll number for admin account: `admin`
- **Added**: Email verification status for admin
- **Added**: Last password change timestamp

---

### 🔄 API Changes

#### New Endpoints
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Logout with audit logging
- `GET /api/admin/audit-logs` - View security audit logs (admin only)

#### Modified Endpoints
- `POST /api/auth/register`
  - Now validates email domain (@uohyd.ac.in)
  - Extracts and validates roll number
  - Enforces strong password requirements
  - Creates audit log entries
  - Returns more detailed error messages
  
- `POST /api/auth/login`
  - Checks account lockout status
  - Tracks failed login attempts
  - Creates audit log entries
  - Returns refresh token
  - Provides detailed lockout information
  
- `PUT /api/auth/change-password`
  - Enforces strong password requirements
  - Prevents password reuse
  - Creates audit log entries
  - Updates last_password_change timestamp
  
- `PUT /api/auth/update-profile`
  - Enhanced input validation
  - URL validation for faculty websites
  - Creates audit log entries
  - Updates updated_at timestamp

#### Response Changes
- User objects now include:
  - `roll_number`
  - `is_email_verified`
  - `last_login`
- Error responses now include:
  - More specific error messages
  - `details` array for validation errors (e.g., password requirements)

---

### 🎨 Frontend Changes

#### Registration Page
- **Changed**: Email domain hint to show `@uohyd.ac.in`
- **Added**: Roll number extraction explanation
- **Enhanced**: Password field placeholder with requirements
- **Improved**: Error messages for validation failures
- **Added**: Real-time email domain validation

#### Login Page
- **Changed**: Email placeholder to `your@uohyd.ac.in`
- **Updated**: Domain hints section
- **Added**: New admin credentials display
- **Improved**: Error handling for account lockout

#### User Profile Pages
- **Added**: Roll number display
- **Added**: Last login timestamp display
- **Added**: Email verification status (prepared)

---

### 📦 Dependencies

#### Backend (requirements.txt)
- **Added**: `python-dotenv==1.0.0` - Environment variable management
- **Added**: `Flask-Limiter==3.5.0` - Rate limiting (prepared)
- **Added**: `email-validator==2.1.0` - Email validation

---

### 📚 Documentation

#### New Documents
- **Added**: `SECURITY.md` - Comprehensive security documentation
  - Security features overview
  - Implementation details
  - Best practices
  - Incident response guide
  - Future enhancements
  
- **Added**: `FEATURES.md` - Complete feature list
  - All features categorized by user role
  - Technical features
  - API endpoints
  - Data models
  - Future enhancements
  
- **Added**: `QUICKSTART.md` - Quick start guide
  - 5-minute setup instructions
  - Common issues and solutions
  - Testing guide
  - Development tips
  
- **Added**: `MIGRATION_GUIDE.md` - Database migration guide
  - Migration options
  - Step-by-step instructions
  - Rollback plan
  - Testing checklist
  
- **Added**: `CHANGELOG.md` - This file

#### Updated Documents
- **Updated**: `README.md` - Complete rewrite
  - Enhanced security section
  - Updated credentials
  - New project structure
  - Comprehensive feature list
  - Deployment guide
  - Future enhancements

---

### 🔧 Code Structure Changes

#### New Files
- `backend/utils/security.py` - Security utility functions
  - `validate_email_domain()` - Email validation
  - `validate_password_strength()` - Password validation
  - `sanitize_input()` - Input sanitization
  - `check_account_lockout()` - Lockout checking
  - `handle_failed_login()` - Failed login handling
  - `reset_failed_login_attempts()` - Reset counter
  - `log_audit_event()` - Audit logging
  - `get_client_ip()` - IP address extraction
  - `validate_role()` - Role validation
  - `validate_url()` - URL validation
  - `generate_verification_token()` - Token generation

- `backend/utils/__init__.py` - Utils package initializer

#### Modified Files
- `backend/models.py`
  - Enhanced User model with security fields
  - Added AuditLog model
  - Updated to_dict() methods
  
- `backend/routes/auth.py`
  - Complete rewrite with security enhancements
  - Added comprehensive validation
  - Added audit logging
  - Enhanced error handling
  
- `backend/config.py`
  - Updated email domain configuration
  - Added security constants
  - Added rate limiting configuration
  
- `backend/app.py`
  - Updated seed data
  - Added datetime import
  
- `frontend/src/pages/RegisterPage.jsx`
  - Updated email domain validation
  - Enhanced password requirements
  - Improved user feedback
  
- `frontend/src/pages/LoginPage.jsx`
  - Updated email placeholder
  - Updated credentials display

---

### 🐛 Bug Fixes
- Fixed email domain validation inconsistencies
- Fixed password validation edge cases
- Improved error message clarity
- Fixed token expiration handling

---

### ⚡ Performance Improvements
- Added database indexes on email and roll_number
- Optimized audit log queries with timestamp index
- Improved query performance with proper indexing

---

### 🔒 Security Improvements Summary

| Feature | Before | After |
|---------|--------|-------|
| Email Domain | Multiple domains | Single university domain |
| Password Length | 6 characters | 8 characters |
| Password Complexity | None | Uppercase, lowercase, digit, special |
| Failed Login Protection | None | 5 attempts, 30-min lockout |
| Audit Logging | None | Comprehensive event tracking |
| Input Sanitization | Basic | XSS prevention, null byte removal |
| Roll Number | None | Extracted from email |
| Session Management | Access token only | Access + refresh tokens |
| IP Tracking | None | All security events |

---

### 🚀 Migration Path

For existing installations:
1. Backup current database
2. Follow `MIGRATION_GUIDE.md`
3. Update admin credentials
4. Test security features
5. Notify users of changes

---

### ⚠️ Breaking Changes

1. **Email Domain**: All users must re-register with `@uohyd.ac.in` emails
2. **Password Requirements**: Existing passwords may not meet new requirements
3. **Admin Credentials**: Default admin password changed
4. **API Responses**: User objects now include additional fields
5. **Database Schema**: New columns and table added

---

### 📋 Testing Checklist

- [x] Email domain validation
- [x] Roll number extraction
- [x] Strong password enforcement
- [x] Account lockout mechanism
- [x] Audit log creation
- [x] Input sanitization
- [x] Token refresh
- [x] URL validation
- [x] Failed login tracking
- [x] IP address logging

---

### 🎯 Future Roadmap

#### Version 2.1 (Planned)
- [ ] Email verification implementation
- [ ] Rate limiting activation
- [ ] CAPTCHA integration
- [ ] Password reset via email

#### Version 2.2 (Planned)
- [ ] Two-factor authentication (2FA)
- [ ] Token blacklisting for logout
- [ ] Session management dashboard
- [ ] Advanced security analytics

#### Version 3.0 (Planned)
- [ ] Mobile application
- [ ] Real-time notifications via WebSocket
- [ ] Advanced reporting
- [ ] AI-powered features

---

### 👥 Contributors

- SCIS Development Team
- University of Hyderabad

---

### 📞 Support

For questions or issues:
- Email: admin@uohyd.ac.in
- Documentation: See SECURITY.md, FEATURES.md, QUICKSTART.md

---

**Version 2.0.0 represents a major security overhaul of the system, making it production-ready for university deployment.**
