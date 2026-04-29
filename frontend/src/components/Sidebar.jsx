import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import {
  FiCalendar, FiBook, FiUser, FiLogOut, FiMenu, FiX,
  FiPlusSquare, FiGrid, FiBell, FiHome, FiUsers, FiBarChart2, FiSettings
} from 'react-icons/fi'

const studentLinks = [
  { to: '/student/timetable', icon: FiCalendar, label: 'My Timetable' },
  { to: '/student/subjects', icon: FiBook, label: 'My Subjects' },
  { to: '/student/profile', icon: FiUser, label: 'Profile' },
]

const facultyLinks = [
  { to: '/faculty/timetable', icon: FiCalendar, label: 'My Schedule' },
  { to: '/faculty/manage', icon: FiPlusSquare, label: 'Manage Timetable' },
  { to: '/faculty/profile', icon: FiUser, label: 'Profile' },
]

const adminLinks = [
  { to: '/admin/overview', icon: FiHome, label: 'Overview' },
  { to: '/admin/users', icon: FiUsers, label: 'User Management' },
  { to: '/admin/timetable', icon: FiCalendar, label: 'Timetable' },
  { to: '/admin/reports', icon: FiBarChart2, label: 'Reports' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = user?.role === 'faculty' ? facultyLinks : user?.role === 'admin' ? adminLinks : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--blue-900)', color: 'white',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 12px' : '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 12,
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: 'var(--blue-500)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiGrid size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>TimeTable</div>
              <div style={{ fontSize: 11, color: 'var(--blue-300)', textTransform: 'capitalize' }}>
                {user?.role === 'admin' ? 'Admin Portal' : `${user?.role} Portal`}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
            borderRadius: 8, padding: 8, display: 'flex', cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--blue-600)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--blue-300)' }}>
              {user?.stream} {user?.section ? `· Sec ${user.section}` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 12,
              padding: collapsed ? '12px' : '11px 14px',
              borderRadius: 10, marginBottom: 4,
              color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'var(--blue-600)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14, transition: 'all 0.15s',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
            })}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Notifications badge + Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {!collapsed && unreadCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10, marginBottom: 8,
            background: 'rgba(255,255,255,0.08)', fontSize: 13, color: 'var(--blue-200)'
          }}>
            <FiBell size={16} />
            <span>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 12, justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '11px 14px',
            borderRadius: 10, background: 'rgba(255,255,255,0.08)',
            border: 'none', color: 'rgba(255,255,255,0.75)',
            fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 240, flexShrink: 0,
        height: '100vh', position: 'sticky', top: 0,
        transition: 'width 0.25s ease',
        display: 'none',
        '@media (min-width: 768px)': { display: 'block' }
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--blue-900)', padding: '12px 16px',
        alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--blue-500)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiGrid size={16} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>TimeTable</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex'
        }}>
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ width: 260, height: '100%' }}>
            <SidebarContent />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: block !important; }
          .mobile-header { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </>
  )
}
