import React from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiFilter, FiBell, FiUsers, FiArrowRight, FiGrid, FiCheckCircle } from 'react-icons/fi'

const features = [
  {
    icon: FiCalendar,
    title: 'Personalized Timetable',
    desc: 'Students see only their enrolled subjects. No clutter, just your schedule.'
  },
  {
    icon: FiFilter,
    title: 'Smart Filtering',
    desc: 'Filter by subject, faculty, room, time slot, stream, or section instantly.'
  },
  {
    icon: FiBell,
    title: 'Real-time Notifications',
    desc: 'Get notified when your timetable is updated or a class is rescheduled.'
  },
  {
    icon: FiUsers,
    title: 'Faculty Management',
    desc: 'Faculty can create, update, and manage timetables with conflict detection.'
  },
  {
    icon: FiGrid,
    title: 'Multiple Views',
    desc: 'Switch between weekly grid, daily view, and agenda list — your choice.'
  },
  {
    icon: FiCheckCircle,
    title: 'Conflict Detection',
    desc: 'Automatic room and faculty conflict checks when scheduling new classes.'
  },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px', borderBottom: '1px solid var(--blue-100)',
        position: 'sticky', top: 0, background: 'white', zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, background: 'var(--blue-600)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiGrid size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--blue-900)' }}>
            TimeTable
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{
            padding: '9px 20px', borderRadius: 10,
            border: '1.5px solid var(--blue-600)', color: 'var(--blue-600)',
            fontWeight: 600, fontSize: 14, transition: 'all 0.15s'
          }}>
            Login
          </Link>
          <Link to="/register" style={{
            padding: '9px 20px', borderRadius: 10,
            background: 'var(--blue-600)', color: 'white',
            fontWeight: 600, fontSize: 14, transition: 'all 0.15s'
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 50%, var(--blue-500) 100%)',
        padding: '96px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
        }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', borderRadius: 20,
            padding: '6px 16px', marginBottom: 24, color: 'var(--blue-100)',
            fontSize: 13, fontWeight: 500
          }}>
            <FiCalendar size={14} />
            SCIS · University of Hyderabad · Jan 2026
          </div>
          <h1 style={{
            fontSize: 52, fontWeight: 800, color: 'white',
            lineHeight: 1.15, marginBottom: 20
          }}>
            SCIS Interactive<br />
            <span style={{ color: 'var(--blue-200)' }}>Timetable System</span>
          </h1>
          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px'
          }}>
            School of Computer and Information Sciences — Semester January 2026.
            Personalized views for M.Tech, IMT, and MCA programmes.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', background: 'white', color: 'var(--blue-700)',
              borderRadius: 12, fontWeight: 700, fontSize: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.2s'
            }}>
              Get Started Free <FiArrowRight size={18} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', background: 'rgba(255,255,255,0.15)',
              color: 'white', borderRadius: 12, fontWeight: 600, fontSize: 16,
              border: '1.5px solid rgba(255,255,255,0.3)', transition: 'all 0.2s'
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: 'var(--blue-50)', padding: '40px 48px',
        borderBottom: '1px solid var(--blue-100)'
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 24, textAlign: 'center'
        }}>
          {[
            { value: 'M.Tech / IMT / MCA', label: 'Programmes' },
            { value: '24 Faculty', label: 'Teaching Staff' },
            { value: '175+ Slots', label: 'Timetable Entries' },
            { value: 'Real-time', label: 'Notifications' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue-700)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--blue-900)', marginBottom: 12 }}>
            Everything you need
          </h2>
          <p style={{ fontSize: 16, color: 'var(--gray-500)', maxWidth: 480, margin: '0 auto' }}>
            Built specifically for academic institutions with features that matter.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              background: 'white', borderRadius: 16, padding: '28px 24px',
              border: '1px solid var(--blue-100)', boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'var(--blue-300)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.borderColor = 'var(--blue-100)'
              }}
            >
              <div style={{
                width: 48, height: 48, background: 'var(--blue-50)',
                borderRadius: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 16
              }}>
                <Icon size={22} color="var(--blue-600)" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section style={{
        background: 'var(--blue-50)', padding: '80px 48px',
        borderTop: '1px solid var(--blue-100)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--blue-900)', marginBottom: 12 }}>
            Two portals, one platform
          </h2>
        </div>
        <div style={{
          maxWidth: 800, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 32,
            border: '2px solid var(--blue-200)', textAlign: 'center'
          }}>
            <div style={{
              width: 64, height: 64, background: 'var(--blue-600)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: 28
            }}>👨‍🎓</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8 }}>
              Student Portal
            </h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20, lineHeight: 1.6 }}>
              View your personalized timetable, manage enrolled subjects, and get notified of changes.
            </p>
            <div style={{ fontSize: 12, color: 'var(--blue-600)', fontWeight: 600 }}>
              Login with @student.edu email
            </div>
          </div>
          <div style={{
            background: 'var(--blue-900)', borderRadius: 20, padding: 32,
            textAlign: 'center'
          }}>
            <div style={{
              width: 64, height: 64, background: 'var(--blue-500)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: 28
            }}>🧑‍🏫</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>
              Faculty Portal
            </h3>
            <p style={{ fontSize: 14, color: 'var(--blue-200)', marginBottom: 20, lineHeight: 1.6 }}>
              Create and manage timetables, avoid scheduling conflicts, and update schedules anytime.
            </p>
            <div style={{ fontSize: 13, color: 'var(--blue-300)', fontWeight: 600 }}>
              Login with @faculty.edu email
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--blue-700)', padding: '64px 48px', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 16 }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'var(--blue-200)', fontSize: 16, marginBottom: 32 }}>
          Join your institution's smart timetable system today.
        </p>
        <Link to="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 36px', background: 'white', color: 'var(--blue-700)',
          borderRadius: 12, fontWeight: 700, fontSize: 16
        }}>
          Create Account <FiArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--blue-900)', padding: '24px 48px',
        textAlign: 'center', color: 'var(--blue-300)', fontSize: 13
      }}>
        © 2026 SCIS Timetable · School of Computer and Information Sciences · University of Hyderabad
      </footer>
    </div>
  )
}
