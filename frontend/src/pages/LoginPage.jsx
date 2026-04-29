import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiGrid, FiArrowRight } from 'react-icons/fi'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(`/${user.role}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 100%)'
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px',
        color: 'white', display: 'none'
      }} className="left-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{
            width: 44, height: 44, background: 'rgba(255,255,255,0.2)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiGrid size={22} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20 }}>TimeTable</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
          Your academic<br />schedule, simplified.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 380 }}>
          Access your personalized timetable, track your classes, and stay updated with real-time notifications.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'white', borderRadius: 24, padding: '40px 36px',
          width: '100%', boxShadow: 'var(--shadow-xl)'
        }} className="fade-in">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, background: 'var(--blue-600)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiGrid size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--blue-900)' }}>TimeTable</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Academic Scheduler</div>
            </div>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue-900)', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 28 }}>
            Sign in to access your timetable
          </p>



          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--blue-400)'
                }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@uohyd.ac.in"
                  required
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    border: '1.5px solid var(--blue-200)', borderRadius: 10,
                    fontSize: 14, outline: 'none', transition: 'border 0.15s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                  onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--blue-400)'
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '11px 40px 11px 40px',
                    border: '1.5px solid var(--blue-200)', borderRadius: 10,
                    fontSize: 14, outline: 'none', transition: 'border 0.15s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                  onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--gray-400)'
                  }}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'var(--blue-300)' : 'var(--blue-600)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s'
              }}
            >
              {loading ? 'Signing in...' : (
                <><span>Sign In</span><FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--gray-500)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>
              Register here
            </Link>
          </p>

          {/* Domain hints */}
          <div style={{
            marginTop: 20, padding: 14, background: 'var(--gray-50)',
            borderRadius: 10, fontSize: 12, color: 'var(--gray-500)'
          }}>
            <div style={{ marginBottom: 4 }}>
              <strong style={{ color: 'var(--blue-700)' }}>University Email Required:</strong> @uohyd.ac.in
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>
              Admin: admin@uohyd.ac.in (Password: Admin@SCIS2026)
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
