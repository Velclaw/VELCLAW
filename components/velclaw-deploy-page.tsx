'use client'

import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  ExternalLink,
  Github,
  KeyRound,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const deploymentFlow = [
  ['/new', 'Task', 'Define what should ship.'],
  ['/skills', 'Skill', 'Select deployment-aware capabilities.'],
  ['/velclaw', 'Executor', 'Build and validate in the workspace.'],
  ['/velclaw/ui-audit', 'Review', 'Review UI/runtime evidence.'],
  ['/docs', 'Gate', 'Require quality and policy checks.'],
  ['/repos/new', 'GitHub API', 'Commit and deliver the release.'],
] as const

const targets = [
  {
    name: 'Velclaw Production',
    host: 'velclaw.cfd',
    state: 'canonical',
    description: 'Primary Velclaw host. Production claims require verified deployment evidence.',
  },
  {
    name: 'Velclaw Preview',
    host: '*.velclaw.cfd',
    state: 'preview',
    description: 'Velclaw-owned preview hostname. Platform-generated hostnames stay behind the deployment boundary.',
  },
  {
    name: 'Task Deployment',
    host: 'task.<branch>.velclaw.cfd',
    state: 'task-scoped',
    description: 'Deployment evidence associated with the Task and its release branch.',
  },
] as const

export function VelclawDeployPage() {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="relative overflow-hidden border border-violet-400/40 bg-card p-5 md:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-violet-400/60 bg-violet-500/10">
                <Cloud className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-violet-300">VELCLAW / DEPLOY</p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Velclaw Deploy</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Deployment control plane riêng của Velclaw: chuẩn bị release, theo dõi evidence và chỉ công bố các URL
                  thuộc namespace Velclaw.
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
                <Link href="/skills">
                  <Terminal className="h-4 w-4" /> Skills
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://velclaw.cfd" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open Production
                </a>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Canonical target</CardTitle>
              <CardDescription>Host chính thức của Velclaw.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 font-mono text-sm text-violet-200">velclaw.cfd</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Delivery source</CardTitle>
              <CardDescription>Source of truth cho release.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 px-4 pb-4 text-sm">
              <Github className="h-4 w-4" /> Velclaw/Velclaw · main
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Security boundary</CardTitle>
              <CardDescription>Deploy credentials không nằm trong UI metadata.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 px-4 pb-4 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-violet-300" /> API Keys / environment / secrets
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Deployment flow</h2>
            <p className="text-xs text-muted-foreground">
              Deploy là delivery surface của pipeline canonical, không phải một pipeline riêng.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {deploymentFlow.map(([href, label, description], index) => (
              <Link key={href} href={href} className="border border-border bg-card p-3 hover:border-violet-400/60">
                <p className="font-mono text-[10px] text-violet-300">0{index + 1}</p>
                <p className="mt-1 text-sm font-medium">{label}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
          <div className="border border-border bg-card px-4 py-3 font-mono text-xs text-muted-foreground">
            Task → Skill selection → Executor → Review → Gate → GitHub API → PR → Deployment evidence
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Velclaw deployment targets</h2>
            <p className="text-xs text-muted-foreground">
              Mọi URL hiển thị cho người dùng đều thuộc namespace Velclaw.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {targets.map((target) => (
              <Card key={target.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm">{target.name}</CardTitle>
                      <CardDescription className="mt-1 font-mono text-[10px]">{target.host}</CardDescription>
                    </div>
                    <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground">
                      {target.state}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="text-xs leading-5 text-muted-foreground">{target.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Release checklist</CardTitle>
              <CardDescription>Evidence cần có trước khi gọi một deployment thành công.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {[
                'Task có repository + branch hợp lệ',
                'Skill selection và Executor hoàn tất',
                'Review / UI Audit không còn blocker',
                'Gate/CI checks có evidence',
                'GitHub commit/PR đã được tạo',
                'Deployment URL là hostname thuộc velclaw.cfd và đã được xác nhận',
              ].map((item) => (
                <div key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Existing deployment evidence</CardTitle>
              <CardDescription>Không tạo API giả nếu backend chưa hỗ trợ thao tác deploy trực tiếp.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-5 text-muted-foreground">
              <p>
                Task deployment API hiện có thể kiểm tra preview URL từ task, GitHub Checks, GitHub Deployments và
                commit statuses. Trang Velclaw Deploy đưa evidence đó vào cùng một UX và chỉ chấp nhận URL thuộc
                namespace Velclaw.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tasks">
                    <RefreshCw className="h-3.5 w-3.5" /> Task Deployments
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/api-keys">
                    <KeyRound className="h-3.5 w-3.5" /> Deployment credentials
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Boundary</p>
          <p className="mt-2">
            Velclaw Deploy không tự nhận deployment đã thành công chỉ vì trang được mở. Production status chỉ được đánh
            dấu khi có evidence thật từ deployment checks. Platform-generated hostnames không được hiển thị như URL sản
            phẩm; URL public phải là <code>velclaw.cfd</code> hoặc một subdomain <code>*.velclaw.cfd</code>.
          </p>
        </section>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <Link href="/plugins" className="inline-flex items-center gap-1 hover:text-violet-300">
            Plugins <ArrowRight className="h-3 w-3" />
          </Link>
          <Link href="/mcp" className="inline-flex items-center gap-1 hover:text-violet-300">
            MCP <ArrowRight className="h-3 w-3" />
          </Link>
          <Link href="/velclawhub" className="inline-flex items-center gap-1 hover:text-violet-300">
            VelclawHub <ArrowRight className="h-3 w-3" />
          </Link>
          <Link href="/docs" className="inline-flex items-center gap-1 hover:text-violet-300">
            Docs <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </main>
  )
}
