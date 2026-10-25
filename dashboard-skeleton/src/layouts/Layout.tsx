import { NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/docs', label: 'Docs' },
  { to: '/auth', label: 'Auth' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chatbot', label: 'Chatbot' },
  { to: '/work/agent/chat/codehub', label: 'CodeHub' },
  { to: '/VelclawHub', label: 'VelclawHub' },
  { to: '/mcp.velclaw.com', label: 'MCP' },
  { to: '/api.velclaw.com', label: 'API' },
]

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">VELCLAW</div>
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </aside>
      <main className="main">
        <header className="header">
          <span>Velclaw Control Center</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>Agent</span>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
      <aside className="chat-panel">
        <div className="chat-header">Agent Chat</div>
        <div className="chat-messages">
          <div className="card" style={{ margin: 0, fontSize: 12 }}>
            Velclaw Agent sẵn sàng. Hỏi về repo, MCP, hoặc deploy.
          </div>
        </div>
        <div className="chat-input">
          <input placeholder="Message Velclaw Agent..." />
        </div>
      </aside>
    </div>
  )
}
