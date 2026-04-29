import React, { useState } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { FiBell, FiX, FiCheck, FiCheckCircle, FiInfo, FiAlertCircle } from 'react-icons/fi'

export default function NotificationPanel() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const getIcon = (type) => {
    if (type === 'update') return <FiAlertCircle size={16} color="var(--blue-500)" />
    if (type === 'reminder') return <FiInfo size={16} color="var(--blue-400)" />
    return <FiInfo size={16} color="var(--blue-300)" />
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'var(--blue-50)',
          border: '1px solid var(--blue-200)', borderRadius: 10,
          padding: '8px 12px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: 6, color: 'var(--blue-700)',
          transition: 'all 0.15s'
        }}
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: 'var(--blue-600)', color: 'white',
            borderRadius: '50%', width: 20, height: 20,
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 360, maxHeight: 480, background: 'white',
            borderRadius: 14, boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--blue-100)', zIndex: 100,
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid var(--blue-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--blue-50)'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--blue-900)', fontSize: 15 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    marginLeft: 8, background: 'var(--blue-600)', color: 'white',
                    borderRadius: 20, padding: '2px 8px', fontSize: 12
                  }}>{unreadCount}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none', border: 'none', color: 'var(--blue-600)',
                      fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <FiCheck size={14} /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: 32, textAlign: 'center', color: 'var(--gray-400)'
                }}>
                  <FiBell size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p style={{ fontSize: 14 }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--gray-100)',
                      background: n.is_read ? 'white' : 'var(--blue-50)',
                      cursor: n.is_read ? 'default' : 'pointer',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0 }}>{getIcon(n.type)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--blue-500)', flexShrink: 0, marginTop: 4
                      }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
