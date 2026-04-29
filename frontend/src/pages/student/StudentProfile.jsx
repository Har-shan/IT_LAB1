import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiBook, FiLock, FiSave, FiEye, FiEyeOff } from 'react-icons/fi'

export default function StudentProfile() {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
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
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px 10px 40px',
    border: '1.5px solid var(--blue-200)', borderRadius: 10,
    fontSize: 14, outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div className="fade-in">
      <PageHeader title="My Profile" subtitle="Your account information" />

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
              background: 'var(--blue-600)', display: 'flex',
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
              borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600,
              textTransform: 'capitalize'
            }}>
              👨‍🎓 Student
            </span>
          </div>

          {/* Info */}
          {[
            { icon: FiUser, label: 'Full Name', value: user?.name },
            { icon: FiMail, label: 'Email', value: user?.email },
            { icon: FiBook, label: 'Stream', value: user?.stream },
            { icon: FiBook, label: 'Section', value: `Section ${user?.section}` },
            { icon: FiBook, label: 'Semester', value: `Semester ${user?.semester}` },
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

          {/* Enrolled subjects */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 8 }}>
              ENROLLED SUBJECTS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(user?.enrolled_subjects || []).map(code => (
                <span key={code} style={{
                  background: 'var(--blue-50)', color: 'var(--blue-700)',
                  borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                  border: '1px solid var(--blue-200)'
                }}>{code}</span>
              ))}
            </div>
          </div>
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
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                    onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                  />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <input
                type="checkbox"
                id="showpw"
                checked={showPw}
                onChange={e => setShowPw(e.target.checked)}
                style={{ accentColor: 'var(--blue-600)' }}
              />
              <label htmlFor="showpw" style={{ fontSize: 13, color: 'var(--gray-600)', cursor: 'pointer' }}>
                Show passwords
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%', padding: '11px',
                background: saving ? 'var(--blue-300)' : 'var(--blue-600)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <FiSave size={14} />
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
