import { Link, useLocation } from 'react-router-dom'
import { flatNav } from '../data/nav'

function Logo() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,10 95,90 5,90" fill="currentColor" />
    </svg>
  )
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const current = flatNav.find((item) => item.path === location.pathname)

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-logo" aria-label="Trang chủ velclaw">
          <Logo />
        </Link>
        <span className="header-sep">/</span>
        <span className="header-crumb">Docs</span>
        {current && current.path !== '/' && (
          <>
            <span className="header-sep header-sep-light">/</span>
            <span className="header-crumb header-crumb-current">{current.label}</span>
          </>
        )}
      </div>
      <button
        className="header-menu-btn"
        onClick={onMenuClick}
        aria-label="Mở menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <style>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 30;
          height: var(--header-h);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-subtle);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          color: var(--text-primary);
        }
        .header-logo {
          display: flex;
          align-items: center;
          color: var(--text-primary);
        }
        .header-sep {
          color: var(--text-tertiary);
          font-size: 15px;
        }
        .header-sep-light {
          color: var(--text-tertiary);
        }
        .header-crumb {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .header-crumb-current {
          color: var(--text-primary);
        }
        .header-menu-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          cursor: pointer;
        }
        .header-menu-btn:hover {
          background: var(--bg-card);
        }
      `}</style>
    </header>
  )
}
