import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import TimetableGrid from '../../components/TimetableGrid'
import TimetableList from '../../components/TimetableList'
import toast from 'react-hot-toast'
import { FiGrid, FiList, FiCalendar, FiRefreshCw, FiX } from 'react-icons/fi'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TODAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]

export default function FacultyTimetable() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('week')
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(TODAY) ? TODAY : 'Monday')
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => { fetchTimetable() }, [])

  const fetchTimetable = async () => {
    setLoading(true)
    try {
      const res = await api.get('/timetable/faculty')
      setEntries(res.data.entries)
    } catch {
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="My Schedule"
        subtitle={`${user?.name} · ${user?.stream} Department`}
        actions={
          <button
            onClick={fetchTimetable}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', background: 'var(--blue-50)',
              border: '1px solid var(--blue-200)', borderRadius: 10,
              color: 'var(--blue-700)', fontSize: 13, fontWeight: 500, cursor: 'pointer'
            }}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24
      }}>
        {[
          { label: 'Total Classes', value: entries.length },
          { label: 'This Week', value: entries.length },
          { label: 'Streams', value: [...new Set(entries.map(e => e.stream))].length },
          { label: "Today's Classes", value: entries.filter(e => e.day === TODAY).length },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white', borderRadius: 12, padding: '16px',
            border: '1px solid var(--blue-100)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue-600)' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', background: 'white', borderRadius: 10,
          border: '1px solid var(--blue-200)', overflow: 'hidden'
        }}>
          {[
            { id: 'week', icon: FiGrid, label: 'Week' },
            { id: 'day', icon: FiCalendar, label: 'Day' },
            { id: 'list', icon: FiList, label: 'List' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                padding: '8px 16px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500,
                background: view === id ? 'var(--blue-600)' : 'transparent',
                color: view === id ? 'white' : 'var(--blue-700)',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {view === 'day' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: selectedDay === day ? 'var(--blue-600)' : 'var(--blue-50)',
                  color: selectedDay === day ? 'white' : 'var(--blue-700)',
                  transition: 'all 0.15s'
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--blue-200)',
            borderTopColor: 'var(--blue-600)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {view === 'week' && <TimetableGrid entries={entries} onEntryClick={setSelectedEntry} />}
          {view === 'day' && (
            <TimetableList entries={entries} filterDay={selectedDay} onEntryClick={setSelectedEntry} />
          )}
          {view === 'list' && <TimetableList entries={entries} onEntryClick={setSelectedEntry} />}
        </>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24
          }}
          onClick={() => setSelectedEntry(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: 20, padding: 32,
              maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-xl)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-900)' }}>
                {selectedEntry.subject_name}
              </h2>
              <button
                onClick={() => setSelectedEntry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <FiX size={20} />
              </button>
            </div>
            {[
              { label: 'Subject Code', value: selectedEntry.subject_code },
              { label: 'Day', value: selectedEntry.day },
              { label: 'Time', value: `${selectedEntry.start_time} – ${selectedEntry.end_time}` },
              { label: 'Room', value: selectedEntry.room_name },
              { label: 'Stream', value: selectedEntry.stream },
              { label: 'Section', value: selectedEntry.section },
              { label: 'Semester', value: `Semester ${selectedEntry.semester}` },
              { label: 'Type', value: selectedEntry.type },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid var(--blue-50)'
              }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--blue-900)', fontWeight: 600, textTransform: 'capitalize' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
