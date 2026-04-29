import React from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

const TYPE_COLORS = {
  core: { bg: 'var(--blue-600)', light: 'var(--blue-50)', border: 'var(--blue-200)', text: 'var(--blue-800)' },
  elective: { bg: '#0ea5e9', light: '#f0f9ff', border: '#bae6fd', text: '#0c4a6e' },
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getSlotEntries(entries, day, slotTime) {
  const slotMin = timeToMinutes(slotTime)
  return entries.filter(e => {
    if (e.day !== day) return false
    const start = timeToMinutes(e.start_time)
    const end = timeToMinutes(e.end_time)
    return start <= slotMin && slotMin < end
  })
}

function isSlotStart(entry, slotTime) {
  return entry.start_time === slotTime
}

export default function TimetableGrid({ entries, onEntryClick }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: 'var(--shadow-md)' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        background: 'white', minWidth: 700
      }}>
        <thead>
          <tr>
            <th style={{
              padding: '14px 16px', background: 'var(--blue-900)',
              color: 'white', fontSize: 13, fontWeight: 600,
              textAlign: 'left', width: 80, borderRadius: '14px 0 0 0'
            }}>Time</th>
            {DAYS.map((day, i) => (
              <th key={day} style={{
                padding: '14px 16px', background: 'var(--blue-900)',
                color: 'white', fontSize: 13, fontWeight: 600,
                textAlign: 'center', minWidth: 130,
                borderRadius: i === DAYS.length - 1 ? '0 14px 0 0' : 0
              }}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot, si) => (
            <tr key={slot} style={{ borderBottom: '1px solid var(--blue-50)' }}>
              <td style={{
                padding: '10px 16px', fontSize: 12, fontWeight: 600,
                color: 'var(--blue-700)', background: 'var(--blue-50)',
                whiteSpace: 'nowrap', verticalAlign: 'top'
              }}>
                {slot}
              </td>
              {DAYS.map(day => {
                const slotEntries = getSlotEntries(entries, day, slot)
                const startEntries = slotEntries.filter(e => isSlotStart(e, slot))

                return (
                  <td key={day} style={{
                    padding: '4px', verticalAlign: 'top',
                    background: si % 2 === 0 ? 'white' : 'var(--gray-50)',
                    minHeight: 56
                  }}>
                    {startEntries.map(entry => {
                      const startMin = timeToMinutes(entry.start_time)
                      const endMin = timeToMinutes(entry.end_time)
                      const durationSlots = Math.ceil((endMin - startMin) / 60)
                      const colors = TYPE_COLORS[entry.type] || TYPE_COLORS.core

                      return (
                        <div
                          key={entry.id}
                          onClick={() => onEntryClick && onEntryClick(entry)}
                          style={{
                            background: colors.light,
                            border: `1px solid ${colors.border}`,
                            borderLeft: `3px solid ${colors.bg}`,
                            borderRadius: 8, padding: '6px 8px',
                            cursor: onEntryClick ? 'pointer' : 'default',
                            transition: 'all 0.15s',
                            minHeight: durationSlots * 52,
                          }}
                          onMouseEnter={e => {
                            if (onEntryClick) {
                              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                              e.currentTarget.style.transform = 'translateY(-1px)'
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.transform = 'none'
                          }}
                        >
                          <div style={{
                            fontSize: 12, fontWeight: 700, color: colors.text,
                            lineHeight: 1.3, marginBottom: 2
                          }}>
                            {entry.subject_name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                            {entry.start_time}–{entry.end_time}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                            {entry.room_name}
                          </div>
                          {entry.faculty_name && (
                            <div style={{ fontSize: 11, color: 'var(--blue-600)', marginTop: 2 }}>
                              {entry.faculty_website ? (
                                <a
                                  href={entry.faculty_website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ color: 'var(--blue-600)', textDecoration: 'none' }}
                                  title="Visit faculty website"
                                >
                                  {entry.faculty_name.split(' ').slice(0, 2).join(' ')} ↗
                                </a>
                              ) : (
                                entry.faculty_name.split(' ').slice(0, 2).join(' ')
                              )}
                            </div>
                          )}
                          <span style={{
                            display: 'inline-block', marginTop: 4,
                            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                            padding: '1px 6px', borderRadius: 4,
                            background: colors.bg, color: 'white'
                          }}>
                            {entry.type}
                          </span>
                        </div>
                      )
                    })}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
