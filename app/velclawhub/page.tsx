const BASE = 'https://velclaw.com'

const groups = [
  {
    title: 'CORE WORKSPACE',
    items: [
      ['Velclaw Workspace', '/'],
      ['Velclaw Task', '/new'],
      ['Velclaw Tasks', '/tasks'],
      ['Velclaw Dashboard', '/velclaw'],
      ['Velclaw Repo', '/repos/new'],
      ['Velclaw Deploy', '/deploy'],
    ],
  },
  {
    title: 'AI + CAPABILITIES',
    items: [
      ['Velclaw MCP', '/mcp'],
      ['Velclaw Plugins', '/plugins'],
      ['Velclaw Skills', '/skills'],
      ['Velclaw API Keys', '/api-keys'],
      ['Velclaw Wiki', '/wiki'],
    ],
  },
  {
    title: 'AUTH + QA',
    items: [
      ['Velclaw Sign In', '/auth/signin'],
      ['Velclaw UI Audit', '/velclaw/ui-audit'],
      ['VelclawHub', '/velclawhub'],
    ],
  },
  {
    title: 'ECOSYSTEM PATHS',
    items: [
      ['Velclaw Docs', '/docs'],
      ['VelclawHub Ecosystem', '/hub'],
    ],
  },
] as const

export default function VelclawHubPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="relative overflow-hidden border border-violet-400/40 bg-card p-6 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-violet-400/70 bg-[#08070d] shadow-[0_0_36px_rgba(139,92,246,0.24)]">
                <img src="/brand/velclaw-mark.svg" alt="Velclaw" className="h-16 w-16" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">VELCLAW / VELCLAWHUB</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">VelclawHub</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Cổng điều hướng và kiểm thử hệ sinh thái Velclaw trên domain canonical duy nhất.
                </p>
              </div>
            </div>
            <div className="border border-border bg-background/70 px-4 py-3 font-mono text-xs">
              <div className="text-muted-foreground">CANONICAL DOMAIN</div>
              <div className="mt-1 text-violet-200">{BASE}</div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <section key={group.title} className="border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-mono text-xs font-semibold tracking-[0.2em] text-violet-300">{group.title}</h2>
                <span className="text-[10px] text-muted-foreground">{group.items.length} routes</span>
              </div>
              <div className="grid gap-2">
                {group.items.map(([name, path]) => (
                  <a
                    key={path}
                    href={`${BASE}${path}`}
                    className="group flex items-center justify-between border border-border/70 bg-background/50 px-4 py-3 transition-colors hover:border-violet-400/70 hover:bg-violet-500/5"
                  >
                    <span className="text-sm font-medium">{name}</span>
                    <span className="font-mono text-xs text-muted-foreground group-hover:text-violet-300">{path}</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </section>

        <section className="border border-border bg-card p-5">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Architecture
              </div>
              <div className="mt-2 text-sm">Task → Skill → Executor → Review → Gate → GitHub → Deploy</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Identity</div>
              <div className="mt-2 text-sm">Velclaw</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Canonical host
              </div>
              <div className="mt-2 text-sm">velclaw.com</div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          VelclawHub ecosystem gateway · canonical host: velclaw.com
        </footer>
      </div>
    </main>
  )
}
