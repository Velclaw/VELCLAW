const BASE = 'https://velclaw.cfd'

const groups = [
  { title: 'CORE WORKSPACE', items: [['Workspace / Task', '/'], ['New Task', '/new'], ['Tasks', '/tasks'], ['Velclaw Dashboard', '/velclaw'], ['Repo Workspace', '/repos/new']] },
  { title: 'AI + KNOWLEDGE', items: [['MCP Servers', '/mcp'], ['API Keys', '/api-keys'], ['Wiki', '/wiki']] },
  { title: 'AUTH + QA', items: [['Sign In', '/auth/signin'], ['UI Audit', '/velclaw/ui-audit'], ['Test Hub', '/test']] },
  { title: 'ECOSYSTEM PATHS', items: [['Docs', '/docs'], ['VelclawHub', '/hub']] },
] as const

export default function VelclawTestHub() {
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
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">VELCLAW / TEST HUB</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">VELCLAW</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Cổng kiểm thử và điều hướng toàn hệ sinh thái trên domain canonical duy nhất.</p>
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
                  <a key={path} href={`${BASE}${path}`} className="group flex items-center justify-between border border-border/70 bg-background/50 px-4 py-3 transition-colors hover:border-violet-400/70 hover:bg-violet-500/5">
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
            <div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Architecture</div><div className="mt-2 text-sm">Task → Executor → Review → Gate → GitHub</div></div>
            <div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Identity</div><div className="mt-2 text-sm">Velclaw</div></div>
            <div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Canonical host</div><div className="mt-2 text-sm">velclaw.cfd</div></div>
          </div>
        </section>

        <footer className="border-t border-border pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Velclaw ecosystem test gateway · canonical host: velclaw.cfd</footer>
      </div>
    </main>
  )
}
