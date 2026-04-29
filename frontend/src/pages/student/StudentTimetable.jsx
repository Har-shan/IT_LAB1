import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import TimetableGrid from '../../components/TimetableGrid'
import TimetableList from '../../components/TimetableList'
import toast from 'react-hot-toast'
import {
  FiGrid, FiList, FiCalendar, FiFilter, FiX, FiRefreshCw, FiExternalLink
} from 'react-icons/fi'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TODAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]

export default function StudentTimetable() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('week') // 'week' | 'day' | 'list'
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(TODAY) ? TODAY : 'Monday')
  const [filters, setFilters] = useState({ type: '', subject: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => { fetchTimetable() }, [])

  useEffect(() => {
    let result = [...entries]
    if (filters.type) result = result.filter(e => e.type === filters.type)
    if (filters.subject) result = result.filter(e =>
      e.subject_name.toLowerCase().includes(filters.subject.toLowerCase()) ||
      e.subject_code.toLowerCase().includes(filters.subject.toLowerCase())
    )
    setFiltered(result)
  }, [entries, filters])

  const fetchTimetable = async () => {
    setLoading(true)
    try {
      const res = await api.get('/timetable/student')
      setEntries(res.data.entries)
    } catch {
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const todayEntries = filtered.filter(e => e.day === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="fade-in">
      <PageHeader
        title="My Timetable"
        subtitle={`${user?.stream} · Semester ${user?.semester}`}
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

      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 20, flexWrap: 'wrap'
      }}>
        {/* View Toggle */}
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

        {/* Day selector (for day view) */}
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

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10, border: 'none',
            background: activeFiltersCount > 0 ? 'var(--blue-600)' : 'var(--blue-50)',
            color: activeFiltersCount > 0 ? 'white' : 'var(--blue-700)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer'
          }}
        >
          <FiFilter size={14} />
          Filters
          {activeFiltersCount > 0 && (
            <span style={{
              background: 'white', color: 'var(--blue-600)',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{activeFiltersCount}</span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={() => setFilters({ type: '', subject: '' })}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '8px 12px', borderRadius: 10, border: 'none',
              background: 'var(--gray-100)', color: 'var(--gray-600)',
              fontSize: 13, cursor: 'pointer'
            }}
          >
            <FiX size={13} /> Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          background: 'white', borderRadius: 12, padding: 20,
          marginBottom: 20, border: '1px solid var(--blue-100)',
          display: 'flex', gap: 16, flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
              Type
            </label>
            <select
              value={filters.type}
              onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
              style={{
                padding: '8px 12px', border: '1.5px solid var(--blue-200)',
                borderRadius: 8, fontSize: 13, outline: 'none', background: 'white'
              }}
            >
              <option value="">All Types</option>
              <option value="core">Core</option>
              <option value="elective">Elective</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
              Subject
            </label>
            <input
              type="text"
              value={filters.subject}
              onChange={e => setFilters(p => ({ ...p, subject: e.target.value }))}
              placeholder="Search subject..."
              style={{
                padding: '8px 12px', border: '1.5px solid var(--blue-200)',
                borderRadius: 8, fontSize: 13, outline: 'none', width: 200
              }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24
      }}>
        {[
          { label: 'Total Classes', value: filtered.length, color: 'var(--blue-600)' },
          { label: 'Core Classes', value: filtered.filter(e => e.type === 'core').length, color: 'var(--blue-700)' },
          { label: 'Electives', value: filtered.filter(e => e.type === 'elective').length, color: '#0ea5e9' },
          { label: "Today's Classes", value: filtered.filter(e => e.day === TODAY).length, color: 'var(--blue-500)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white', borderRadius: 12, padding: '16px',
            border: '1px solid var(--blue-100)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Timetable Content */}
      {loading ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 200, color: 'var(--blue-500)'
        }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--blue-200)',
            borderTopColor: 'var(--blue-600)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {view === 'week' && (
            <TimetableGrid entries={filtered} onEntryClick={setSelectedEntry} />
          )}
          {view === 'day' && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16
              }}>
                <FiCalendar size={16} color="var(--blue-600)" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue-900)' }}>
                  {selectedDay}
                </h2>
                <span style={{
                  background: 'var(--blue-100)', color: 'var(--blue-700)',
                  borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600
                }}>
                  {todayEntries.length} class{todayEntries.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <TimetableList
                entries={filtered}
                filterDay={selectedDay}
                onEntryClick={setSelectedEntry}
              />
            </div>
          )}
          {view === 'list' && (
            <TimetableList entries={filtered} onEntryClick={setSelectedEntry} />
          )}
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
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20
            }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-900)' }}>
                  {selectedEntry.subject_name}
                </h2>
                <span style={{
                  fontSize: 12, color: 'var(--blue-600)', fontWeight: 600,
                  background: 'var(--blue-50)', padding: '2px 8px', borderRadius: 6
                }}>
                  {selectedEntry.subject_code}
                </span>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <FiX size={20} />
              </button>
            </div>
            {[
              { label: 'Day', value: selectedEntry.day },
              { label: 'Time', value: `${selectedEntry.start_time} – ${selectedEntry.end_time}` },
              { label: 'Room', value: selectedEntry.room_name },
              { label: 'Type', value: selectedEntry.type },
              { label: 'Stream', value: selectedEntry.stream },
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
            {/* Faculty row with clickable website */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--blue-50)'
            }}>
              <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>Faculty</span>
              {selectedEntry.faculty_website ? (
                <a
                  href={selectedEntry.faculty_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, color: 'var(--blue-600)', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 5,
                    textDecoration: 'none', cursor: 'pointer'
                  }}
                  title="Visit faculty website"
                >
                  {selectedEntry.faculty_name}
                  <FiExternalLink size={13} />
                </a>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--blue-900)', fontWeight: 600 }}>
                  {selectedEntry.faculty_name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
