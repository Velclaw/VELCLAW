import { useState } from 'react'

export default function DocsLayout({ title, description, children }) {
  const [copied, setCopied] = useState(false)

  const copyPage = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <main className="docs-main">
      <div className="docs-toolbar">
        <button className="pill" onClick={copyPage}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5 15V6a2 2 0 012-2h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {copied ? 'Đã sao chép' : 'Sao chép trang'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="pill pill-ghost">Trên trang này</button>
      </div>

      <h1 className="docs-title">{title}</h1>
      {description && <p className="docs-description">{description}</p>}

      <div className="docs-body">{children}</div>

      <style>{`
        .docs-main {
          max-width: var(--content-max);
          margin: 0 auto;
          padding: 24px 20px 80px;
        }
        .docs-toolbar {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-primary);
          font-size: 13.5px;
          cursor: pointer;
          white-space: nowrap;
        }
        .pill:hover {
          background: var(--bg-card);
        }
        .pill-ghost {
          color: var(--text-secondary);
        }
        .docs-title {
          font-size: 34px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin: 0 0 14px;
        }
        .docs-description {
          font-size: 16px;
          line-height: 1.65;
          color: var(--text-secondary);
          margin: 0 0 8px;
          max-width: 60ch;
        }
        .docs-body {
          margin-top: 24px;
        }
        .docs-body h2 {
          font-size: 22px;
          font-weight: 700;
          margin: 40px 0 14px;
          letter-spacing: -0.01em;
        }
        .docs-body h3 {
          font-size: 17px;
          font-weight: 600;
          margin: 28px 0 10px;
        }
        .docs-body p {
          color: var(--text-secondary);
          font-size: 15.5px;
          line-height: 1.7;
          margin: 0 0 14px;
        }
        .docs-body ul {
          margin: 0 0 16px;
          padding-left: 20px;
          color: var(--text-secondary);
        }
        .docs-body li {
          margin-bottom: 8px;
          font-size: 15.5px;
        }
        .docs-body a {
          color: var(--text-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--border);
        }
        .docs-body hr {
          border: none;
          border-top: 1px solid var(--border-subtle);
          margin: 28px 0;
        }
      `}</style>
    </main>
  )
}
