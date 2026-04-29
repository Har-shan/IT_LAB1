import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiAlertCircle,
  FiCalendar, FiClock, FiMapPin, FiBook
} from 'react-icons/fi'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const STREAMS = ['CSE', 'ECE', 'ME', 'CE', 'EEE']
const SECTIONS = ['A', 'B', 'C', 'D']
const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

const EMPTY_FORM = {
  subject_code: '', subject_name: '', room_id: '',
  day: 'Monday', start_time: '09:00', end_time: '10:00',
  stream: 'CSE', section: 'A', semester: 3, type: 'core'
}

export default function FacultyManage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [rooms, setRooms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterDay, setFilterDay] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [entriesRes, roomsRes, subjectsRes] = await Promise.all([
        api.get('/timetable/faculty'),
        api.get('/timetable/rooms'),
        api.get('/timetable/subjects'),
      ])
      setEntries(entriesRes.data.entries)
      setRooms(roomsRes.data.rooms)
      setSubjects(subjectsRes.data.subjects)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditEntry(null)
    setForm({ ...EMPTY_FORM, stream: user?.stream || 'CSE' })
    setShowForm(true)
  }

  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({
      subject_code: entry.subject_code,
      subject_name: entry.subject_name,
      room_id: entry.room_id,
      day: entry.day,
      start_time: entry.start_time,
      end_time: entry.end_time,
      stream: entry.stream,
      section: entry.section,
      semester: entry.semester,
      type: entry.type,
    })
    setShowForm(true)
  }

  const handleSubjectSelect = (code) => {
    const sub = subjects.find(s => s.code === code)
    if (sub) {
      setForm(p => ({ ...p, subject_code: sub.code, subject_name: sub.name, type: sub.type }))
    } else {
      setForm(p => ({ ...p, subject_code: code }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.start_time >= form.end_time) {
      toast.error('End time must be after start time')
      return
    }
    setSaving(true)
    try {
      if (editEntry) {
        await api.put(`/faculty/entries/${editEntry.id}`, form)
        toast.success('Entry updated successfully!')
      } else {
        await api.post('/faculty/entries', form)
        toast.success('Entry created successfully!')
      }
      setShowForm(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/faculty/entries/${id}`)
      toast.success('Entry deleted')
      setDeleteConfirm(null)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  const filteredEntries = filterDay
    ? entries.filter(e => e.day === filterDay)
    : entries

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--blue-200)', borderRadius: 8,
    fontSize: 13, outline: 'none', background: 'white',
    boxSizing: 'border-box'
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Manage Timetable"
        subtitle="Create, edit, and delete timetable entries"
        actions={
          <button
            onClick={openCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', background: 'var(--blue-600)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <FiPlus size={15} /> Add Entry
          </button>
        }
      />

      {/* Day Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterDay('')}
          style={{
            padding: '7px 14px', borderRadius: 8, border: 'none',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: !filterDay ? 'var(--blue-600)' : 'var(--blue-50)',
            color: !filterDay ? 'white' : 'var(--blue-700)'
          }}
        >
          All Days
        </button>
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setFilterDay(day)}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: filterDay === day ? 'var(--blue-600)' : 'var(--blue-50)',
              color: filterDay === day ? 'white' : 'var(--blue-700)'
            }}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--blue-500)' }}>Loading...</div>
      ) : filteredEntries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: 'white', borderRadius: 14,
          border: '1px dashed var(--blue-200)', color: 'var(--gray-400)'
        }}>
          <FiCalendar size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>No entries yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Click "Add Entry" to create your first timetable entry</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredEntries.map(entry => (
            <div key={entry.id} style={{
              background: 'white', borderRadius: 12, padding: '16px 20px',
              border: '1px solid var(--blue-100)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
            }}>
              <div style={{
                width: 4, height: 48, borderRadius: 2, flexShrink: 0,
                background: entry.type === 'core' ? 'var(--blue-600)' : '#0ea5e9'
              }} />

              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--blue-900)' }}>
                  {entry.subject_name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  {entry.subject_code} · {entry.stream} Sec {entry.section}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--gray-600)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiCalendar size={13} /> {entry.day}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiClock size={13} /> {entry.start_time}–{entry.end_time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiMapPin size={13} /> {entry.room_name}
                </span>
              </div>

              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                padding: '3px 10px', borderRadius: 20,
                background: entry.type === 'core' ? 'var(--blue-600)' : '#0ea5e9',
                color: 'white'
              }}>
                {entry.type}
              </span>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => openEdit(entry)}
                  style={{
                    padding: '7px 12px', background: 'var(--blue-50)',
                    border: '1px solid var(--blue-200)', borderRadius: 8,
                    color: 'var(--blue-700)', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(entry)}
                  style={{
                    padding: '7px 12px', background: '#fef2f2',
                    border: '1px solid #fecaca', borderRadius: 8,
                    color: '#dc2626', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <FiTrash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24, overflowY: 'auto'
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 20, padding: 32,
              maxWidth: 560, width: '100%', boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh', overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-900)' }}>
                {editEntry ? 'Edit Entry' : 'Add New Entry'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Subject */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Subject
                  </label>
                  <select
                    value={form.subject_code}
                    onChange={e => handleSubjectSelect(e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="">Select subject...</option>
                    {subjects.map(s => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code}) - {s.type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Name override */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={form.subject_name}
                    onChange={e => setForm(p => ({ ...p, subject_name: e.target.value }))}
                    placeholder="Subject name"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Day */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Day
                  </label>
                  <select
                    value={form.day}
                    onChange={e => setForm(p => ({ ...p, day: e.target.value }))}
                    style={inputStyle}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Room
                  </label>
                  <select
                    value={form.room_id}
                    onChange={e => setForm(p => ({ ...p, room_id: e.target.value }))}
                    style={inputStyle}
                    required
                  >
                    <option value="">Select room...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (cap: {r.capacity})</option>
                    ))}
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Start Time
                  </label>
                  <select
                    value={form.start_time}
                    onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                    style={inputStyle}
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* End Time */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    End Time
                  </label>
                  <select
                    value={form.end_time}
                    onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                    style={inputStyle}
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Stream */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Stream
                  </label>
                  <select
                    value={form.stream}
                    onChange={e => setForm(p => ({ ...p, stream: e.target.value }))}
                    style={inputStyle}
                  >
                    {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Section
                  </label>
                  <select
                    value={form.section}
                    onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                    style={inputStyle}
                  >
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Semester
                  </label>
                  <select
                    value={form.semester}
                    onChange={e => setForm(p => ({ ...p, semester: Number(e.target.value) }))}
                    style={inputStyle}
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1, padding: '11px', background: 'var(--gray-100)',
                    border: 'none', borderRadius: 10, fontSize: 14,
                    fontWeight: 600, cursor: 'pointer', color: 'var(--gray-700)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2, padding: '11px',
                    background: saving ? 'var(--blue-300)' : 'var(--blue-600)',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <FiSave size={14} />
                  {saving ? 'Saving...' : editEntry ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, padding: 24
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: 20, padding: 32,
              maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-xl)',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 56, height: 56, background: '#fef2f2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FiAlertCircle size={28} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8 }}>
              Delete Entry?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
              This will remove <strong>{deleteConfirm.subject_name}</strong> on{' '}
              <strong>{deleteConfirm.day}</strong> and notify affected students.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '11px', background: 'var(--gray-100)',
                  border: 'none', borderRadius: 10, fontSize: 14,
                  fontWeight: 600, cursor: 'pointer', color: 'var(--gray-700)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                style={{
                  flex: 1, padding: '11px', background: '#dc2626',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
