'use client'

import { useEffect, useState } from 'react'

type Finding = { severity?: string; message?: string; file?: string; line?: number }
type Check = { name: string; status: string; conclusion?: string | null; url?: string }
type ReviewState = {
  findings: Finding[]
  checks: Check[]
  gate?: 'passed' | 'blocked' | 'pending'
  checksPassing?: boolean
  checksPending?: boolean
  reviewAvailable?: boolean
}

export function VelclawFindingsPanel({ taskId }: { taskId: string }) {
  const [review, setReview] = useState<ReviewState>({ findings: [], checks: [], gate: 'pending' })

  useEffect(() => {
    let stopped = false
    async function refresh() {
      try {
        const response = await fetch(`/api/velclaw/tasks/${encodeURIComponent(taskId)}/review`, { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        if (!stopped)
          setReview({
            findings: data.findings ?? [],
            checks: data.checks ?? [],
            gate: data.gate,
            checksPassing: data.checksPassing,
            checksPending: data.checksPending,
            reviewAvailable: data.reviewAvailable,
          })
      } catch {
        /* transient polling failure */
      }
    }
    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [taskId])

  return (
    <section className="rounded-lg border p-4 space-y-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Gito Review & Gate</h2>
          <p className="text-xs text-muted-foreground">Live findings and GitHub CI state</p>
        </div>
        <span className="rounded-full border px-2 py-1 text-xs">{review.gate || 'pending'}</span>
      </div>

      <div>
        <h3 className="text-sm font-medium">GitHub checks</h3>
        {review.checks.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {review.checksPending ? 'Waiting for GitHub checks…' : 'No check runs reported.'}
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {review.checks.map((check) => (
              <li
                key={`${check.name}-${check.url}`}
                className="flex items-center justify-between gap-2 rounded border px-2 py-1 text-sm"
              >
                <span className="truncate">{check.name}</span>
                <span>{check.status === 'completed' ? check.conclusion || 'completed' : check.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {review.findings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {review.reviewAvailable ? 'No findings reported.' : 'Gito review is not available yet.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {review.findings.map((finding, index) => (
            <li key={`${finding.file}-${finding.line}-${index}`} className="rounded-md border p-2 text-sm">
              <div className="font-medium">
                {finding.severity || 'info'}
                {finding.file ? ` · ${finding.file}` : ''}
                {finding.line ? `:${finding.line}` : ''}
              </div>
              <div className="text-muted-foreground">{finding.message || 'No message'}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
