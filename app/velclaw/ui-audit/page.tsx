import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'

const routes = [
  { path: '/', name: 'Velclaw Workspace', scope: 'Core workspace' },
  { path: '/new', name: 'Velclaw Task', scope: 'Task creation' },
  { path: '/tasks', name: 'Velclaw Tasks', scope: 'Task list' },
  { path: '/velclaw', name: 'Velclaw Dashboard', scope: 'Pipeline dashboard' },
  { path: '/repos/new', name: 'Velclaw Repo', scope: 'Repository creation' },
  { path: '/mcp', name: 'Velclaw MCP', scope: 'Tool/resource connectors' },
  { path: '/api-keys', name: 'Velclaw API Keys', scope: 'Provider credentials' },
  { path: '/wiki', name: 'Velclaw Wiki', scope: 'System knowledge' },
  { path: '/auth/signin', name: 'Velclaw Sign In', scope: 'Authentication' },
  { path: '/velclawhub', name: 'VelclawHub', scope: 'Ecosystem gateway' },
  { path: '/velclaw/ui-audit', name: 'Velclaw UI Audit', scope: 'This QA page' },
  { path: '/docs', name: 'Velclaw Docs', scope: 'Documentation' },
  { path: '/hub', name: 'VelclawHub Ecosystem', scope: 'Existing ecosystem hub route' },
] as const

export default async function VelclawUiAuditPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/')

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW UI AUDIT</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Đồng bộ giao diện toàn hệ thống</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Global design tokens enforce the Velclaw dark/purple/square baseline. Use this page to click through every
            primary workspace route after UI changes.
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {routes.map((route) => (
            <Link key={route.path} href={route.path} className="group border border-border bg-card/80 p-4 transition-colors hover:border-violet-400/70 hover:bg-violet-500/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{route.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{route.scope}</div>
                </div>
                <span className="font-mono text-xs text-violet-300 group-hover:text-violet-200">{route.path}</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Chuẩn kiểm tra</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <li>✓ nền dark/black mặc định</li>
            <li>✓ violet là accent chính</li>
            <li>✓ control/card/panel góc vuông</li>
            <li>✓ monospace-first typography</li>
            <li>✓ Velclaw mark trong header</li>
            <li>✓ Agent Chat có identity Velclaw</li>
            <li>✓ MCP + API Keys có route riêng</li>
            <li>✓ Wiki có kiến thức hệ thống</li>
            <li>✓ VelclawHub là tên canonical của ecosystem gateway</li>
            <li>✓ VelclawHub Ecosystem được phân biệt riêng với VelclawHub</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
