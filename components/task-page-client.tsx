'use client'

import { useState, useMemo } from 'react'
import { useTask } from '@/lib/hooks/use-task'
import { TaskDetails } from '@/components/task-details'
import { SharedHeader } from '@/components/shared-header'
import { TaskActions } from '@/components/task-actions'
import { LogsPane } from '@/components/logs-pane'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, GitBranch, CircleDot, Loader2, CheckCircle2, XCircle, Square } from 'lucide-react'
import type { Session } from '@/lib/session/types'
import { useRouter } from 'next/navigation'

interface TaskPageClientProps {
  taskId: string
  user: Session['user'] | null
  authProvider: Session['authProvider'] | null
  initialStars?: number
  maxSandboxDuration?: number
}

function parseRepoFromUrl(repoUrl: string | null): { owner: string; repo: string } | null {
  if (!repoUrl) return null
  try {
    const url = new URL(repoUrl)
    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1].replace(/\.git$/, '') }
    }
    return null
  } catch {
    return null
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'processing') return <Loader2 className="size-3 animate-spin" />
  if (status === 'completed') return <CheckCircle2 className="size-3" />
  if (status === 'error') return <XCircle className="size-3" />
  if (status === 'stopped') return <Square className="size-3" />
  return <CircleDot className="size-3" />
}

export function TaskPageClient({
  taskId,
  user,
  authProvider,
  initialStars = 1200,
  maxSandboxDuration = 300,
}: TaskPageClientProps) {
  const { task, isLoading, error } = useTask(taskId)
  const [logsPaneHeight, setLogsPaneHeight] = useState(40)
  const router = useRouter()

  const repoInfo = useMemo(() => parseRepoFromUrl(task?.repoUrl ?? null), [task?.repoUrl])

  const headerLeftActions = repoInfo ? (
    <div className="flex items-center gap-2 min-w-0">
      <h1 className="text-sm font-semibold truncate">
        {repoInfo.owner}/{repoInfo.repo}
      </h1>
    </div>
  ) : null

  if (isLoading) {
    return (
      <div className="flex-1 bg-background">
        <div className="p-3"><SharedHeader initialStars={initialStars} /></div>
        <div className="mx-auto max-w-7xl p-4 space-y-3 animate-pulse">
          <div className="h-10 border bg-muted/30" />
          <div className="h-24 border bg-muted/20" />
          <div className="h-[420px] border bg-muted/20" />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex-1 bg-background">
        <div className="p-3"><SharedHeader initialStars={initialStars} /></div>
        <div className="mx-auto max-w-2xl p-6">
          <div className="border p-6 text-center">
            <XCircle className="mx-auto size-8 text-destructive" />
            <h2 className="mt-3 text-lg font-semibold">Task Not Found</h2>
            <p className="mt-1 text-sm text-muted-foreground">{error || 'The requested task could not be found.'}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/tasks')}>
              <ArrowLeft className="mr-2 size-4" /> Back to tasks
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const statusLabel = task.status === 'error' ? 'failed' : task.status

  return (
    <div className="flex-1 bg-background relative flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-3 py-2 border-b">
        <SharedHeader
          leftActions={headerLeftActions}
          initialStars={initialStars}
          extraActions={<TaskActions task={task} />}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b bg-muted/20 px-3 py-1.5 text-[11px] font-mono overflow-x-auto">
        <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => router.push('/tasks')} aria-label="Back to tasks">
          <ArrowLeft className="size-3.5" />
        </Button>
        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
          <GitBranch className="size-3" />
          <span>{task.branchName || 'workspace'}</span>
        </div>
        <span className="text-border">/</span>
        <span className="truncate max-w-[280px] text-foreground">{task.title || task.prompt}</span>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="h-6 gap-1 px-2 text-[10px] uppercase tracking-wider">
            <StatusIcon status={task.status} />
            {statusLabel}
          </Badge>
          {task.selectedAgent && <span className="hidden sm:inline text-muted-foreground">{task.selectedAgent}</span>}
          {task.selectedModel && <span className="hidden md:inline max-w-[180px] truncate text-muted-foreground">{task.selectedModel}</span>}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ paddingBottom: `${logsPaneHeight}px` }}>
        <TaskDetails task={task} maxSandboxDuration={maxSandboxDuration} />
      </div>

      <LogsPane task={task} onHeightChange={setLogsPaneHeight} />
    </div>
  )
}
