'use client'

import { FormEvent, useEffect, useState } from 'react'

interface Deployment {
  id: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha: string | null
  status: string
  url: string | null
  logs: string[]
  error: string | null
  createdAt: string
}

export default function VelclawDeployEnginePage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [projectName, setProjectName] = useState('velclaw')
  const [repoUrl, setRepoUrl] = useState('https://github.com/Velclaw/Velclaw.git')
  const [branch, setBranch] = useState('main')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    const response = await fetch('/api/deployments', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setDeployments(data.deployments || [])
  }

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), 5000)
    return () => window.clearInterval(timer)
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ projectName, repoUrl, branch }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to queue deployment')
      setDeployments((current) => [data.deployment, ...current])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to queue deployment')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-violet-300">VELCLAW / DEPLOY ENGINE</p>
          <h1 className="mt-2 text-3xl font-semibold">Velclaw Deploy Engine</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Self-hosted deployment control plane. GitHub is the source of truth; the worker builds releases without relying on Vercel.
          </p>
        </header>

        <form onSubmit={submit} className="grid gap-3 border border-border bg-card p-4 md:grid-cols-4">
          <label className="space-y-1 text-xs">
            <span>Project</span>
            <input className="w-full border border-border bg-background px-3 py-2" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs md:col-span-2">
            <span>GitHub repository</span>
            <input className="w-full border border-border bg-background px-3 py-2" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span>Branch</span>
            <input className="w-full border border-border bg-background px-3 py-2" value={branch} onChange={(e) => setBranch(e.target.value)} />
          </label>
          <div className="md:col-span-4 flex items-center gap-3">
            <button disabled={busy} className="border border-violet-400/60 bg-violet-500/10 px-4 py-2 text-sm disabled:opacity-50">
              {busy ? 'Queueing…' : 'Deploy'}
            </button>
            {error && <span className="text-xs text-red-300">{error}</span>}
          </div>
        </form>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Deployments</h2>
              <p className="text-xs text-muted-foreground">Queue → isolated build worker → verified build artifact → runtime publication.</p>
            </div>
            <button onClick={() => void refresh()} className="border border-border px-3 py-2 text-xs">Refresh</button>
          </div>
          <div className="space-y-2">
            {deployments.length === 0 && <div className="border border-border p-4 text-sm text-muted-foreground">No deployments yet.</div>}
            {deployments.map((deployment) => (
              <article key={deployment.id} className="border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{deployment.projectName}</h3>
                    <p className="font-mono text-[11px] text-muted-foreground">{deployment.branch} · {deployment.id}</p>
                  </div>
                  <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase">{deployment.status}</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{deployment.repoUrl}</p>
                {deployment.error && <p className="mt-2 text-xs text-red-300">{deployment.error}</p>}
                <pre className="mt-3 max-h-40 overflow-auto bg-background p-3 text-[11px] leading-5 text-muted-foreground">{(deployment.logs || []).join('\n')}</pre>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
