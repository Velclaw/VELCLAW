import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { nav } from '../data/nav'

export default function MobileMenu({ open, onClose }) {
  const [openSection, setOpenSection] = useState(nav[0]?.section ?? null)
  const location = useLocation()

  if (!open) return null

  return (
    <div className="menu-overlay" role="dialog" aria-modal="true">
      <div className="menu-header">
        <Link to="/" className="menu-brand" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="50,10 95,90 5,90" fill="currentColor" />
          </svg>
          <span>/</span>
          <span className="menu-brand-dim">Docs</span>
        </Link>
        <button className="menu-close" onClick={onClose} aria-label="Đóng menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="menu-account">
        <div className="menu-account-info">
          <div className="menu-account-name">velclaw</div>
          <div className="menu-account-email">tài khoản của bạn</div>
        </div>
        <div className="menu-avatar" aria-hidden="true" />
      </div>

      <nav className="menu-links">
        <Link to="/" onClick={onClose}>Trang chủ</Link>
        <a href="#" onClick={onClose}>Cài đặt tài khoản</a>
      </nav>

      <div className="menu-divider" />

      <nav className="menu-groups">
        {nav.map((group) => {
          const isOpen = openSection === group.section
          return (
            <div key={group.section} className="menu-group">
              <button
                className="menu-group-toggle"
                onClick={() => setOpenSection(isOpen ? null : group.section)}
                aria-expanded={isOpen}
              >
                <span>{group.section}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <div className="menu-group-items">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={location.pathname === item.path ? 'active' : ''}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button className="menu-ask-ai" onClick={onClose}>Hỏi AI</button>

      <style>{`
        .menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          padding: 0 16px 24px;
          overflow-y: auto;
        }
        .menu-header {
          height: var(--header-h);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
        }
        .menu-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          font-size: 15px;
        }
        .menu-brand-dim {
          color: var(--text-tertiary);
        }
        .menu-close {
          background: none;
          border: none;
          color: var(--text-primary);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .menu-account {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 4px 16px;
        }
        .menu-account-name {
          font-size: 20px;
          font-weight: 600;
        }
        .menu-account-email {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-top: 2px;
        }
        .menu-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4c1d95, #1e3a8a);
          flex-shrink: 0;
        }
        .menu-links {
          display: flex;
          flex-direction: column;
        }
        .menu-links a {
          padding: 12px 4px;
          font-size: 15px;
          color: var(--text-secondary);
          text-decoration: none;
        }
        .menu-links a:hover {
          color: var(--text-primary);
        }
        .menu-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 12px 0;
        }
        .menu-groups {
          display: flex;
          flex-direction: column;
        }
        .menu-group-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 15px;
          padding: 12px 4px;
          cursor: pointer;
        }
        .menu-group-toggle:hover {
          color: var(--text-primary);
        }
        .menu-group-items {
          display: flex;
          flex-direction: column;
          padding-left: 12px;
        }
        .menu-group-items a {
          padding: 10px 4px;
          font-size: 14.5px;
          color: var(--text-tertiary);
          text-decoration: none;
        }
        .menu-group-items a:hover,
        .menu-group-items a.active {
          color: var(--text-primary);
        }
        .menu-ask-ai {
          margin-top: 20px;
          width: 100%;
          padding: 12px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-primary);
          font-size: 15px;
          cursor: pointer;
        }
        .menu-ask-ai:hover {
          background: var(--bg-card);
        }
      `}</style>
    </div>
  )
}
