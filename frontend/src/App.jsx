import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentTimetable from './pages/student/StudentTimetable'
import StudentSubjects from './pages/student/StudentSubjects'
import StudentProfile from './pages/student/StudentProfile'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import FacultyTimetable from './pages/faculty/FacultyTimetable'
import FacultyManage from './pages/faculty/FacultyManage'
import FacultyProfile from './pages/faculty/FacultyProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTimetable from './pages/admin/AdminTimetable'
import AdminReports from './pages/admin/AdminReports'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '10px' },
              success: {
                style: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
                iconTheme: { primary: '#2563eb', secondary: '#fff' },
              },
              error: {
                style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="timetable" replace />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="subjects" element={<StudentSubjects />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Faculty Routes */}
            <Route path="/faculty" element={
              <ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="timetable" replace />} />
              <Route path="timetable" element={<FacultyTimetable />} />
              <Route path="manage" element={<FacultyManage />} />
              <Route path="profile" element={<FacultyProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="timetable" element={<AdminTimetable />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
