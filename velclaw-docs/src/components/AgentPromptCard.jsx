import { useState } from 'react'

export default function AgentPromptCard({ title = 'Lời nhắc của tác nhân', children }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="prompt-card">
      <div className="prompt-card-head">
        <div className="prompt-card-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M6 4h9l3 3v13H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 10h6M9 14h6M9 18h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>{title}</span>
        </div>
        <button className="prompt-card-copy" aria-label="Sao chép">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5 15V6a2 2 0 012-2h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className={`prompt-card-body ${expanded ? 'expanded' : ''}`}>{children}</div>
      <button className="prompt-card-toggle" onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Ẩn bớt' : 'Hiển thị thêm'}
      </button>

      <style>{`
        .prompt-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 14px 16px 12px;
          margin: 20px 0;
        }
        .prompt-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-secondary);
          font-size: 13.5px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .prompt-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .prompt-card-copy {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          display: flex;
        }
        .prompt-card-copy:hover {
          color: var(--text-primary);
        }
        .prompt-card-body {
          padding-top: 12px;
          color: var(--text-secondary);
          font-size: 14.5px;
          line-height: 1.6;
          max-height: 3.2em;
          overflow: hidden;
        }
        .prompt-card-body.expanded {
          max-height: none;
        }
        .prompt-card-toggle {
          margin-top: 10px;
          width: 100%;
          padding: 8px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-primary);
          font-size: 13.5px;
          cursor: pointer;
        }
        .prompt-card-toggle:hover {
          background: var(--bg-raised);
        }
      `}</style>
    </div>
  )
}
