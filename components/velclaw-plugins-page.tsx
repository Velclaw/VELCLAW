'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Cable,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Network,
  Package,
  PlugZap,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { VELCLAW_INTEGRATIONS } from '@/lib/velclaw/integrations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const kindLabels: Record<string, string> = {
  agent: 'AI Agent',
  reviewer: 'Code Review',
  workspace: 'Workspace',
  skills: 'Skills & MCP',
  docs: 'Documentation',
  network: 'Network',
  cloud: 'Cloud',
  database: 'Database',
  'source-control': 'Source Control',
  identity: 'Identity',
}

export function VelclawPluginsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'planned'>('all')
  const [kindFilter, setKindFilter] = useState('all')

  const available = VELCLAW_INTEGRATIONS.filter((integration) => integration.status === 'available')
  const planned = VELCLAW_INTEGRATIONS.filter((integration) => integration.status === 'planned')
  const filteredIntegrations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return VELCLAW_INTEGRATIONS.filter((integration) => {
      const matchesStatus = statusFilter === 'all' || integration.status === statusFilter
      const matchesKind = kindFilter === 'all' || integration.kind === kindFilter
      const searchable = [
        integration.name,
        integration.id,
        integration.source,
        kindLabels[integration.kind] ?? integration.kind,
        ...(integration.capabilities ?? []),
      ]
        .join(' ')
        .toLowerCase()
      return matchesStatus && matchesKind && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [query, statusFilter, kindFilter])

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-violet-400/60 bg-violet-500/10">
                <PlugZap className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW / EXTENSIONS</p>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Skills & Plugins</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Khám phá và quản lý registry tích hợp cho Claude, OpenAI Codex, Sandbox ChatGPT, Gemini, MCP và các dịch vụ
                  hỗ trợ quy trình phát triển của Velclaw.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/skills">
                  <Package className="h-4 w-4" /> Skills
                </Link>
              </Button>
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
              <CardDescription>Đã đăng ký là có sẵn trong registry.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-2xl font-semibold tabular-nums">{available.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Planned</CardTitle>
              <CardDescription>Đã khai báo, cần hoàn thiện adapter/runtime.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-2xl font-semibold tabular-nums">{planned.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Secret isolation</CardTitle>
              <CardDescription>Thông tin xác thực không được lưu trong metadata.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 px-4 pb-4 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-violet-300" /> Dùng API Keys hoặc environment secrets.
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Plugin registry</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {filteredIntegrations.length} / {VELCLAW_INTEGRATIONS.length} tích hợp · nguồn dữ liệu{' '}
                <code>lib/velclaw/integrations.ts</code>
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px_170px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm plugin, nguồn, capability…"
                  aria-label="Tìm plugin"
                  className="h-10 w-full border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | 'available' | 'planned')}
                aria-label="Lọc theo trạng thái"
                className="h-10 border border-border bg-background px-3 text-sm outline-none focus:border-violet-400"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="available">Available</option>
                <option value="planned">Planned</option>
              </select>
              <select
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value)}
                aria-label="Lọc theo loại plugin"
                className="h-10 border border-border bg-background px-3 text-sm outline-none focus:border-violet-400"
              >
                <option value="all">Mọi loại</option>
                {Object.entries(kindLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredIntegrations.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="flex min-w-0 flex-col border-border/80 transition-colors hover:border-violet-400/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-violet-400/30 bg-violet-500/10">
                        <Package className="h-5 w-5 text-violet-300" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${integration.status === 'available' ? 'border-emerald-400/40 text-emerald-300' : 'border-border text-muted-foreground'}`}
                      >
                        {integration.status === 'available' ? <CheckCircle2 className="h-3 w-3" /> : <Network className="h-3 w-3" />}
                        {integration.status}
                      </span>
                    </div>
                    <CardTitle className="pt-3 text-sm">{integration.name}</CardTitle>
                    <CardDescription className="break-all font-mono text-[10px]">{integration.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3 text-xs">
                    <div className="text-muted-foreground">{kindLabels[integration.kind] ?? integration.kind}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(integration.capabilities ?? []).map((capability) => (
                        <span key={capability} className="border border-border bg-background px-2 py-1 font-mono text-[9px] text-muted-foreground">
                          {capability}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto border-t border-border pt-3">
                      <p className="mb-2 break-all font-mono text-[10px] text-muted-foreground">{integration.source}</p>
                      {integration.source.startsWith('http') ? (
                        <a className="inline-flex items-center gap-1 text-violet-300 hover:underline" href={integration.source} target="_blank" rel="noreferrer">
                          Mở trang dịch vụ <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Internal registry entry</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border p-10 text-center">
              <Search className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Không tìm thấy plugin</p>
              <p className="mt-1 text-xs text-muted-foreground">Thử từ khóa khác hoặc bỏ bộ lọc.</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setStatusFilter('all')
                  setKindFilter('all')
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </section>

        <section className="border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Trạng thái triển khai</p>
          <p className="mt-2">
            Đây là registry giao diện và metadata. Các tích hợp mang trạng thái Planned chưa được kết nối runtime hoặc OAuth
            chỉ vì chúng xuất hiện ở đây. Kết nối thật cần adapter, quyền truy cập và cấu hình bí mật tương ứng; trang này
            không giả lập nút cài đặt hay báo kết nối thành công.
          </p>
        </section>
      </div>
    </main>
  )
}
