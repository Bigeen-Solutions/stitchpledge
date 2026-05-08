import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/system-admin', label: 'Overview', exact: true },
  { to: '/system-admin/companies', label: 'Companies' },
  { to: '/system-admin/users', label: 'Users' },
]

export function SystemAdminLayout() {
  const { pathname } = useLocation()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top bar */}
      <header style={{
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', opacity: 0.9 }}>
          StitchFlow Admin
        </span>
        <nav style={{ display: 'flex', gap: '4px' }}>
          {NAV_LINKS.map(({ to, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                style={{
                  color: active ? 'white' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Page content */}
      <main style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
