import Link from 'next/link'

const sections = [
  ['Workspace', 'Production workspace, members, and default behavior.'],
  ['Security', 'Authentication, access policies, secrets, and audit controls.'],
  ['Integrations', 'Connect GitHub, Vercel, MCP servers, and external services.'],
  ['Runtime', 'Worker limits, environments, and execution preferences.'],
] as const

export default function SettingsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#08090b', color: '#f4f6f8', fontFamily: 'Inter, Geist, system-ui, sans-serif', padding: '48px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link href="/console" style={{ color: '#8f96a3', textDecoration: 'none', fontSize: 13 }}>← Back to Console</Link>
        <p style={{ marginTop: 42, color: '#6d7480', font: '10px JetBrains Mono, monospace', letterSpacing: '.13em' }}>WORKSPACE / SETTINGS</p>
        <h1 style={{ fontSize: 40, letterSpacing: '-.045em', margin: '10px 0 8px' }}>Workspace settings</h1>
        <p style={{ color: '#8f96a3', fontSize: 14, marginBottom: 30 }}>Configure the Velclaw workspace that powers your build and runtime lifecycle.</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {sections.map(([title, description]) => (
            <section key={title} style={{ background: '#0f1115', border: '1px solid #262a33', borderRadius: 13, padding: 20, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 15, margin: 0 }}>{title}</h2>
                <p style={{ color: '#7e8694', fontSize: 12, lineHeight: 1.55, margin: '7px 0 0' }}>{description}</p>
              </div>
              <span style={{ color: '#626a77', fontSize: 12 }}>Configure →</span>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
