'use client'

import Link from 'next/link'
import {
  Activity,
  CheckCircle2,
  GitPullRequest,
  KeyRound,
  Play,
  Server,
  TerminalSquare,
  BookOpen,
  Cloud,
  ListChecks,
  PlugZap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/lib/db/schema'

const stages = [
  ['/new', 'Task', 'Create and track work'],
  ['/skills', 'Skill selection', 'Select reusable agent capability'],
  ['/velclaw', 'Executor', 'Run agent in sandbox'],
  ['/velclaw/ui-audit', 'Review', 'Review diff and findings'],
  ['/docs', 'Gate', 'Checks and policy evidence'],
  ['/repos/new', 'GitHub API → PR', 'Branch, commit and pull request'],
  ['/deploy', 'Deployment', 'Verify provider-backed deployment evidence'],
] as const

function statusVariant(status: Task['status']) {
  if (status === 'completed') return 'default' as const
  if (status === 'error') return 'destructive' as const
  return 'outline' as const
}

export function VelclawDashboard({ tasks }: { tasks: Task[] }) {
  const processing = tasks.filter((task) => task.status === 'processing').length
  const completed = tasks.filter((task) => task.status === 'completed').length
  const prs = tasks.filter((task) => task.prUrl).length

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src="/brand/velclaw-mark.svg" alt="" className="h-8 w-8 border border-violet-400/60" />
              <h1 className="text-3xl font-bold tracking-tight">Velclaw Dashboard</h1>
            </div>
            <p className="mt-1 text-muted-foreground">
              Canonical workflow from Task through Skill selection, execution, review, gate, GitHub PR and deployment
              evidence.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/new">Create Task</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/deploy">
                <Cloud className="h-4 w-4" /> Deploy
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks">All Tasks</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Activity className="h-5 w-5 text-violet-300" />
              <div>
                <div className="text-2xl font-semibold">{processing}</div>
                <div className="text-xs text-muted-foreground">Running</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-violet-300" />
              <div>
                <div className="text-2xl font-semibold">{completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <GitPullRequest className="h-5 w-5 text-violet-300" />
              <div>
                <div className="text-2xl font-semibold">{prs}</div>
                <div className="text-xs text-muted-foreground">PRs created</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Velclaw pipeline</CardTitle>
            <CardDescription>
              Plugins and MCP are execution capabilities, not sequential pipeline stages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
              {stages.map(([href, name, description], index) => (
                <Link key={href} href={href} className="border p-3 transition-colors hover:border-violet-400/60">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="flex h-6 w-6 items-center justify-center border border-border bg-muted text-xs">
                      {index + 1}
                    </span>
                    {name}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{description}</p>
                </Link>
              ))}
            </div>
            <div className="mt-3 border border-border bg-muted/20 px-3 py-2 font-mono text-[10px] text-muted-foreground">
              Plugins / MCP → approved capabilities available to Executor
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Recent tasks</CardTitle>
              <CardDescription>Execution, sandbox, review, gate and PR state.</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No tasks yet. Create the first Velclaw task.
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 12).map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{task.title || task.prompt}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{task.selectedAgent || 'agent'}</span>
                            {task.selectedModel && <span>· {task.selectedModel}</span>}
                            {task.branchName && <span>· {task.branchName}</span>}
                          </div>
                        </div>
                        <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                      </div>
                      {task.prUrl && (
                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <GitPullRequest className="h-3.5 w-3.5" /> PR #{task.prNumber ?? '—'} ·{' '}
                          {task.prStatus ?? 'unknown'}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Velclaw system</CardTitle>
              <CardDescription>Core configuration, capabilities and delivery.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button className="w-full justify-start" asChild>
                <Link href="/">
                  <Play />
                  Create Task
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tasks">
                  <TerminalSquare />
                  Monitor Tasks
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/skills">
                  <ListChecks />
                  Skills
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/plugins">
                  <PlugZap />
                  Plugins
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mcp">
                  <Server />
                  MCP
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/deploy">
                  <Cloud />
                  Deploy
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/api-keys">
                  <KeyRound />
                  API Keys
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/wiki">
                  <BookOpen />
                  Wiki
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
