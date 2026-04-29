# 🚀 Production Deployment Guide

Complete guide for deploying the University of Hyderabad Timetable Management System to production.

---

## Pre-Deployment Checklist

### 1. Security Review ✅
- [ ] All default credentials changed
- [ ] Environment variables configured
- [ ] HTTPS/SSL certificates obtained
- [ ] CORS origins restricted to production domains
- [ ] Database credentials secured
- [ ] API keys and secrets rotated
- [ ] Security headers configured
- [ ] Rate limiting enabled

### 2. Code Review ✅
- [ ] All features tested
- [ ] No debug code in production
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Code reviewed and approved
- [ ] Documentation updated

### 3. Database Preparation ✅
- [ ] Migration scripts tested
- [ ] Backup strategy in place
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Database credentials secured

### 4. Infrastructure ✅
- [ ] Server/hosting selected
- [ ] Domain name configured
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] Monitoring tools set up
- [ ] Backup system configured

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in backend directory:

```env
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=<generate-strong-random-key>
JWT_SECRET_KEY=<generate-strong-random-key>

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Email Configuration (for future email features)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@uohyd.ac.in
MAIL_PASSWORD=your-app-password

# Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=30

# Rate Limiting
RATELIMIT_ENABLED=True
RATELIMIT_STORAGE_URL=redis://localhost:6379

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Generate Secure Keys

```python
import secrets

# Generate SECRET_KEY
print("SECRET_KEY:", secrets.token_urlsafe(32))

# Generate JWT_SECRET_KEY
print("JWT_SECRET_KEY:", secrets.token_urlsafe(32))
```

---

## Database Migration

### Option 1: PostgreSQL (Recommended for Production)

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

#### Create Database
```bash
sudo -u postgres psql

CREATE DATABASE timetable_db;
CREATE USER timetable_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE timetable_db TO timetable_user;
\q
```

#### Update Configuration
```python
# backend/config.py
SQLALCHEMY_DATABASE_URI = os.environ.get(
    "DATABASE_URL",
    "postgresql://timetable_user:password@localhost:5432/timetable_db"
)
```

#### Install PostgreSQL Driver
```bash
pip install psycopg2-binary
```

### Option 2: MySQL

```bash
# Install MySQL
sudo apt install mysql-server  # Ubuntu/Debian
brew install mysql             # macOS

# Create database
mysql -u root -p
CREATE DATABASE timetable_db;
CREATE USER 'timetable_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON timetable_db.* TO 'timetable_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```python
# Install driver
pip install pymysql

# Update config
SQLALCHEMY_DATABASE_URI = "mysql+pymysql://user:password@localhost/timetable_db"
```

---

## Backend Deployment

### Option 1: Heroku

#### Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Deploy
```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create uohyd-timetable-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set JWT_SECRET_KEY=your-jwt-secret
heroku config:set FLASK_ENV=production

# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Install gunicorn
pip install gunicorn
pip freeze > requirements.txt

# Deploy
git init
git add .
git commit -m "Initial deployment"
git push heroku main

# Run migrations
heroku run python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
>>>     db.create_all()
>>> exit()
```

### Option 2: DigitalOcean/AWS/VPS

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install Nginx
sudo apt install nginx -y

# Install Supervisor (process manager)
sudo apt install supervisor -y
```

#### Setup Application
```bash
# Create app directory
sudo mkdir -p /var/www/timetable
sudo chown $USER:$USER /var/www/timetable

# Clone repository
cd /var/www/timetable
git clone <your-repo-url> .

# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn

# Create .env file
nano .env
# Add your environment variables
```

#### Configure Gunicorn
```bash
# Create gunicorn config
nano /var/www/timetable/backend/gunicorn_config.py
```

```python
# gunicorn_config.py
bind = "127.0.0.1:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
loglevel = "info"
```

#### Configure Supervisor
```bash
sudo nano /etc/supervisor/conf.d/timetable.conf
```

```ini
[program:timetable]
directory=/var/www/timetable/backend
command=/var/www/timetable/backend/venv/bin/gunicorn -c gunicorn_config.py app:app
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/timetable/err.log
stdout_logfile=/var/log/timetable/out.log
```

```bash
# Create log directory
sudo mkdir -p /var/log/timetable /var/log/gunicorn
sudo chown www-data:www-data /var/log/timetable /var/log/gunicorn

# Start supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start timetable
```

#### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/timetable
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (if serving from same domain)
    location / {
        root /var/www/timetable/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/timetable /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://api.yourdomain.com
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: Same Server as Backend

```bash
# Build frontend
cd frontend
npm run build

# Copy to Nginx directory
sudo cp -r dist/* /var/www/timetable/frontend/dist/

# Nginx already configured to serve from this location
```

---

## Post-Deployment Tasks

### 1. Change Default Credentials
```bash
# Login as admin
# Email: admin@uohyd.ac.in
# Password: Admin@SCIS2026

# Immediately change password to something secure
```

### 2. Test All Features
- [ ] User registration
- [ ] User login
- [ ] Password change
- [ ] Profile update
- [ ] Timetable creation (admin)
- [ ] Timetable viewing (student/faculty)
- [ ] Subject enrollment
- [ ] Notifications
- [ ] Audit logs

### 3. Setup Monitoring

#### Application Monitoring
```bash
# Install monitoring tools
pip install sentry-sdk

# Add to app.py
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

#### Server Monitoring
```bash
# Install monitoring agent (e.g., New Relic, Datadog)
# Follow provider's installation guide
```

### 4. Setup Backups

#### Database Backups
```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/timetable"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U timetable_user timetable_db > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-db.sh
```

### 5. Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/timetable
```

```
/var/log/timetable/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        supervisorctl restart timetable
    endscript
}
```

---

## Monitoring & Maintenance

### Health Check Endpoint
Add to `backend/app.py`:

```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
```

### Monitoring Checklist
- [ ] Server CPU and memory usage
- [ ] Database connections and performance
- [ ] API response times
- [ ] Error rates
- [ ] Failed login attempts
- [ ] Disk space
- [ ] SSL certificate expiration

### Regular Maintenance Tasks

#### Daily
- [ ] Check error logs
- [ ] Monitor failed login attempts
- [ ] Review audit logs for suspicious activity

#### Weekly
- [ ] Review system performance
- [ ] Check backup integrity
- [ ] Update dependencies (security patches)

#### Monthly
- [ ] Full system backup
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review

---

## Scaling Considerations

### Horizontal Scaling
```bash
# Use load balancer (Nginx, HAProxy, AWS ELB)
# Multiple application servers
# Shared database
# Redis for session storage
```

### Vertical Scaling
```bash
# Increase server resources
# Optimize database queries
# Add database indexes
# Enable caching
```

### Caching Strategy
```python
# Install Redis
pip install redis flask-caching

# Add to app.py
from flask_caching import Cache

cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': 'redis://localhost:6379/0'
})

# Cache expensive queries
@cache.cached(timeout=300)
def get_timetable():
    # ...
```

---

## Troubleshooting

### Common Issues

#### 502 Bad Gateway
- Check if backend is running: `sudo supervisorctl status timetable`
- Check logs: `sudo tail -f /var/log/timetable/err.log`
- Restart: `sudo supervisorctl restart timetable`

#### Database Connection Errors
- Check database is running
- Verify credentials in .env
- Check firewall rules
- Test connection: `psql -U user -d database -h host`

#### High Memory Usage
- Check for memory leaks
- Increase worker count
- Add swap space
- Optimize queries

#### Slow Response Times
- Enable query logging
- Add database indexes
- Implement caching
- Optimize frontend bundle size

---

## Security Hardening

### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### Application Security
- [ ] Enable rate limiting
- [ ] Implement CAPTCHA
- [ ] Add security headers
- [ ] Enable HTTPS only
- [ ] Validate all inputs
- [ ] Sanitize outputs
- [ ] Use prepared statements
- [ ] Keep dependencies updated

---

## Rollback Plan

### If Deployment Fails

1. **Stop new version**
```bash
sudo supervisorctl stop timetable
```

2. **Restore database backup**
```bash
psql -U user -d database < /var/backups/timetable/backup_YYYYMMDD.sql
```

3. **Revert code**
```bash
cd /var/www/timetable
git checkout <previous-commit>
```

4. **Restart application**
```bash
sudo supervisorctl start timetable
```

---

## Support & Resources

### Documentation
- [Flask Deployment](https://flask.palletsprojects.com/en/latest/deploying/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

### Monitoring Tools
- [Sentry](https://sentry.io/) - Error tracking
- [New Relic](https://newrelic.com/) - Application monitoring
- [Datadog](https://www.datadoghq.com/) - Infrastructure monitoring
- [UptimeRobot](https://uptimerobot.com/) - Uptime monitoring

---

**Deployment Complete! 🎉**

Your University of Hyderabad Timetable Management System is now live and secure.
