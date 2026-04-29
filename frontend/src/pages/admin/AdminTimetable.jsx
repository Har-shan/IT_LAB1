import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import TimetableGrid from '../../components/TimetableGrid'
import TimetableList from '../../components/TimetableList'
import toast from 'react-hot-toast'
import { FiGrid, FiList, FiFilter, FiRefreshCw, FiTrash2, FiX } from 'react-icons/fi'

const STREAMS = ['M.Tech(CS)', 'M.Tech(AI)', 'IMT', 'MCA']
const SECTIONS = ['A', 'II', 'IV', 'VI', 'VIII']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function AdminTimetable() {
  const [entries, setEntries] = useState([])
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [filters, setFilters] = useState({ stream: '', section: '', day: '', faculty_id: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [entriesRes, facultyRes] = await Promise.all([
        api.get('/admin/timetable'),
        api.get('/admin/users', { params: { role: 'faculty' } }),
      ])
      setEntries(entriesRes.data.entries)
      setFaculty(facultyRes.data.users)
    } catch {
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.stream) params.stream = filters.stream
      if (filters.section) params.section = filters.section
      if (filters.day) params.day = filters.day
      if (filters.faculty_id) params.faculty_id = filters.faculty_id
      const res = await api.get('/admin/timetable', { params })
      setEntries(res.data.entries)
    } catch {
      toast.error('Failed to filter')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/timetable/${deleteConfirm.id}`)
      toast.success('Entry deleted')
      setDeleteConfirm(null)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  const selectStyle = {
    padding: '8px 12px', border: '1.5px solid var(--blue-200)',
    borderRadius: 8, fontSize: 13, outline: 'none', background: 'white'
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Timetable Management"
        subtitle={`${entries.length} entries loaded`}
        actions={
          <button onClick={fetchAll} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', background: 'var(--blue-50)',
            border: '1px solid var(--blue-200)', borderRadius: 10,
            color: 'var(--blue-700)', fontSize: 13, cursor: 'pointer'
          }}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: 12, padding: '16px 20px',
        marginBottom: 20, border: '1px solid var(--blue-100)',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end'
      }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>PROGRAMME</label>
          <select value={filters.stream} onChange={e => setFilters(p => ({ ...p, stream: e.target.value }))} style={selectStyle}>
            <option value="">All</option>
            {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>SECTION</label>
          <select value={filters.section} onChange={e => setFilters(p => ({ ...p, section: e.target.value }))} style={selectStyle}>
            <option value="">All</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>DAY</label>
          <select value={filters.day} onChange={e => setFilters(p => ({ ...p, day: e.target.value }))} style={selectStyle}>
            <option value="">All Days</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>FACULTY</label>
          <select value={filters.faculty_id} onChange={e => setFilters(p => ({ ...p, faculty_id: e.target.value }))} style={selectStyle}>
            <option value="">All Faculty</option>
            {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <button onClick={applyFilters} style={{
          padding: '8px 18px', background: 'var(--blue-600)', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <FiFilter size={13} /> Apply
        </button>
        <button onClick={() => { setFilters({ stream: '', section: '', day: '', faculty_id: '' }); fetchAll() }} style={{
          padding: '8px 14px', background: 'var(--gray-100)', color: 'var(--gray-600)',
          border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer'
        }}>
          Clear
        </button>
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ id: 'list', icon: FiList, label: 'List' }, { id: 'week', icon: FiGrid, label: 'Grid' }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setView(id)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: view === id ? 'var(--blue-600)' : 'var(--blue-50)',
            color: view === id ? 'white' : 'var(--blue-700)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--blue-500)' }}>Loading...</div>
      ) : view === 'week' ? (
        <TimetableGrid entries={entries} onEntryClick={setSelectedEntry} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map(entry => (
            <div key={entry.id} style={{
              background: 'white', borderRadius: 12, padding: '14px 18px',
              border: '1px solid var(--blue-100)', display: 'flex',
              alignItems: 'center', gap: 16, flexWrap: 'wrap'
            }}>
              <div style={{
                width: 4, height: 40, borderRadius: 2, flexShrink: 0,
                background: entry.type === 'core' ? 'var(--blue-600)' : '#0ea5e9'
              }} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--blue-900)' }}>{entry.subject_name}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{entry.subject_code} · {entry.stream} {entry.section}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{entry.day} {entry.start_time}–{entry.end_time}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{entry.room_name}</div>
              <div style={{ fontSize: 12, color: 'var(--blue-700)', fontWeight: 500 }}>{entry.faculty_name}</div>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 20,
                background: entry.type === 'core' ? 'var(--blue-600)' : '#0ea5e9',
                color: 'white'
              }}>{entry.type}</span>
              <button onClick={() => setDeleteConfirm(entry)} style={{
                padding: '5px 8px', background: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: 6,
                color: '#dc2626', cursor: 'pointer'
              }}><FiTrash2 size={13} /></button>
            </div>
          ))}
          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)' }}>
              No entries found. Adjust filters or add faculty to create entries.
            </div>
          )}
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8 }}>Delete Entry?</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
              Remove <strong>{deleteConfirm.subject_name}</strong> on {deleteConfirm.day} {deleteConfirm.start_time}–{deleteConfirm.end_time}?
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
