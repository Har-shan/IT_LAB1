import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiGrid } from 'react-icons/fi'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 100%)',
      padding: 24, textAlign: 'center'
    }}>
      <div>
        <div style={{
          width: 80, height: 80, background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <FiGrid size={36} color="white" />
        </div>
        <h1 style={{ fontSize: 80, fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 8 }}>
          404
        </h1>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue-200)', marginBottom: 12 }}>
          Page Not Found
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 32 }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', background: 'white', color: 'var(--blue-700)',
          borderRadius: 12, fontWeight: 700, fontSize: 15
        }}>
          <FiArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
