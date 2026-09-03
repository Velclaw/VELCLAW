'use client'

import Link from 'next/link'
import { Cable, CheckCircle2, ExternalLink, KeyRound, Network, Package, PlugZap, ShieldCheck } from 'lucide-react'
import { VELCLAW_INTEGRATIONS } from '@/lib/velclaw/integrations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const kindLabels: Record<string, string> = {
  agent: 'Agent',
  reviewer: 'Reviewer',
  workspace: 'Workspace',
  skills: 'Skills',
  docs: 'Docs',
  network: 'Network',
  cloud: 'Cloud',
  'source-control': 'Source control',
  identity: 'Identity',
}

export function VelclawPluginsPage() {
  const available = VELCLAW_INTEGRATIONS.filter((integration) => integration.status === 'available')
  const planned = VELCLAW_INTEGRATIONS.filter((integration) => integration.status === 'planned')

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border border-border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-violet-400/60 bg-violet-500/10">
                <PlugZap className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW / PLUGINS</p>
                <h1 className="text-2xl font-semibold">Velclaw Plugins</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Integration registry cho các capability mà Velclaw có thể đưa vào Task → Executor → Review → Gate →
                  GitHub API → PR.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/mcp">
                  <Cable className="h-4 w-4" /> MCP
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/api-keys">
                  <KeyRound className="h-4 w-4" /> API Keys
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Available</CardTitle>
              <CardDescription>Đã có adapter/registry entry.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-2xl font-semibold">{available.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Planned</CardTitle>
              <CardDescription>Được định nghĩa nhưng chưa bật runtime.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-2xl font-semibold">{planned.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Security</CardTitle>
              <CardDescription>Credentials không nằm trong plugin metadata.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 px-4 pb-4 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-violet-300" /> Secrets qua API Keys / environment.
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Integration registry</h2>
              <p className="text-xs text-muted-foreground">
                Nguồn dữ liệu duy nhất: <code>lib/velclaw/integrations.ts</code>.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {VELCLAW_INTEGRATIONS.map((integration) => (
              <Card key={integration.id} className="border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background">
                        <Package className="h-4 w-4 text-violet-300" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{integration.name}</CardTitle>
                        <CardDescription className="mt-1 font-mono text-[10px]">{integration.id}</CardDescription>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${integration.status === 'available' ? 'border-emerald-400/40 text-emerald-300' : 'border-border text-muted-foreground'}`}
                    >
                      {integration.status === 'available' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Network className="h-3 w-3" />
                      )}
                      {integration.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3 text-muted-foreground">
                    <span>{kindLabels[integration.kind] ?? integration.kind}</span>
                    <span className="font-mono text-[10px]">{integration.source}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(integration.capabilities ?? []).map((capability) => (
                      <span
                        key={capability}
                        className="border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                  {integration.status === 'available' && integration.source.startsWith('http') ? (
                    <a
                      className="inline-flex items-center gap-1 text-violet-300 hover:underline"
                      href={integration.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Boundary</p>
          <p className="mt-2">
            Trang này hiện là control-plane/registry UI, không giả lập Enable/Disable hay credential storage khi runtime
            chưa cung cấp các thao tác đó. MCP manager và API Keys vẫn là nơi thực hiện cấu hình thực tế.
          </p>
        </section>
      </div>
    </main>
  )
}
