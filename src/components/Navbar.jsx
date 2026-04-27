import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const FoodIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/food-log', icon: <FoodIcon />, label: 'Food Log' },
    { to: '/alerts', icon: <AlertIcon />, label: 'Alerts' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
            <path d="M2 17l10 5 10-5" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
            <path d="M2 12l10 5 10-5" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>NutriTrack</span>
      </div>

      <div className="navbar-section-label">MENU</div>
      <div className="navbar-links">
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="navbar-user">
        <div className="user-avatar">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.username || 'User'}</span>
          <span className="user-role">Free Plan</span>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Logout">
          <LogoutIcon />
        </button>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--navbar-width);
          background: rgba(6, 6, 15, 0.92);
          border-right: 1px solid var(--border);
          padding: 1.75rem 1rem;
          display: flex;
          flex-direction: column;
          z-index: 50;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.75rem;
          margin-bottom: 2rem;
        }

        .navbar-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .navbar-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          padding: 0 1rem;
          margin-bottom: 0.75rem;
        }

        .navbar-links {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: rgba(139, 92, 246, 0.12);
          color: var(--accent-violet);
          box-shadow: inset 3px 0 0 var(--accent-violet);
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0.75rem;
          border-top: 1px solid var(--border);
          margin-top: 0.5rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 10px;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .btn-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background: var(--accent-red-glow);
          border-color: rgba(239,68,68,0.3);
          color: var(--accent-red);
        }

        @media (max-width: 768px) {
          .navbar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            width: 100%;
            height: auto;
            flex-direction: row;
            padding: 0.6rem 1rem;
            border-right: none;
            border-top: 1px solid var(--border);
          }
          .navbar-brand,
          .navbar-user,
          .navbar-section-label { display: none; }
          .navbar-links {
            flex-direction: row;
            justify-content: space-around;
            width: 100%;
          }
          .nav-link span:last-child { display: none; }
          .nav-link { justify-content: center; padding: 0.6rem; }
          .nav-link.active { box-shadow: inset 0 -3px 0 var(--accent-violet); }
        }
      `}</style>
    </nav>
  )
}
