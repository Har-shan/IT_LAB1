# Security Features & Best Practices

## Overview
This document outlines the comprehensive security measures implemented in the University of Hyderabad Timetable Management System.

---

## 🔐 Authentication & Authorization

### Email Domain Restriction
- **Requirement**: All users must register with `@uohyd.ac.in` email addresses
- **Roll Number Extraction**: The local part of the email (before @) becomes the user's roll number
- **Admin Account**: Only `admin@uohyd.ac.in` is allowed as admin
- **Validation**: Server-side validation prevents unauthorized domain registrations

### Password Security
Strong password requirements enforced:
- **Minimum Length**: 8 characters
- **Complexity Requirements**:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one digit (0-9)
  - At least one special character (!@#$%^&*...)
- **Common Password Prevention**: Blocks weak passwords like "password", "12345678", etc.
- **Password History**: Prevents reusing the current password

### Account Protection
- **Failed Login Attempts**: Maximum 5 failed attempts before lockout
- **Account Lockout**: 30-minute lockout after exceeding failed attempts
- **Automatic Unlock**: Account automatically unlocks after lockout period
- **Account Suspension**: Admins can suspend user accounts (is_approved flag)

---

## 🛡️ Security Features Implemented

### 1. Input Validation & Sanitization
- **XSS Prevention**: All user inputs are sanitized to remove malicious scripts
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **Null Byte Removal**: Strips null bytes from inputs
- **Length Limits**: Enforces maximum length on all text fields
- **Email Validation**: Validates email format and domain

### 2. Audit Logging
All security-relevant events are logged in the `audit_logs` table:
- User registration
- Successful logins
- Failed login attempts
- Password changes
- Profile updates
- Account lockouts
- Suspicious activities

**Logged Information**:
- User ID
- Action type
- IP address
- User agent
- Timestamp
- Additional details (JSON)

### 3. Session Management
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Access Token**: 8-hour expiration
- **Refresh Token**: 30-day expiration
- **Token Refresh**: Endpoint to refresh access tokens without re-login
- **Logout Tracking**: Logout events are logged for audit trail

### 4. Database Security
- **Indexed Fields**: Email and roll_number are indexed for performance
- **Unique Constraints**: Prevents duplicate emails and roll numbers
- **Password Hashing**: Werkzeug's generate_password_hash with salt
- **Sensitive Data**: Passwords are never logged or returned in API responses

### 5. API Security
- **CORS Configuration**: Restricted to specific origins (localhost:3000 in dev)
- **JWT Required**: Protected endpoints require valid JWT tokens
- **Role-Based Access**: Different permissions for admin, faculty, and student
- **Request Validation**: All requests validated before processing

---

## 🚨 Security Monitoring

### Tracked Events
1. **Registration Events**
   - Successful registrations
   - Failed registrations (with reasons)
   - Invalid email domains
   - Weak passwords

2. **Login Events**
   - Successful logins
   - Failed login attempts
   - Account lockout triggers
   - Login attempts on locked accounts
   - Login attempts on suspended accounts

3. **Account Changes**
   - Password changes
   - Profile updates
   - Account suspensions
   - Account reactivations

### IP Address Tracking
- Client IP addresses are logged for all security events
- Supports proxy headers (X-Forwarded-For, X-Real-IP)
- Helps identify suspicious patterns and potential attacks

---

## 🔧 Additional Security Measures

### 1. URL Validation (Faculty Websites)
- Validates URL format
- Automatically adds HTTPS protocol if missing
- Prevents malicious URLs
- Sanitizes input before storage

### 2. Role Validation
- Only allows 'student', 'faculty', and 'admin' roles
- Server-side validation prevents role escalation
- Role-based access control on all endpoints

### 3. Email Verification (Prepared)
- Email verification tokens generated on registration
- `is_email_verified` flag in database
- Ready for email verification implementation

### 4. Password Age Tracking
- `last_password_change` timestamp stored
- Utility function to check password age
- Can enforce periodic password changes

---

## 📋 Security Checklist

### Implemented ✅
- [x] Email domain restriction (@uohyd.ac.in)
- [x] Roll number extraction from email
- [x] Strong password requirements
- [x] Password hashing with salt
- [x] Account lockout after failed attempts
- [x] Input sanitization (XSS prevention)
- [x] SQL injection prevention (ORM)
- [x] Audit logging for security events
- [x] IP address tracking
- [x] JWT token authentication
- [x] Token refresh mechanism
- [x] Role-based access control
- [x] CORS configuration
- [x] URL validation
- [x] Account suspension capability
- [x] Unique email and roll number constraints
- [x] Database field indexing

### Recommended Future Enhancements 🔮
- [ ] Email verification (send verification emails)
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting on API endpoints
- [ ] CAPTCHA on login/registration
- [ ] Password reset via email
- [ ] Session invalidation (token blacklisting)
- [ ] HTTPS enforcement in production
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Brute force detection
- [ ] Geolocation-based anomaly detection
- [ ] Regular security audits
- [ ] Automated vulnerability scanning
- [ ] Database encryption at rest
- [ ] API request signing
- [ ] Webhook signature verification

---

## 🚀 Deployment Security

### Environment Variables
Store sensitive configuration in environment variables:
```bash
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
DATABASE_URL=<database-connection-string>
```

### Production Checklist
1. **Change Default Credentials**: Update admin password immediately
2. **Use HTTPS**: Enable SSL/TLS certificates
3. **Secure Database**: Use strong database passwords
4. **Firewall Rules**: Restrict database access
5. **Regular Backups**: Automated database backups
6. **Update Dependencies**: Keep all packages up to date
7. **Monitor Logs**: Regular audit log review
8. **Error Handling**: Don't expose stack traces in production

---

## 📞 Security Incident Response

### If You Suspect a Security Issue:
1. **Document**: Record all relevant details
2. **Isolate**: Suspend affected accounts if necessary
3. **Review Logs**: Check audit_logs table for suspicious activity
4. **Notify**: Contact system administrator
5. **Patch**: Apply security fixes immediately
6. **Communicate**: Inform affected users if data was compromised

### Audit Log Queries
```sql
-- Check failed login attempts for a user
SELECT * FROM audit_logs 
WHERE user_id = ? AND action = 'failed_login' 
ORDER BY created_at DESC;

-- Check all logins from a specific IP
SELECT * FROM audit_logs 
WHERE ip_address = ? AND action = 'login' 
ORDER BY created_at DESC;

-- Check recent account lockouts
SELECT * FROM audit_logs 
WHERE action = 'account_locked' 
ORDER BY created_at DESC LIMIT 50;
```

---

## 🎓 User Education

### For Students & Faculty:
1. **Strong Passwords**: Use unique, complex passwords
2. **Don't Share**: Never share your credentials
3. **Logout**: Always logout on shared computers
4. **Report**: Report suspicious activity immediately
5. **Update**: Keep your profile information current

### For Administrators:
1. **Regular Audits**: Review audit logs weekly
2. **Monitor Patterns**: Watch for unusual login patterns
3. **Quick Response**: Act quickly on security alerts
4. **User Training**: Educate users on security best practices
5. **Backup Strategy**: Maintain regular database backups

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/latest/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

**Last Updated**: April 28, 2026  
**Version**: 2.0  
**Maintained By**: SCIS Development Team
