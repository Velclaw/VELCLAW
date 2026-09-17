'use client'

import { useEffect, useState } from 'react'

type Status = {
  task?: string
  status?: string
  prUrl?: string | null
  updatedAt?: string
}

export function VelclawLiveStatus({ taskId }: { taskId: string }) {
  const [data, setData] = useState<Status>({})
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Unable to load task status')
        const json = await response.json()
        if (!cancelled) {
          setData({
            task: json.task?.id ?? json.id,
            status: json.task?.status ?? json.status,
            prUrl: json.task?.prUrl ?? json.prUrl ?? null,
            updatedAt: new Date().toISOString(),
          })
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load task status')
      }
    }

    refresh()
    const timer = window.setInterval(refresh, 3000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [taskId])

  return (
    <section className="rounded-lg border p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Live status</h2>
          <p className="text-xs text-muted-foreground">Refreshes every 3 seconds</p>
        </div>
        <span className="rounded-full border px-2 py-1 text-xs">{data.status || 'Loading'}</span>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {data.prUrl && (
        <a className="mt-3 inline-block text-sm underline" href={data.prUrl} target="_blank" rel="noreferrer">
          Open GitHub PR
        </a>
      )}
    </section>
  )
}
