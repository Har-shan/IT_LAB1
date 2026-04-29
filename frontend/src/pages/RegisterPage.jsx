import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiGrid, FiArrowRight, FiInfo } from 'react-icons/fi'

const STREAMS = ['M.Tech(CS)', 'M.Tech(AI)', 'IMT', 'MCA']
const IMT_SEMESTERS = ['II', 'IV', 'VI', 'VIII']
const MCA_SEMESTERS = ['II']
const MTECH_SEMESTERS = [1, 2]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', stream: 'M.Tech(CS)', semester: 1, department: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const emailDomain = 'uohyd.ac.in'

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return false }
    if (!form.email.trim()) { toast.error('Email is required'); return false }
    if (!form.email.endsWith(`@${emailDomain}`)) {
      toast.error(`Only @${emailDomain} emails are allowed for registration`)
      return false
    }
    if (form.password.length < 8) { 
      toast.error('Password must be at least 8 characters'); 
      return false 
    }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep1()) return
    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        stream: form.stream,
        semester: form.role === 'student' ? form.semester : null,
        department: form.role === 'faculty' ? form.department : null,
      })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px 11px 40px',
    border: '1.5px solid var(--blue-200)', borderRadius: 10,
    fontSize: 14, outline: 'none', transition: 'border 0.15s',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: 'var(--gray-700)',
    display: 'block', marginBottom: 6
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 100%)',
      padding: '24px'
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 520, boxShadow: 'var(--shadow-xl)'
      }} className="fade-in">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, background: 'var(--blue-600)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiGrid size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--blue-900)' }}>TimeTable</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Create Account</div>
          </div>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue-900)', marginBottom: 6 }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
          Join the interactive timetable platform
        </p>

        {/* Role Toggle */}
        <div style={{
          display: 'flex', background: 'var(--blue-50)', borderRadius: 12,
          padding: 4, marginBottom: 24, border: '1px solid var(--blue-100)'
        }}>
          {['student', 'faculty'].map(role => (
            <button
              key={role}
              type="button"
              onClick={() => {
                handleChange('role', role)
                handleChange('email', '')
              }}
              style={{
                flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: form.role === role ? 'var(--blue-600)' : 'transparent',
                color: form.role === role ? 'white' : 'var(--blue-700)',
                textTransform: 'capitalize'
              }}
            >
              {role === 'student' ? '👨‍🎓' : '🧑‍🏫'} {role}
            </button>
          ))}
        </div>

        {/* Email domain hint */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--blue-50)', borderRadius: 8, padding: '8px 12px',
          marginBottom: 20, fontSize: 12, color: 'var(--blue-700)'
        }}>
          <FiInfo size={14} />
          <span>
            All users must register with <strong>@{emailDomain}</strong> email
            <br />
            <small style={{ fontSize: 11, color: 'var(--blue-600)' }}>
              Your roll number will be extracted from your email (e.g., rollno@{emailDomain})
            </small>
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={16} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--blue-400)'
              }} />
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Your full name"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--blue-400)'
              }} />
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder={`name@${emailDomain}`}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--blue-400)'
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder="Min. 8 characters (uppercase, lowercase, digit, special char)"
                required
                style={{ ...inputStyle, paddingRight: 40 }}
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

          {/* Confirm Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--blue-400)'
              }} />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                placeholder="Repeat password"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
              />
            </div>
          </div>

          {/* Stream */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Stream / Department</label>
            <select
              value={form.stream}
              onChange={e => handleChange('stream', e.target.value)}
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid var(--blue-200)', borderRadius: 10,
                fontSize: 14, outline: 'none', background: 'white',
                boxSizing: 'border-box'
              }}
            >
              {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Student-specific fields */}
          {form.role === 'student' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Semester</label>
              <select
                value={form.semester}
                onChange={e => handleChange('semester', e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid var(--blue-200)', borderRadius: 10,
                  fontSize: 14, outline: 'none', background: 'white',
                  boxSizing: 'border-box'
                }}
              >
                {form.stream === 'IMT' && IMT_SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
                {form.stream === 'MCA' && MCA_SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
                {(form.stream === 'M.Tech(CS)' || form.stream === 'M.Tech(AI)') && MTECH_SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Faculty-specific */}
          {form.role === 'faculty' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Department Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser size={16} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--blue-400)'
                }} />
                <input
                  type="text"
                  value={form.department}
                  onChange={e => handleChange('department', e.target.value)}
                  placeholder="e.g. Computer Science"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                  onBlur={e => e.target.style.borderColor = 'var(--blue-200)'}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', marginTop: 8,
              background: loading ? 'var(--blue-300)' : 'var(--blue-600)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s'
            }}
          >
            {loading ? 'Creating account...' : (
              <><span>Create Account</span><FiArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--gray-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
