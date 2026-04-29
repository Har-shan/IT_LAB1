import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'
import {
  FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiUserX,
  FiX, FiSave, FiKey, FiPlus, FiFilter
} from 'react-icons/fi'

const STREAMS = ['M.Tech(CS)', 'M.Tech(AI)', 'IMT', 'MCA']
const SECTIONS = ['A', 'II', 'IV', 'VI', 'VIII']

const ROLE_COLORS = {
  admin: { bg: '#7c3aed', light: '#f5f3ff' },
  faculty: { bg: 'var(--blue-700)', light: 'var(--blue-50)' },
  student: { bg: '#0ea5e9', light: '#f0f9ff' },
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchUsers() }, [roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: roleFilter ? { role: roleFilter } : {} })
      setUsers(res.data.users)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (u) => {
    setEditUser(u)
    setEditForm({
      name: u.name, stream: u.stream || '', section: u.section || '',
      semester: u.semester || '', department: u.department || '',
      website_url: u.website_url || '', is_approved: u.is_approved,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/users/${editUser.id}`, editForm)
      toast.success('User updated')
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleApproval = async (u) => {
    try {
      const res = await api.put(`/admin/users/${u.id}/approve`)
      toast.success(res.data.message)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 6) { toast.error('Min 6 characters'); return }
    setSaving(true)
    try {
      await api.put(`/admin/users/${resetUser.id}/reset-password`, { new_password: newPassword })
      toast.success('Password reset successfully')
      setResetUser(null)
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteConfirm.id}`)
      toast.success('User deleted')
      setDeleteConfirm(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--blue-200)', borderRadius: 8,
    fontSize: 13, outline: 'none', background: 'white', boxSizing: 'border-box'
  }

  return (
    <div className="fade-in">
      <PageHeader title="User Management" subtitle="Manage faculty, students and their access" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FiSearch size={15} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--blue-400)'
          }} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['', 'faculty', 'student'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: roleFilter === r ? 'var(--blue-600)' : 'var(--blue-50)',
              color: roleFilter === r ? 'white' : 'var(--blue-700)'
            }}>
              {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--blue-500)' }}>Loading...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--blue-100)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--blue-900)' }}>
                  {['Name', 'Email', 'Role', 'Stream / Section', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      color: 'white', fontWeight: 600, fontSize: 12,
                      whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.student
                  return (
                    <tr key={u.id} style={{
                      borderBottom: '1px solid var(--blue-50)',
                      background: i % 2 === 0 ? 'white' : 'var(--gray-50)'
                    }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: rc.bg, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 13, flexShrink: 0
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--blue-900)' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--gray-600)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: rc.light, color: rc.bg,
                          borderRadius: 20, padding: '3px 10px',
                          fontSize: 11, fontWeight: 700, textTransform: 'capitalize'
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--gray-600)' }}>
                        {u.stream || '—'} {u.section ? `· ${u.section}` : ''}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: u.is_approved ? '#dcfce7' : '#fee2e2',
                          color: u.is_approved ? '#166534' : '#991b1b',
                          borderRadius: 20, padding: '3px 10px',
                          fontSize: 11, fontWeight: 700
                        }}>
                          {u.is_approved ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.role !== 'admin' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(u)} title="Edit" style={{
                              padding: '5px 8px', background: 'var(--blue-50)',
                              border: '1px solid var(--blue-200)', borderRadius: 6,
                              color: 'var(--blue-700)', cursor: 'pointer'
                            }}><FiEdit2 size={13} /></button>
                            <button onClick={() => handleToggleApproval(u)} title={u.is_approved ? 'Suspend' : 'Approve'} style={{
                              padding: '5px 8px',
                              background: u.is_approved ? '#fef2f2' : '#f0fdf4',
                              border: `1px solid ${u.is_approved ? '#fecaca' : '#bbf7d0'}`,
                              borderRadius: 6,
                              color: u.is_approved ? '#dc2626' : '#16a34a',
                              cursor: 'pointer'
                            }}>
                              {u.is_approved ? <FiUserX size={13} /> : <FiUserCheck size={13} />}
                            </button>
                            <button onClick={() => { setResetUser(u); setNewPassword('') }} title="Reset Password" style={{
                              padding: '5px 8px', background: '#fffbeb',
                              border: '1px solid #fde68a', borderRadius: 6,
                              color: '#d97706', cursor: 'pointer'
                            }}><FiKey size={13} /></button>
                            <button onClick={() => setDeleteConfirm(u)} title="Delete" style={{
                              padding: '5px 8px', background: '#fef2f2',
                              border: '1px solid #fecaca', borderRadius: 6,
                              color: '#dc2626', cursor: 'pointer'
                            }}><FiTrash2 size={13} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24
        }} onClick={() => setEditUser(null)}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 32,
            maxWidth: 500, width: '100%', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue-900)' }}>Edit User</h2>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                <FiX size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                { key: 'name', label: 'Full Name' },
                { key: 'department', label: 'Department' },
                { key: 'website_url', label: 'Website URL (faculty)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input type="text" value={editForm[key] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Stream</label>
                <select value={editForm.stream || ''} onChange={e => setEditForm(p => ({ ...p, stream: e.target.value }))} style={inputStyle}>
                  <option value="">— Select —</option>
                  {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {editUser.role === 'student' && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Section</label>
                    <select value={editForm.section || ''} onChange={e => setEditForm(p => ({ ...p, section: e.target.value }))} style={inputStyle}>
                      <option value="">— Select —</option>
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Semester</label>
                    <select value={editForm.semester || ''} onChange={e => setEditForm(p => ({ ...p, semester: Number(e.target.value) }))} style={inputStyle}>
                      <option value="">— Select —</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="approved" checked={editForm.is_approved} onChange={e => setEditForm(p => ({ ...p, is_approved: e.target.checked }))} style={{ accentColor: 'var(--blue-600)' }} />
                <label htmlFor="approved" style={{ fontSize: 13, color: 'var(--gray-700)', cursor: 'pointer' }}>Account Active</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setEditUser(null)} style={{
                flex: 1, padding: '10px', background: 'var(--gray-100)', border: 'none',
                borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--gray-700)'
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: '10px', background: saving ? 'var(--blue-300)' : 'var(--blue-600)',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <FiSave size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24
        }} onClick={() => setResetUser(null)}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 32,
            maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-xl)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue-900)', marginBottom: 6 }}>Reset Password</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
              Set a new password for <strong>{resetUser.name}</strong>
            </p>
            <input
              type="text" value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setResetUser(null)} style={{
                flex: 1, padding: '10px', background: 'var(--gray-100)', border: 'none',
                borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--gray-700)'
              }}>Cancel</button>
              <button onClick={handleResetPassword} disabled={saving} style={{
                flex: 1, padding: '10px', background: saving ? 'var(--blue-300)' : 'var(--blue-600)',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}>{saving ? 'Resetting...' : 'Reset'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24
        }} onClick={() => setDeleteConfirm(null)}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 32,
            maxWidth: 380, width: '100%', boxShadow: 'var(--shadow-xl)', textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 56, height: 56, background: '#fef2f2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <FiTrash2 size={24} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8 }}>Delete User?</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
              This will permanently delete <strong>{deleteConfirm.name}</strong> and all their data.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: '11px', background: 'var(--gray-100)', border: 'none',
                borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--gray-700)'
              }}>Cancel</button>
              <button onClick={handleDelete} style={{
                flex: 1, padding: '11px', background: '#dc2626', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
