# Database Migration Guide

## Overview
This guide helps you migrate from the old database schema to the new enhanced security schema.

## Changes in New Schema

### User Table Updates
The following columns have been added to the `users` table:

1. **roll_number** (String, unique, indexed) - Extracted from email
2. **is_email_verified** (Boolean) - Email verification status
3. **email_verification_token** (String) - Token for email verification
4. **failed_login_attempts** (Integer) - Count of failed login attempts
5. **account_locked_until** (DateTime) - Account lockout timestamp
6. **last_login** (DateTime) - Last successful login timestamp
7. **last_password_change** (DateTime) - Last password change timestamp
8. **updated_at** (DateTime) - Last profile update timestamp

### New Table: audit_logs
A new table for security audit logging:

```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(300),
    details TEXT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX ix_audit_logs_created_at ON audit_logs(created_at);
```

## Migration Options

### Option 1: Fresh Start (Recommended for Development)

If you're in development and don't have important data:

```bash
# Backup old database (optional)
cp backend/instance/timetable.db backend/instance/timetable.db.backup

# Delete old database
rm backend/instance/timetable.db

# Run the application - it will create new schema
python backend/app.py
```

The seed data will create:
- Admin account: admin@uohyd.ac.in (password: Admin@SCIS2026)
- All subjects and rooms

### Option 2: Manual Migration (For Production with Existing Data)

If you have existing data you want to preserve:

#### Step 1: Backup Current Database
```bash
cp backend/instance/timetable.db backend/instance/timetable.db.backup
```

#### Step 2: Create Migration Script

Create `backend/migrate_db.py`:

```python
from app import create_app
from extensions import db
from models import User, AuditLog
from datetime import datetime
import re

app = create_app()

with app.app_context():
    # Add new columns to users table
    with db.engine.connect() as conn:
        # Check if columns exist before adding
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN roll_number VARCHAR(50)"))
            print("Added roll_number column")
        except:
            print("roll_number column already exists")
        
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0"))
            print("Added is_email_verified column")
        except:
            print("is_email_verified column already exists")
        
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(100)"))
            print("Added email_verification_token column")
        except:
            print("email_verification_token column already exists")
        
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0"))
            print("Added failed_login_attempts column")
        except:
            print("failed_login_attempts column already exists")
        
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN account_locked_until DATETIME"))
            print("Added account_locked_until column")
        except:
            print("account_locked_until column already exists")
        
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
            print("Added last_login column")
        except:
            print("last_login column already exists")
        
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN last_password_change DATETIME"))
            print("Added last_password_change column")
        except:
            print("last_password_change column already exists")
        
        try:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN updated_at DATETIME"))
            print("Added updated_at column")
        except:
            print("updated_at column already exists")
        
        conn.commit()
    
    # Create audit_logs table
    db.create_all()
    print("Created audit_logs table")
    
    # Extract roll numbers from existing emails
    users = User.query.all()
    for user in users:
        if not user.roll_number:
            # Extract local part from email
            local_part = user.email.split('@')[0]
            user.roll_number = local_part
            user.last_password_change = datetime.utcnow()
            user.is_email_verified = True  # Assume existing users are verified
            print(f"Updated user {user.email} with roll_number: {user.roll_number}")
    
    db.session.commit()
    print("Migration completed successfully!")
```

#### Step 3: Run Migration
```bash
python backend/migrate_db.py
```

#### Step 4: Update Email Domains

You'll need to manually update existing user emails to use @uohyd.ac.in domain:

```python
# Create backend/update_emails.py
from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    users = User.query.all()
    
    for user in users:
        old_email = user.email
        
        # Extract roll number (local part)
        roll_number = old_email.split('@')[0]
        
        # Update to new domain
        if user.role == 'admin':
            user.email = 'admin@uohyd.ac.in'
        else:
            user.email = f'{roll_number}@uohyd.ac.in'
        
        print(f"Updated: {old_email} -> {user.email}")
    
    db.session.commit()
    print("Email domains updated successfully!")
```

Run it:
```bash
python backend/update_emails.py
```

### Option 3: Using SQLAlchemy-Migrate (Advanced)

For production systems, consider using proper migration tools:

```bash
pip install alembic

# Initialize alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add security features"

# Apply migration
alembic upgrade head
```

## Post-Migration Steps

### 1. Verify Data Integrity
```python
from app import create_app
from models import User, AuditLog

app = create_app()

with app.app_context():
    # Check all users have roll numbers
    users_without_roll = User.query.filter_by(roll_number=None).count()
    print(f"Users without roll_number: {users_without_roll}")
    
    # Check email domains
    users = User.query.all()
    for user in users:
        if not user.email.endswith('@uohyd.ac.in'):
            print(f"Warning: {user.email} doesn't use @uohyd.ac.in domain")
    
    # Check audit_logs table exists
    audit_count = AuditLog.query.count()
    print(f"Audit logs table created. Current entries: {audit_count}")
```

### 2. Update Admin Password
```bash
# Login as admin and change password immediately
# Old: admin@scis2026
# New: Admin@SCIS2026 (or your custom strong password)
```

### 3. Test Security Features
- [ ] Try registering with non-@uohyd.ac.in email (should fail)
- [ ] Try weak password (should fail)
- [ ] Try 5 failed logins (should lock account)
- [ ] Check audit logs are being created
- [ ] Verify roll numbers are extracted correctly

### 4. Notify Users
Send notification to all users about:
- New email domain requirement (@uohyd.ac.in)
- New password requirements (8+ chars, complexity)
- Account lockout policy (5 failed attempts)

## Rollback Plan

If something goes wrong:

```bash
# Stop the application
# Restore backup
cp backend/instance/timetable.db.backup backend/instance/timetable.db

# Restart with old code
git checkout <previous-commit>
python backend/app.py
```

## Common Issues

### Issue 1: "Column already exists" error
**Solution**: The column was already added. Safe to ignore or drop and recreate.

### Issue 2: Users can't login after migration
**Solution**: Check email domains are updated to @uohyd.ac.in

### Issue 3: Roll numbers are duplicated
**Solution**: Roll numbers must be unique. Check for duplicate emails.

```python
# Find duplicates
from collections import Counter
roll_numbers = [u.roll_number for u in User.query.all()]
duplicates = [k for k, v in Counter(roll_numbers).items() if v > 1]
print(f"Duplicate roll numbers: {duplicates}")
```

### Issue 4: Audit logs not being created
**Solution**: Check that the audit_logs table was created successfully:

```python
from sqlalchemy import inspect
inspector = inspect(db.engine)
tables = inspector.get_table_names()
print("audit_logs" in tables)  # Should be True
```

## Testing Checklist

After migration, test:

- [ ] Admin can login with new credentials
- [ ] New users can register with @uohyd.ac.in emails
- [ ] Registration rejects non-@uohyd.ac.in emails
- [ ] Weak passwords are rejected
- [ ] Account lockout works after 5 failed attempts
- [ ] Audit logs are created for login/logout
- [ ] Roll numbers are displayed in user profiles
- [ ] Existing timetable data is intact
- [ ] All API endpoints work correctly

## Support

If you encounter issues during migration:
1. Check the error logs
2. Verify database backup exists
3. Review this guide carefully
4. Contact the development team

---

**Last Updated**: April 28, 2026  
**Version**: 2.0
