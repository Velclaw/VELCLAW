'use client'

import { useMemo, useState } from 'react'

type Stage = 'task' | 'executor' | 'review' | 'gate' | 'pr'

const stages: Array<{ id: Stage; label: string }> = [
  { id: 'task', label: 'Task' },
  { id: 'executor', label: 'Executor / Sandbox' },
  { id: 'review', label: 'Gito Review' },
  { id: 'gate', label: 'Review Gate' },
  { id: 'pr', label: 'GitHub PR' },
]

export function VelclawTaskConsole({ taskId }: { taskId: string }) {
  const [active, setActive] = useState<Stage>('task')
  const [loading, setLoading] = useState<'review' | 'pr' | null>(null)
  const [message, setMessage] = useState('')

  const stageIndex = useMemo(() => stages.findIndex((stage) => stage.id === active), [active])

  async function runReview() {
    setLoading('review')
    setActive('review')
    setMessage('Running Gito review in the task sandbox…')
    try {
      const response = await fetch(`/api/velclaw/tasks/${encodeURIComponent(taskId)}/review/run`, { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) throw new Error(data.error || 'Gito review failed')
      setActive(data.snapshot?.status === 'passed' ? 'gate' : 'review')
      setMessage(
        data.snapshot?.status === 'passed'
          ? 'Gito review passed. Review Gate is ready.'
          : 'Gito review completed with findings.',
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gito review failed')
    } finally {
      setLoading(null)
    }
  }

  async function createPR() {
    setLoading('pr')
    setMessage('Validating review gate…')
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/pr`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'PR creation failed')
      setActive('pr')
      setMessage(data.data?.prUrl ? `PR created: ${data.data.prUrl}` : 'PR created successfully.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PR creation failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="border rounded-lg p-4 space-y-4" aria-label="Velclaw task pipeline">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Velclaw Pipeline</h2>
          <p className="text-sm text-muted-foreground">Task → Sandbox → Review → Gate → PR</p>
        </div>
        <span className="text-xs text-muted-foreground">Task {taskId}</span>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {stages.map((stage, index) => {
          const complete = index < stageIndex
          const current = index === stageIndex
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActive(stage.id)}
              className={`rounded-md border px-3 py-2 text-left text-sm ${current ? 'ring-2 ring-primary' : ''}`}
              aria-current={current ? 'step' : undefined}
            >
              <div className="font-medium">
                {index + 1}. {stage.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {complete ? 'Complete' : current ? 'Current' : 'Pending'}
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md bg-muted/40 p-3">
          <h3 className="text-sm font-medium">Execution</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sandbox output, logs and diff remain backed by the task system.
          </p>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <h3 className="text-sm font-medium">Review & CI</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Gito findings and GitHub checks determine the gate state.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runReview}
          disabled={loading !== null}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading === 'review' ? 'Reviewing…' : 'Run Gito Review'}
        </button>
        <button
          type="button"
          onClick={createPR}
          disabled={loading !== null}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading === 'pr' ? 'Checking…' : 'Create GitHub PR'}
        </button>
        {message && <p className="text-sm text-muted-foreground break-all">{message}</p>}
      </div>
    </section>
  )
}
