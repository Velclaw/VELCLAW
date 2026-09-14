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

type DeploymentTarget = {
  projectName: string
  repoUrl: string
  branch: string
  path: string
  description: string
}

const DEPLOYMENT_TARGETS: DeploymentTarget[] = [
  { projectName: 'velclaw-pages', repoUrl: 'https://github.com/Velclaw/deploy-velclaw.git', branch: 'main', path: '/', description: 'Velclaw public product landing' },
  { projectName: 'velclaw-docs', repoUrl: 'https://github.com/Velclaw/docs.velclaw.ai.git', branch: 'main', path: '/docs', description: 'Velclaw documentation surface' },
]

const DEFAULT_TARGET = DEPLOYMENT_TARGETS[0]
const PIPELINE = ['source', 'ci', 'build', 'test', 'security', 'approval', 'deploy', 'smoke', 'live'] as const

function stageForStatus(status: string) {
  if (status === 'queued') return 1
  if (status === 'building') return 3
  if (status === 'ready') return PIPELINE.length
  if (status === 'failed') return 4
  if (status === 'cancelled') return 0
  return 1
}

export default function VelclawDeployEnginePage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [projectName, setProjectName] = useState(DEFAULT_TARGET.projectName)
  const [repoUrl, setRepoUrl] = useState(DEFAULT_TARGET.repoUrl)
  const [branch, setBranch] = useState(DEFAULT_TARGET.branch)
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

  function selectTarget(target: DeploymentTarget) {
    setProjectName(target.projectName)
    setRepoUrl(target.repoUrl)
    setBranch(target.branch)
    setError('')
  }

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
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-violet-300">VELCLAW / DEPLOY CENTER</p>
          <h1 className="mt-2 text-3xl font-semibold">Release Pipeline</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Source → CI → build → test → security → approval → deploy → smoke → live. The UI reflects release state without pretending a stage passed before the backend reports it.</p>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {DEPLOYMENT_TARGETS.map((target) => (
            <article key={target.projectName} className="border border-violet-400/30 bg-violet-500/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">Deployment target</p><h2 className="mt-1 text-lg font-semibold">{target.projectName}</h2><p className="mt-1 text-xs text-muted-foreground">{target.description} → <span className="font-mono text-violet-300">https://velclaw.cfd{target.path}</span>.</p></div>
                <button type="button" onClick={() => selectTarget(target)} className="border border-violet-400/60 px-3 py-2 text-xs">Use target</button>
              </div>
            </article>
          ))}
        </section>

        <form onSubmit={submit} className="grid gap-3 border border-border bg-card p-4 md:grid-cols-4">
          <label className="space-y-1 text-xs"><span>Project</span><input required className="w-full border border-border bg-background px-3 py-2" value={projectName} onChange={(e) => setProjectName(e.target.value)} /></label>
          <label className="space-y-1 text-xs md:col-span-2"><span>GitHub repository</span><input required className="w-full border border-border bg-background px-3 py-2" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} /></label>
          <label className="space-y-1 text-xs"><span>Branch</span><input required className="w-full border border-border bg-background px-3 py-2" value={branch} onChange={(e) => setBranch(e.target.value)} /></label>
          <div className="flex items-center gap-3 md:col-span-4"><button disabled={busy} className="border border-violet-400/60 bg-violet-500/10 px-4 py-2 text-sm disabled:opacity-50">{busy ? 'Queueing…' : 'Start release'}</button>{error && <span className="text-xs text-red-300">{error}</span>}</div>
        </form>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Release queue</h2><p className="text-xs text-muted-foreground">Each release is tracked independently from source through live health.</p></div><button type="button" onClick={() => void refresh()} className="border border-border px-3 py-2 text-xs">Refresh</button></div>
          {deployments.length === 0 && <div className="border border-border p-4 text-sm text-muted-foreground">No releases yet.</div>}
          {deployments.map((deployment) => {
            const current = stageForStatus(deployment.status)
            return <article key={deployment.id} className="border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-medium">{deployment.projectName}</h3><p className="font-mono text-[11px] text-muted-foreground">{deployment.branch} · {deployment.id}</p></div><span className="border border-border px-2 py-1 font-mono text-[10px] uppercase">{deployment.status}</span></div>
              <div className="mt-4 grid gap-1 sm:grid-cols-3 lg:grid-cols-9">{PIPELINE.map((stage, index) => <div key={stage} className={`border p-2 font-mono text-[9px] uppercase ${index + 1 <= current ? 'border-violet-400/60 bg-violet-500/10 text-violet-200' : 'border-border text-muted-foreground'}`}><span className="block">{String(index + 1).padStart(2, '0')}</span>{stage}</div>)}</div>
              <p className="mt-3 text-xs text-muted-foreground">{deployment.repoUrl}</p>
              {deployment.commitSha && <p className="mt-1 font-mono text-[10px] text-muted-foreground">commit {deployment.commitSha}</p>}
              {deployment.url && <a href={deployment.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-violet-300 underline">Open deployment</a>}
              {deployment.error && <p className="mt-2 text-xs text-red-300">{deployment.error}</p>}
              <pre className="mt-3 max-h-40 overflow-auto bg-background p-3 text-[11px] leading-5 text-muted-foreground">{(deployment.logs || []).join('\n')}</pre>
            </article>
          })}
        </section>
      </div>
    </main>
  )
}
