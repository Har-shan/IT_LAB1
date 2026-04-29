import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'
import { FiBook, FiCheck, FiPlus, FiMinus, FiSave } from 'react-icons/fi'

export default function StudentSubjects() {
  const { user, updateUser } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState(new Set(user?.enrolled_subjects || []))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'core' | 'elective'

  useEffect(() => { fetchSubjects() }, [])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const res = await api.get('/student/subjects')
      setSubjects(res.data.subjects)
      const enrolled = res.data.subjects.filter(s => s.enrolled).map(s => s.code)
      setSelected(new Set(enrolled))
    } catch {
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const toggle = (code) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const saveEnrollment = async () => {
    setSaving(true)
    try {
      const res = await api.put('/student/enroll', { subject_codes: [...selected] })
      updateUser({ ...user, enrolled_subjects: res.data.enrolled_subjects })
      toast.success('Enrollment updated successfully!')
    } catch {
      toast.error('Failed to update enrollment')
    } finally {
      setSaving(false)
    }
  }

  const filtered = subjects.filter(s => filter === 'all' || s.type === filter)
  const hasChanges = JSON.stringify([...selected].sort()) !==
    JSON.stringify((user?.enrolled_subjects || []).sort())

  return (
    <div className="fade-in">
      <PageHeader
        title="My Subjects"
        subtitle="Manage your enrolled courses and electives"
        actions={
          hasChanges && (
            <button
              onClick={saveEnrollment}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', background: 'var(--blue-600)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <FiSave size={14} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )
        }
      />

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24
      }}>
        {[
          { label: 'Total Subjects', value: subjects.length },
          { label: 'Enrolled', value: selected.size, highlight: true },
          { label: 'Core', value: subjects.filter(s => s.type === 'core').length },
          { label: 'Electives', value: subjects.filter(s => s.type === 'elective').length },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.highlight ? 'var(--blue-600)' : 'white',
            borderRadius: 12, padding: '16px',
            border: '1px solid var(--blue-100)', textAlign: 'center'
          }}>
            <div style={{
              fontSize: 26, fontWeight: 800,
              color: stat.highlight ? 'white' : 'var(--blue-700)'
            }}>{stat.value}</div>
            <div style={{
              fontSize: 12, marginTop: 2,
              color: stat.highlight ? 'var(--blue-100)' : 'var(--gray-500)'
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20
      }}>
        {['all', 'core', 'elective'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: filter === f ? 'var(--blue-600)' : 'var(--blue-50)',
              color: filter === f ? 'white' : 'var(--blue-700)',
              textTransform: 'capitalize', transition: 'all 0.15s'
            }}
          >
            {f === 'all' ? 'All Subjects' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--blue-500)' }}>
          Loading subjects...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16
        }}>
          {filtered.map(subject => {
            const isEnrolled = selected.has(subject.code)
            return (
              <div
                key={subject.code}
                style={{
                  background: 'white', borderRadius: 14, padding: '20px',
                  border: `2px solid ${isEnrolled ? 'var(--blue-400)' : 'var(--blue-100)'}`,
                  transition: 'all 0.2s', cursor: 'pointer',
                  boxShadow: isEnrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
                onClick={() => toggle(subject.code)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 4
                    }}>
                      {subject.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
                      {subject.code} · {subject.stream}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      padding: '3px 10px', borderRadius: 20,
                      background: subject.type === 'core' ? 'var(--blue-600)' : '#0ea5e9',
                      color: 'white'
                    }}>
                      {subject.type}
                    </span>
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isEnrolled ? 'var(--blue-600)' : 'var(--blue-50)',
                    border: `2px solid ${isEnrolled ? 'var(--blue-600)' : 'var(--blue-200)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}>
                    {isEnrolled
                      ? <FiCheck size={16} color="white" />
                      : <FiPlus size={16} color="var(--blue-400)" />
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {hasChanges && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--blue-900)', color: 'white',
          borderRadius: 14, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-xl)', zIndex: 50
        }}>
          <span style={{ fontSize: 14 }}>You have unsaved changes</span>
          <button
            onClick={saveEnrollment}
            disabled={saving}
            style={{
              background: 'var(--blue-500)', color: 'white', border: 'none',
              borderRadius: 8, padding: '7px 16px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <FiSave size={13} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
