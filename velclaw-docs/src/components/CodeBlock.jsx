import { useState } from 'react'

export default function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false)
  const text = typeof children === 'string' ? children : String(children)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="code-block">
      <code>{children}</code>
      <button className="code-copy" onClick={copy} aria-label="Sao chép lệnh">
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5 15V6a2 2 0 012-2h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <style>{`
        .code-block {
          position: relative;
          background: var(--bg-raised);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius);
          padding: 14px 44px 14px 16px;
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--accent-code);
          margin: 16px 0;
          overflow-x: auto;
        }
        .code-copy {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 6px;
        }
        .code-copy:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }
      `}</style>
    </div>
  )
}
