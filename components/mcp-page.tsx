'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cable, Database, Plus, ShieldCheck, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectorDialog } from '@/components/connectors/manage-connectors'

const capabilities = [
  ['Tools', 'Cho phép agent gọi tool từ server MCP.'],
  ['Resources', 'Đưa dữ liệu/tài nguyên vào context của task.'],
  ['Prompts', 'Tái sử dụng prompt và workflow theo server.'],
  ['Isolation', 'Server local chạy trong execution boundary phù hợp.'],
] as const

export function McpPage() {
  const [open, setOpen] = useState(false)

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-violet-400/60 bg-violet-500/10">
              <Cable className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW / MCP</p>
              <h1 className="text-2xl font-semibold">MCP Servers</h1>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            MCP là lớp mở rộng trực tiếp cho Agent → Executor: server cung cấp tools/resources/prompts để task có thêm khả năng mà không phải nhúng provider-specific logic vào core.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Quản lý MCP</Button>
            <Button variant="outline" asChild><Link href="/api-keys">API Keys</Link></Button>
            <Button variant="outline" asChild><Link href="/wiki#mcp">MCP Wiki</Link></Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(([title, description], index) => (
            <Card key={title}>
              <CardHeader className="p-4"><CardTitle className="flex items-center gap-2 text-sm"><span className="font-mono text-violet-300">0{index + 1}</span>{title}</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 text-xs leading-5 text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Wrench className="h-4 w-4 text-violet-300" />Built-in manager</CardTitle><CardDescription>Preset + custom MCP server.</CardDescription></CardHeader><CardContent className="text-xs text-muted-foreground">Browserbase, Context7, Convex, Figma, Hugging Face, Linear, Notion, Playwright và Supabase đã có preset trong manager.</CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4 text-violet-300" />Task binding</CardTitle><CardDescription>MCP được gắn theo task.</CardDescription></CardHeader><CardContent className="text-xs text-muted-foreground">Task schema đã có MCP server IDs và executor hiện nhận danh sách server khi task chạy.</CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-violet-300" />Security boundary</CardTitle><CardDescription>Không đưa secret vào prompt.</CardDescription></CardHeader><CardContent className="text-xs text-muted-foreground">Environment variables và credentials được xử lý qua connector configuration thay vì hard-code vào task.</CardContent></Card>
        </section>

        <ConnectorDialog open={open} onOpenChange={setOpen} />
      </div>
    </main>
  )
}
