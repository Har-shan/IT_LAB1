# 🚀 Quick Start Guide

Get the University of Hyderabad Timetable Management System up and running in 5 minutes!

---

## Prerequisites

Make sure you have these installed:
- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/downloads))

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd timetable-management
```

---

## Step 2: Backend Setup (2 minutes)

### Windows

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

### macOS/Linux

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

✅ **Backend is now running on** `http://localhost:5000`

---

## Step 3: Frontend Setup (2 minutes)

Open a **new terminal** window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ **Frontend is now running on** `http://localhost:3000`

---

## Step 4: Access the Application

Open your browser and go to: **http://localhost:3000**

---

## Step 5: Login

### Admin Account (Pre-configured)
- **Email**: `admin@uohyd.ac.in`
- **Password**: `Admin@SCIS2026`

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## Step 6: Create Test Accounts

### Register as Student
1. Click "Register here" on login page
2. Select "Student" role
3. Fill in details:
   - **Name**: Your Name
   - **Email**: `yourrollno@uohyd.ac.in` (e.g., `21scse1001@uohyd.ac.in`)
   - **Password**: Must meet requirements (8+ chars, uppercase, lowercase, digit, special char)
   - **Stream**: Select your stream (e.g., M.Tech(CS))
   - **Section**: Select section
   - **Semester**: Select semester
4. Click "Create Account"

### Register as Faculty
1. Click "Register here" on login page
2. Select "Faculty" role
3. Fill in details:
   - **Name**: Faculty Name
   - **Email**: `facultyid@uohyd.ac.in` (e.g., `profsmith@uohyd.ac.in`)
   - **Password**: Must meet requirements
   - **Stream**: Select department
   - **Department**: Enter department name
4. Click "Create Account"

---

## Common Issues & Solutions

### Issue 1: "Port already in use"

**Backend (Port 5000)**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000)**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue 2: "Module not found" (Python)

```bash
# Make sure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue 3: "Module not found" (Node.js)

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Database errors

```bash
# Delete and recreate database
rm backend/instance/timetable.db
python backend/app.py
```

### Issue 5: CORS errors

Make sure:
1. Backend is running on port 5000
2. Frontend is running on port 3000
3. Check `backend/app.py` CORS configuration

---

## Next Steps

### As Admin
1. **Change Password**: Go to Profile → Change Password
2. **View Users**: Check Admin → Users to see registered users
3. **Create Timetable**: Go to Admin → Timetable to add entries
4. **Monitor Security**: Check Admin → Audit Logs

### As Student
1. **View Timetable**: Go to Dashboard to see your schedule
2. **Enroll in Subjects**: Go to Subjects to add electives
3. **Update Profile**: Go to Profile to update information

### As Faculty
1. **View Schedule**: Go to Dashboard to see your classes
2. **Update Profile**: Add your website URL and department
3. **View Students**: See enrolled students in your classes

---

## Testing the Security Features

### Test 1: Email Domain Restriction
Try registering with `test@gmail.com` → Should fail ❌

### Test 2: Weak Password
Try password `password123` → Should fail ❌

### Test 3: Strong Password
Try password `MyPass@123` → Should succeed ✅

### Test 4: Account Lockout
1. Try logging in with wrong password 5 times
2. Account should be locked for 30 minutes
3. Check Admin → Audit Logs to see failed attempts

### Test 5: Roll Number Extraction
Register with `21scse1001@uohyd.ac.in`
- Roll number should be: `21scse1001`
- Check in Profile page

---

## Development Tips

### Hot Reload
- **Frontend**: Changes auto-reload (Vite HMR)
- **Backend**: Restart server after changes (or use Flask debug mode)

### Debug Mode
Backend debug mode is enabled by default in `app.py`:
```python
app.run(debug=True, port=5000)
```

### View Database
Use SQLite browser to inspect database:
```bash
# Install SQLite browser
# Windows: Download from https://sqlitebrowser.org/
# macOS: brew install --cask db-browser-for-sqlite
# Linux: sudo apt install sqlitebrowser

# Open database
sqlitebrowser backend/instance/timetable.db
```

### API Testing
Use tools like:
- **Postman**: GUI for API testing
- **curl**: Command-line API testing
- **Thunder Client**: VS Code extension

Example curl request:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uohyd.ac.in","password":"Admin@SCIS2026"}'
```

---

## Project Structure Overview

```
timetable-management/
├── backend/              # Flask backend
│   ├── routes/          # API endpoints
│   ├── utils/           # Utility functions
│   ├── models.py        # Database models
│   ├── config.py        # Configuration
│   └── app.py           # Entry point
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   └── services/    # API calls
│   └── package.json
│
├── SECURITY.md          # Security documentation
├── FEATURES.md          # Feature list
└── README.md            # Main documentation
```

---

## Useful Commands

### Backend
```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install new package
pip install package-name
pip freeze > requirements.txt

# Run server
python app.py

# Deactivate virtual environment
deactivate
```

### Frontend
```bash
# Install new package
npm install package-name

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Getting Help

### Documentation
- **README.md**: Main documentation
- **SECURITY.md**: Security features
- **FEATURES.md**: Complete feature list
- **MIGRATION_GUIDE.md**: Database migration

### Support
- **Email**: admin@uohyd.ac.in
- **GitHub Issues**: Report bugs and request features

---

## What's Next?

1. **Explore the Application**: Try all features
2. **Read Documentation**: Check SECURITY.md and FEATURES.md
3. **Customize**: Modify colors, add features
4. **Deploy**: Follow deployment guide in README.md

---

**Happy Coding! 🎉**

Made with ❤️ for University of Hyderabad
