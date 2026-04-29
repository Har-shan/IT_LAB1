import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Sidebar />
      <main style={{
        flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0
      }} className="main-content">
        <Outlet />
      </main>
      <style>{`
        @media (max-width: 767px) {
          .main-content { padding: 80px 16px 24px !important; }
        }
      `}</style>
    </div>
  )
}
