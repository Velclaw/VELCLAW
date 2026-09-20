'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cable, CheckCircle2, Database, ExternalLink, Plus, Server, ShieldCheck, TriangleAlert, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectorDialog } from '@/components/connectors/manage-connectors'

type RuntimeServer = {
  id: string
  type: 'local' | 'remote'
  command?: string
  args?: string[]
  url?: string
  disabled: boolean
  state: 'ready' | 'disabled' | 'missing-env'
  requiredEnv: string[]
  configuredEnv: string[]
}

type RuntimeSummary = {
  total: number
  ready: number
  disabled: number
  missingEnv: number
  servers: RuntimeServer[]
}

const capabilities = [
  ['Tools', 'Cho phép agent gọi tool từ server MCP.'],
  ['Resources', 'Đưa dữ liệu/tài nguyên vào context của task.'],
  ['Prompts', 'Tái sử dụng prompt và workflow theo server.'],
  ['Isolation', 'Server local chạy trong execution boundary phù hợp.'],
] as const

function stateLabel(state: RuntimeServer['state']) {
  if (state === 'ready') return 'Ready'
  if (state === 'disabled') return 'Disabled'
  return 'Missing environment'
}

function stateClass(state: RuntimeServer['state']) {
  if (state === 'ready') return 'text-emerald-400'
  if (state === 'disabled') return 'text-muted-foreground'
  return 'text-amber-400'
}

export function McpPage() {
  const [open, setOpen] = useState(false)
  const [runtime, setRuntime] = useState<RuntimeSummary | null>(null)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    fetch('/api/mcp/runtime', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Runtime registry unavailable')
        return response.json() as Promise<RuntimeSummary>
      })
      .then((data) => {
        if (active) setRuntime(data)
      })
      .catch((error: Error) => {
        if (active) setRuntimeError(error.message)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-violet-400/60 bg-violet-500/10">
              <Cable className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW / MCP</p>
              <h1 className="text-2xl font-semibold">MCP Runtime</h1>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Registry hệ thống từ <code className="rounded bg-muted px-1.5 py-0.5">config/mcp.json</code> được hiển thị
            cùng MCP connectors của workspace. Secret chỉ được resolve ở server runtime và không được trả về UI.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Quản lý MCP
            </Button>
            <Button variant="outline" asChild>
              <Link href="/api-keys">API Keys</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/wiki#mcp">MCP Wiki</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(([title, description], index) => (
            <Card key={title}>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-violet-300">0{index + 1}</span>
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 text-xs leading-5 text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle>{runtime?.total ?? '—'}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Ready</CardDescription><CardTitle className="text-emerald-400">{runtime?.ready ?? '—'}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Missing env</CardDescription><CardTitle className="text-amber-400">{runtime?.missingEnv ?? '—'}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Disabled</CardDescription><CardTitle>{runtime?.disabled ?? '—'}</CardTitle></CardHeader></Card>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">System registry</p>
              <h2 className="text-lg font-semibold">Workspace MCP runtime</h2>
            </div>
            <span className="text-xs text-muted-foreground">config/mcp.json</span>
          </div>

          {runtimeError ? (
            <Card><CardContent className="flex items-center gap-2 p-5 text-sm text-amber-400"><TriangleAlert className="h-4 w-4" />{runtimeError}</CardContent></Card>
          ) : !runtime ? (
            <Card><CardContent className="p-5 text-sm text-muted-foreground">Loading runtime registry…</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {runtime.servers.map((server) => (
                <Card key={server.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-border bg-muted/40">
                          <Server className="h-4 w-4 text-violet-300" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{server.id}</CardTitle>
                          <CardDescription>{server.type === 'remote' ? 'HTTP / remote' : 'STDIO / local'}</CardDescription>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${stateClass(server.state)}`}>
                        {server.state === 'ready' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
                        {stateLabel(server.state)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <div className="rounded border border-border bg-muted/20 p-2 font-mono break-all">
                      {server.url || [server.command, ...(server.args || [])].filter(Boolean).join(' ')}
                    </div>
                    {server.requiredEnv.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {server.requiredEnv.map((key) => (
                          <span key={key} className="rounded border border-border px-2 py-0.5 font-mono">
                            {key}{server.configuredEnv.includes(key) ? ' ✓' : ' · missing'}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-violet-300" />
                Built-in manager
              </CardTitle>
              <CardDescription>Preset + custom MCP server.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Browserbase, Context7, Convex, Figma, Hugging Face, Linear, Notion, Playwright và Supabase đã có preset
              trong manager.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-violet-300" />
                Task binding
              </CardTitle>
              <CardDescription>MCP được gắn theo task.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Task schema đã có MCP server IDs và executor nhận danh sách server khi task chạy.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-violet-300" />
                Security boundary
              </CardTitle>
              <CardDescription>Không đưa secret vào prompt.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Environment variables và credentials được xử lý qua connector configuration thay vì hard-code vào task.
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5" />
          Runtime registry là nguồn cấu hình hệ thống; Connector Manager là nguồn cấu hình theo user.
        </div>

        <ConnectorDialog open={open} onOpenChange={setOpen} />
      </div>
    </main>
  )
}
