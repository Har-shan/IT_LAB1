import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import { FiDownload, FiRefreshCw, FiExternalLink } from 'react-icons/fi'

export default function AdminReports() {
  const [scheduleReport, setScheduleReport] = useState(null)
  const [facultyLoad, setFacultyLoad] = useState([])
  const [roomUtil, setRoomUtil] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('faculty')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [fl, ru] = await Promise.all([
        api.get('/admin/reports/faculty-load'),
        api.get('/admin/reports/room-utilization'),
      ])
      setFacultyLoad(fl.data.report)
      setRoomUtil(ru.data.report)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const maxLoad = Math.max(...facultyLoad.map(f => f.total_hours_per_week), 1)
  const maxRoom = Math.max(...roomUtil.map(r => r.total_bookings), 1)

  const tabs = [
    { id: 'faculty', label: 'Faculty Load' },
    { id: 'rooms', label: 'Room Utilization' },
  ]

  return (
    <div className="fade-in">
      <PageHeader
        title="Reports"
        subtitle="Analytics and usage statistics"
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

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'white', borderRadius: 10,
        border: '1px solid var(--blue-200)', overflow: 'hidden',
        marginBottom: 24, width: 'fit-content'
      }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '9px 20px', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
            background: activeTab === id ? 'var(--blue-600)' : 'transparent',
            color: activeTab === id ? 'white' : 'var(--blue-700)',
            transition: 'all 0.15s'
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--blue-500)' }}>Loading reports...</div>
      ) : activeTab === 'faculty' ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--blue-100)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--blue-100)', background: 'var(--blue-50)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-900)' }}>Faculty Teaching Load</h3>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Weekly hours per faculty member</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--blue-900)' }}>
                  {['#', 'Faculty', 'Email', 'Stream', 'Classes/Week', 'Hours/Week', 'Website', 'Load'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      color: 'white', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facultyLoad.map((f, i) => (
                  <tr key={f.faculty_id} style={{
                    borderBottom: '1px solid var(--blue-50)',
                    background: i % 2 === 0 ? 'white' : 'var(--gray-50)'
                  }}>
                    <td style={{ padding: '10px 14px', color: 'var(--gray-400)', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--blue-900)' }}>{f.name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--gray-500)' }}>{f.email}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--gray-600)' }}>{f.stream || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: 'var(--blue-100)', color: 'var(--blue-700)',
                        borderRadius: 20, padding: '2px 10px', fontWeight: 700
                      }}>{f.total_classes}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: '#f0fdf4', color: '#166534',
                        borderRadius: 20, padding: '2px 10px', fontWeight: 700
                      }}>{f.total_hours_per_week}h</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {f.website_url ? (
                        <a href={f.website_url} target="_blank" rel="noopener noreferrer" style={{
                          color: 'var(--blue-600)', display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 12, textDecoration: 'none'
                        }}>
                          <FiExternalLink size={12} /> Visit
                        </a>
                      ) : <span style={{ color: 'var(--gray-300)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px', minWidth: 120 }}>
                      <div style={{ height: 6, background: 'var(--blue-100)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          background: f.total_hours_per_week > 20 ? '#dc2626' : 'var(--blue-600)',
                          width: `${(f.total_hours_per_week / maxLoad) * 100}%`
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
                {facultyLoad.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>No faculty data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--blue-100)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--blue-100)', background: 'var(--blue-50)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-900)' }}>Room Utilization</h3>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Total bookings per room</p>
          </div>
          <div style={{ padding: 24 }}>
            {roomUtil.map(r => (
              <div key={r.room_id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue-900)' }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>cap: {r.capacity}</span>
                  </div>
                  <span style={{
                    background: 'var(--blue-100)', color: 'var(--blue-700)',
                    borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700
                  }}>{r.total_bookings} bookings</span>
                </div>
                <div style={{ height: 10, background: 'var(--blue-100)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 5,
                    background: 'var(--blue-600)',
                    width: `${(r.total_bookings / maxRoom) * 100}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
            {roomUtil.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No room data yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
