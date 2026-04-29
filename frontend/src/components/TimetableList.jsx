import React from 'react'
import { FiClock, FiMapPin, FiUser, FiBook, FiExternalLink } from 'react-icons/fi'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const TYPE_COLORS = {
  core: { bg: 'var(--blue-600)', light: 'var(--blue-50)', border: 'var(--blue-200)', text: 'var(--blue-800)' },
  elective: { bg: '#0ea5e9', light: '#f0f9ff', border: '#bae6fd', text: '#0c4a6e' },
}

export default function TimetableList({ entries, onEntryClick, filterDay }) {
  const days = filterDay ? [filterDay] : DAYS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {days.map(day => {
        const dayEntries = entries
          .filter(e => e.day === day)
          .sort((a, b) => a.start_time.localeCompare(b.start_time))

        if (dayEntries.length === 0) return null

        return (
          <div key={day}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: 'var(--blue-600)'
              }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue-900)' }}>{day}</h3>
              <div style={{
                height: 1, flex: 1, background: 'var(--blue-100)'
              }} />
              <span style={{
                fontSize: 12, color: 'var(--blue-500)', fontWeight: 500
              }}>{dayEntries.length} class{dayEntries.length > 1 ? 'es' : ''}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dayEntries.map(entry => {
                const colors = TYPE_COLORS[entry.type] || TYPE_COLORS.core
                return (
                  <div
                    key={entry.id}
                    onClick={() => onEntryClick && onEntryClick(entry)}
                    style={{
                      background: 'white', border: `1px solid ${colors.border}`,
                      borderLeft: `4px solid ${colors.bg}`,
                      borderRadius: 12, padding: '14px 16px',
                      cursor: onEntryClick ? 'pointer' : 'default',
                      transition: 'all 0.15s', display: 'flex',
                      alignItems: 'center', gap: 16, flexWrap: 'wrap'
                    }}
                    onMouseEnter={e => {
                      if (onEntryClick) {
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                        e.currentTarget.style.transform = 'translateX(2px)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'none'
                    }}
                  >
                    {/* Time */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      color: 'var(--blue-700)', fontSize: 13, fontWeight: 600,
                      minWidth: 110
                    }}>
                      <FiClock size={14} />
                      {entry.start_time} – {entry.end_time}
                    </div>

                    {/* Subject */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--blue-900)' }}>
                        {entry.subject_name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                        {entry.subject_code}
                      </div>
                    </div>

                    {/* Room */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 13, color: 'var(--gray-600)'
                    }}>
                      <FiMapPin size={13} />
                      {entry.room_name}
                    </div>

                    {/* Faculty */}
                    {entry.faculty_name && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 13, color: 'var(--gray-600)'
                      }}>
                        <FiUser size={13} />
                        {entry.faculty_website ? (
                          <a
                            href={entry.faculty_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              color: 'var(--blue-600)', fontWeight: 500,
                              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3
                            }}
                            title="Visit faculty website"
                          >
                            {entry.faculty_name}
                            <FiExternalLink size={11} />
                          </a>
                        ) : (
                          entry.faculty_name
                        )}
                      </div>
                    )}

                    {/* Type badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      padding: '3px 10px', borderRadius: 20,
                      background: colors.bg, color: 'white'
                    }}>
                      {entry.type}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {entries.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          color: 'var(--gray-400)', background: 'white',
          borderRadius: 14, border: '1px dashed var(--blue-200)'
        }}>
          <FiBook size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>No classes found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}
