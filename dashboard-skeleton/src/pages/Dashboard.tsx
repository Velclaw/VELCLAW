export default function Dashboard() {
  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">Deployments</div>
        <div className="card">Agents</div>
        <div className="card">MCP Status</div>
        <div className="card">Usage</div>
      </div>
    </>
  )
}
