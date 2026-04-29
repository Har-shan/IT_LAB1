import React from 'react'
import NotificationPanel from './NotificationPanel'
import { useAuth } from '../context/AuthContext'

export default function PageHeader({ title, subtitle, actions }) {
  const { user } = useAuth()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 28, flexWrap: 'wrap', gap: 12
    }}>
      <div>
        <h1 style={{
          fontSize: 24, fontWeight: 700, color: 'var(--blue-900)', lineHeight: 1.2
        }}>{title}</h1>
        {subtitle && (
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {actions}
        {user?.role === 'student' && <NotificationPanel />}
      </div>
    </div>
  )
}
