'use client'

import Link from 'next/link'
import { Cable, CheckCircle2, GitPullRequest, KeyRound, ListChecks, Network, Package, ShieldCheck } from 'lucide-react'
import { VELCLAW_SKILLS } from '@/lib/velclaw/skills'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const pipeline = [
  ['/new', 'Task'],
  ['/velclaw', 'Executor'],
  ['/plugins', 'Plugins'],
  ['/mcp', 'MCP'],
  ['/velclaw/ui-audit', 'Review / Audit'],
  ['/docs', 'Gate / Docs'],
  ['/repos/new', 'GitHub / PR'],
] as const

export function VelclawSkillsPage() {
  const available = VELCLAW_SKILLS.filter((skill) => skill.status === 'available')
  const agents = new Set(VELCLAW_SKILLS.flatMap((skill) => skill.agents))

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border border-border bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-violet-400/60 bg-violet-500/10">
                <ListChecks className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW / SKILLS</p>
                <h1 className="text-2xl font-semibold">Velclaw Skills</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Reusable agent capabilities, instructions and workflows for the canonical Velclaw pipeline. Skills are
                  not Plugins and do not store credentials.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/new">
                  <ListChecks className="h-4 w-4" /> New Task
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/plugins">
                  <Package className="h-4 w-4" /> Plugins
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/mcp">
                  <Cable className="h-4 w-4" /> MCP
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Available Skills</CardTitle>
              <CardDescription>Canonical metadata đã được đăng ký.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-2xl font-semibold">{available.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Agent Coverage</CardTitle>
              <CardDescription>Agent targets trong registry.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-2xl font-semibold">{agents.size}</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Isolation</CardTitle>
              <CardDescription>Skill execution yêu cầu boundary rõ ràng.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 px-4 pb-4 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-violet-300" /> Isolated sandbox
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Velclaw pipeline</h2>
            <p className="text-xs text-muted-foreground">
              Skill selection bổ trợ pipeline; không tạo pipeline thứ hai.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
            {pipeline.map(([href, label], index) => (
              <Link
                key={href}
                href={href}
                className="border border-border bg-card p-3 transition-colors hover:border-violet-400/60"
              >
                <p className="font-mono text-[10px] text-violet-300">0{index + 1}</p>
                <p className="mt-1 text-sm font-medium">{label}</p>
              </Link>
            ))}
          </div>
          <div className="border border-border bg-card px-4 py-3 font-mono text-xs text-muted-foreground">
            Task → Skill selection → Executor → Review → Gate → GitHub API → PR
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Skill registry</h2>
            <p className="text-xs text-muted-foreground">
              Nguồn dữ liệu duy nhất: <code>lib/velclaw/skills.ts</code>.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {VELCLAW_SKILLS.map((skill) => (
              <Card key={skill.id} className="border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm">{skill.name}</CardTitle>
                      <CardDescription className="mt-1 font-mono text-[10px]">
                        {skill.id} · v{skill.version}
                      </CardDescription>
                    </div>
                    <span className="inline-flex items-center gap-1 border border-emerald-400/40 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" /> {skill.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="leading-5 text-muted-foreground">{skill.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="border border-border bg-background p-2">
                      <span className="text-muted-foreground">Executor</span>
                      <div className="mt-1 font-mono">{skill.executorBinding}</div>
                    </div>
                    <div className="border border-border bg-background p-2">
                      <span className="text-muted-foreground">Sandbox</span>
                      <div className="mt-1 font-mono">{skill.sandbox}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.permissions.map((permission) => (
                      <span key={permission} className="border border-border px-2 py-1 font-mono text-[10px]">
                        {permission}
                      </span>
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">Agents: {skill.agents.join(', ')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Link href="/tasks" className="border border-border bg-card p-4 hover:border-violet-400/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="h-4 w-4" /> Velclaw Tasks
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">Task lifecycle và execution state.</p>
          </Link>
          <Link href="/velclaw/ui-audit" className="border border-border bg-card p-4 hover:border-violet-400/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <GitPullRequest className="h-4 w-4" /> Review / Gate
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">Kiểm tra UI, quality và gate evidence.</p>
          </Link>
          <Link href="/api-keys" className="border border-border bg-card p-4 hover:border-violet-400/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="h-4 w-4" /> API Keys
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">Credentials nằm ngoài skill metadata.</p>
          </Link>
        </section>

        <section className="border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Boundary</p>
          <p className="mt-2">
            Registry này mô tả capability và binding contract. Nó không giả lập install/remove/enable hoặc runtime
            execution khi backend tương ứng chưa tồn tại. Plugin integrations vẫn thuộc Velclaw Plugins; MCP vẫn là
            protocol/runtime; credentials chỉ đi qua API Keys hoặc environment/secrets.
          </p>
        </section>
      </div>
    </main>
  )
}
