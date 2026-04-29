import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import { FiUsers, FiCalendar, FiBook, FiMapPin, FiRefreshCw, FiUserCheck, FiUserX } from 'react-icons/fi'

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--blue-200)',
        borderTopColor: 'var(--blue-600)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const sortedDays = stats?.entries_per_day?.sort(
    (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
  ) || []

  const maxDayCount = Math.max(...sortedDays.map(d => d.count), 1)

  return (
    <div className="fade-in">
      <PageHeader
        title="Admin Overview"
        subtitle="SCIS Timetable System — January 2026"
        actions={
          <button onClick={fetchStats} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', background: 'var(--blue-50)',
            border: '1px solid var(--blue-200)', borderRadius: 10,
            color: 'var(--blue-700)', fontSize: 13, cursor: 'pointer'
          }}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Key Metrics */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16, marginBottom: 28
      }}>
        {[
          { icon: FiUsers, label: 'Total Users', value: stats?.total_users, color: 'var(--blue-600)' },
          { icon: FiUserCheck, label: 'Faculty', value: stats?.total_faculty, color: 'var(--blue-700)' },
          { icon: FiUsers, label: 'Students', value: stats?.total_students, color: '#0ea5e9' },
          { icon: FiCalendar, label: 'Timetable Slots', value: stats?.total_entries, color: 'var(--blue-500)' },
          { icon: FiBook, label: 'Subjects', value: stats?.total_subjects, color: 'var(--blue-800)' },
          { icon: FiMapPin, label: 'Rooms', value: stats?.total_rooms, color: 'var(--blue-400)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{
            background: 'white', borderRadius: 14, padding: '20px 16px',
            border: '1px solid var(--blue-100)', textAlign: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 44, height: 44, background: 'var(--blue-50)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px'
            }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Entries per Programme */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 24,
          border: '1px solid var(--blue-100)', boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 16 }}>
            Slots per Programme
          </h3>
          {stats?.entries_per_programme?.map(({ stream, count }) => {
            const max = Math.max(...(stats.entries_per_programme.map(e => e.count)), 1)
            return (
              <div key={stream} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--blue-900)', fontWeight: 500 }}>{stream}</span>
                  <span style={{ fontSize: 13, color: 'var(--blue-600)', fontWeight: 700 }}>{count}</span>
                </div>
                <div style={{ height: 8, background: 'var(--blue-100)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: 'var(--blue-600)',
                    width: `${(count / max) * 100}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Entries per Day */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 24,
          border: '1px solid var(--blue-100)', boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 16 }}>
            Slots per Day
          </h3>
          {sortedDays.map(({ day, count }) => (
            <div key={day} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--blue-900)', fontWeight: 500 }}>{day}</span>
                <span style={{ fontSize: 13, color: '#0ea5e9', fontWeight: 700 }}>{count}</span>
              </div>
              <div style={{ height: 8, background: 'var(--blue-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: '#0ea5e9',
                  width: `${(count / maxDayCount) * 100}%`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Faculty Workload */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 24,
          border: '1px solid var(--blue-100)', boxShadow: 'var(--shadow-sm)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 16 }}>
            Top Faculty by Workload
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--blue-50)' }}>
                  {['#', 'Faculty', 'Classes / Week'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      color: 'var(--blue-800)', fontWeight: 600, fontSize: 12
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.faculty_workload?.map(({ faculty, count }, i) => (
                  <tr key={faculty} style={{ borderBottom: '1px solid var(--blue-50)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--gray-400)', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--blue-900)', fontWeight: 500 }}>{faculty}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: 'var(--blue-100)', color: 'var(--blue-700)',
                        borderRadius: 20, padding: '2px 10px', fontWeight: 700
                      }}>{count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
