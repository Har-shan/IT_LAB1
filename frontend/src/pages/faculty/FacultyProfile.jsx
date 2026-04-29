import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'
import {
  FiUser, FiMail, FiBook, FiLock, FiSave, FiCalendar,
  FiUsers, FiGlobe, FiEdit2, FiExternalLink
} from 'react-icons/fi'

export default function FacultyProfile() {
  const { user, updateUser } = useAuth()
  const [stats, setStats] = useState({ total: 0, streams: 0, sections: 0 })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [profileForm, setProfileForm] = useState({ name: '', website_url: '', department: '' })
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  useEffect(() => {
    fetchStats()
    if (user) {
      setProfileForm({
        name: user.name || '',
        website_url: user.website_url || '',
        department: user.department || '',
      })
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const res = await api.get('/timetable/faculty')
      const entries = res.data.entries
      setStats({
        total: entries.length,
        streams: new Set(entries.map(e => e.stream)).size,
        sections: new Set(entries.map(e => `${e.stream}-${e.section}`)).size,
      })
    } catch {}
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await api.put('/auth/update-profile', profileForm)
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setEditingProfile(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPw(true)
    try {
      await api.put('/auth/change-password', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password
      })
      toast.success('Password updated successfully!')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally {
      setSavingPw(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--blue-200)', borderRadius: 10,
    fontSize: 14, outline: 'none', boxSizing: 'border-box'
  }

  const inputWithIconStyle = {
    ...inputStyle, paddingLeft: 40
  }

  return (
    <div className="fade-in">
      <PageHeader title="My Profile" subtitle="Faculty account information" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Profile Card */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 28,
          border: '1px solid var(--blue-100)', boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--blue-700)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: 'white',
              margin: '0 auto 12px'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue-900)' }}>{user?.name}</h2>
            <span style={{
              display: 'inline-block', marginTop: 6,
              background: 'var(--blue-100)', color: 'var(--blue-700)',
              borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600
            }}>
              🧑‍🏫 Faculty
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { icon: FiCalendar, label: 'Classes', value: stats.total },
              { icon: FiBook, label: 'Streams', value: stats.streams },
              { icon: FiUsers, label: 'Sections', value: stats.sections },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                background: 'var(--blue-50)', borderRadius: 10, padding: '12px 8px',
                textAlign: 'center', border: '1px solid var(--blue-100)'
              }}>
                <Icon size={16} color="var(--blue-600)" style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-700)' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Info rows */}
          {[
            { icon: FiUser, label: 'Full Name', value: user?.name },
            { icon: FiMail, label: 'Email', value: user?.email },
            { icon: FiBook, label: 'Stream', value: user?.stream },
            { icon: FiBook, label: 'Department', value: user?.department || 'N/A' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', borderBottom: '1px solid var(--blue-50)'
            }}>
              <div style={{
                width: 36, height: 36, background: 'var(--blue-50)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={16} color="var(--blue-600)" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 14, color: 'var(--blue-900)', fontWeight: 600 }}>{value}</div>
              </div>
            </div>
          ))}

          {/* Website URL row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0', borderBottom: '1px solid var(--blue-50)'
          }}>
            <div style={{
              width: 36, height: 36, background: 'var(--blue-50)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiGlobe size={16} color="var(--blue-600)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Website</div>
              {user?.website_url ? (
                <a
                  href={user.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 14, color: 'var(--blue-600)', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                    textDecoration: 'none', wordBreak: 'break-all'
                  }}
                >
                  <FiExternalLink size={13} />
                  {user.website_url.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>
                  Not set — add your academic website below
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            style={{
              width: '100%', marginTop: 16, padding: '10px',
              background: editingProfile ? 'var(--gray-100)' : 'var(--blue-50)',
              border: `1px solid ${editingProfile ? 'var(--gray-200)' : 'var(--blue-200)'}`,
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: editingProfile ? 'var(--gray-600)' : 'var(--blue-700)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <FiEdit2 size={14} />
            {editingProfile ? 'Cancel Editing' : 'Edit Profile'}
          </button>

          {/* Edit Profile Form */}
          {editingProfile && (
            <form onSubmit={handleProfileSave} style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                  onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                  Department
                </label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))}
                  placeholder="e.g. Computer Science"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                  onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                  Academic / Personal Website URL
                </label>
                <div style={{ position: 'relative' }}>
                  <FiGlobe size={15} style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--blue-400)'
                  }} />
                  <input
                    type="url"
                    value={profileForm.website_url}
                    onChange={e => setProfileForm(p => ({ ...p, website_url: e.target.value }))}
                    placeholder="https://faculty.uohyd.ac.in/yourname"
                    style={inputWithIconStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                    onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                  Students can click your name in the timetable to visit this page.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                style={{
                  width: '100%', padding: '11px',
                  background: savingProfile ? 'var(--blue-300)' : 'var(--blue-600)',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: savingProfile ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <FiSave size={14} />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}
        </div>

        {/* Change Password */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 28,
          border: '1px solid var(--blue-100)', boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 20 }}>
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange}>
            {[
              { field: 'old_password', label: 'Current Password', placeholder: 'Enter current password' },
              { field: 'new_password', label: 'New Password', placeholder: 'Min. 6 characters' },
              { field: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ field, label, placeholder }) => (
              <div key={field} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock size={15} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--blue-400)'
                  }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    style={inputWithIconStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                    onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                  />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <input
                type="checkbox" id="showpw-faculty"
                checked={showPw} onChange={e => setShowPw(e.target.checked)}
                style={{ accentColor: 'var(--blue-600)' }}
              />
              <label htmlFor="showpw-faculty" style={{ fontSize: 13, color: 'var(--gray-600)', cursor: 'pointer' }}>
                Show passwords
              </label>
            </div>
            <button
              type="submit" disabled={savingPw}
              style={{
                width: '100%', padding: '11px',
                background: savingPw ? 'var(--blue-300)' : 'var(--blue-600)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: savingPw ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <FiSave size={14} />
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
