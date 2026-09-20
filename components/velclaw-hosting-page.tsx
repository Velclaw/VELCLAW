'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { Cloud, Container, ExternalLink, Github, Globe2, KeyRound, Plus, RefreshCw, Server, ShieldCheck, RotateCcw } from 'lucide-react'

interface Deployment {
  id: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha: string | null
  status: 'queued' | 'building' | 'ready' | 'failed' | 'cancelled' | string
  url: string | null
  customDomain: string | null
  logs: string[]
  error: string | null
  createdAt: string
  updatedAt: string
}

const exampleProjects = [
  { name: 'Velclaw', repo: 'https://github.com/Velclaw/Velclaw.git', branch: 'main', host: 'velclaw.cfd' },
  { name: 'Velclaw Docs', repo: 'https://github.com/Velclaw/velclaw.cfd/docs.git', branch: 'main', host: 'docs.velclaw.cfd' },
]

const platformStats = [
  ['Platform', 'Velclaw Hosting', Cloud],
  ['Runtime', 'Docker', Container],
  ['Routing', '*.velclaw.cfd', Globe2],
  ['Source', 'GitHub', Github],
] as const

function statusLabel(status: string) {
  return status.replaceAll('_', ' ')
}

function parseEnv(text: string) {
  const env: Record<string, string> = {}
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index <= 0) throw new Error(`Invalid environment line: ${line}`)
    env[line.slice(0, index).trim()] = line.slice(index + 1)
  }
  return env
}

export function VelclawHostingPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [projectName, setProjectName] = useState('velclaw-app')
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [customDomain, setCustomDomain] = useState('')
  const [envText, setEnvText] = useState('')
  const [busy, setBusy] = useState(false)
  const [rollbackId, setRollbackId] = useState('')
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const response = await fetch('/api/deployments', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load deployments')
      setDeployments(data.deployments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load deployments')
    }
  }

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), 5000)
    return () => window.clearInterval(timer)
  }, [])

  function useProject(project: (typeof exampleProjects)[number]) {
    setProjectName(project.name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''))
    setRepoUrl(project.repo)
    setBranch(project.branch)
    setCustomDomain('')
    setError('')
  }

  async function deploy(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const env = parseEnv(envText)
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ projectName, repoUrl, branch, customDomain: customDomain || null, env }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to queue deployment')
      setDeployments((current) => [data.deployment, ...current])
      setEnvText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to queue deployment')
    } finally {
      setBusy(false)
    }
  }

  async function rollback(deploymentId: string) {
    setRollbackId(deploymentId)
    setError('')
    try {
      const response = await fetch(`/api/deployments/${deploymentId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'rollback' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Rollback failed')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rollback failed')
    } finally {
      setRollbackId('')
    }
  }

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden border border-violet-400/40 bg-card p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-violet-400/60 bg-violet-500/10"><Cloud className="h-5 w-5 text-violet-300" /></div>
                <div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-violet-300">VELCLAW / HOSTING</p><h1 className="text-2xl font-semibold md:text-3xl">Velclaw Hosting</h1></div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">First-party hosting control plane của Velclaw. GitHub là source of truth; Velclaw Deploy xếp hàng build, Docker runtime chạy release và public traffic đi qua namespace <code>*.velclaw.cfd</code>.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/deploy/engine" className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs hover:border-violet-400/60"><Server className="h-3.5 w-3.5" /> Deploy Engine</Link>
              <a href="https://velclaw.cfd" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-violet-400/60 px-3 py-2 text-xs"><ExternalLink className="h-3.5 w-3.5" /> Production</a>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {platformStats.map(([label, value, Icon]) => <div key={label} className="border border-border bg-card p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-violet-300" /> {label}</div><p className="mt-3 font-mono text-sm">{value}</p></div>)}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div><h2 className="text-lg font-semibold">Deploy an application</h2><p className="text-xs text-muted-foreground">Queue a release through Velclaw Deploy with optional runtime environment and custom hostname.</p></div>
            <form onSubmit={deploy} className="grid gap-3 border border-border bg-card p-4 md:grid-cols-2">
              <label className="space-y-1 text-xs"><span>Project name</span><input required value={projectName} onChange={(event) => setProjectName(event.target.value)} className="w-full border border-border bg-background px-3 py-2 outline-none focus:border-violet-400/60" placeholder="my-app" /></label>
              <label className="space-y-1 text-xs"><span>Branch</span><input required value={branch} onChange={(event) => setBranch(event.target.value)} className="w-full border border-border bg-background px-3 py-2 outline-none focus:border-violet-400/60" placeholder="main" /></label>
              <label className="space-y-1 text-xs md:col-span-2"><span>GitHub repository</span><input required type="url" value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} className="w-full border border-border bg-background px-3 py-2 outline-none focus:border-violet-400/60" placeholder="https://github.com/owner/repository.git" /></label>
              <label className="space-y-1 text-xs md:col-span-2"><span>Custom domain (optional)</span><input value={customDomain} onChange={(event) => setCustomDomain(event.target.value)} className="w-full border border-border bg-background px-3 py-2 outline-none focus:border-violet-400/60" placeholder="app.example.com" /></label>
              <label className="space-y-1 text-xs md:col-span-2"><span>Environment variables (optional, one KEY=VALUE per line)</span><textarea value={envText} onChange={(event) => setEnvText(event.target.value)} rows={5} spellCheck={false} className="w-full resize-y border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-violet-400/60" placeholder={'NODE_ENV=production\nPUBLIC_API_URL=https://api.example.com'} /></label>
              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <button disabled={busy} className="inline-flex items-center gap-2 border border-violet-400/60 bg-violet-500/10 px-4 py-2 text-sm disabled:opacity-50"><Plus className="h-4 w-4" /> {busy ? 'Queueing…' : 'Deploy'}</button>
                <button type="button" onClick={() => void refresh()} className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
                {error && <span className="text-xs text-red-300">{error}</span>}
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Deployments</h2><p className="text-xs text-muted-foreground">Live queue/status, logs and rollback controls.</p></div><span className="font-mono text-[10px] uppercase text-muted-foreground">{deployments.length} records</span></div>
              {deployments.length === 0 ? <div className="border border-border bg-card p-5 text-sm text-muted-foreground">No deployments yet.</div> : deployments.map((deployment) => (
                <article key={deployment.id} className="border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">{deployment.projectName}</h3><p className="mt-1 font-mono text-[10px] text-muted-foreground">{deployment.branch} · {deployment.id}</p></div><span className="border border-border px-2 py-1 font-mono text-[10px] uppercase">{statusLabel(deployment.status)}</span></div>
                  <p className="mt-3 truncate text-xs text-muted-foreground">{deployment.repoUrl}</p>
                  {deployment.commitSha && <p className="mt-1 font-mono text-[10px] text-muted-foreground">commit {deployment.commitSha}</p>}
                  {deployment.customDomain && <p className="mt-1 font-mono text-[10px] text-violet-300">domain {deployment.customDomain}</p>}
                  <div className="mt-2 flex flex-wrap gap-3">
                    {deployment.url && <a href={deployment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-300 underline"><Globe2 className="h-3 w-3" /> Open deployment</a>}
                    {deployment.status === 'ready' && <button type="button" onClick={() => void rollback(deployment.id)} disabled={rollbackId === deployment.id} className="inline-flex items-center gap-1 text-xs text-muted-foreground underline disabled:opacity-50"><RotateCcw className="h-3 w-3" /> {rollbackId === deployment.id ? 'Rolling back…' : 'Rollback'}</button>}
                  </div>
                  {deployment.error && <p className="mt-2 text-xs text-red-300">{deployment.error}</p>}
                  <pre className="mt-3 max-h-40 overflow-auto bg-background p-3 text-[10px] leading-5 text-muted-foreground">{(deployment.logs || []).join('\n')}</pre>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="border border-violet-400/30 bg-violet-500/5 p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet-300" /><h2 className="text-sm font-semibold">Hosting boundary</h2></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Hosting UI không chứa deploy secret. Authentication dùng session; deployment queue dùng PostgreSQL; runtime publication do worker thực hiện. Environment variables được mã hóa trước khi lưu.</p><Link href="/api-keys" className="mt-3 inline-flex items-center gap-2 text-xs text-violet-300 underline"><KeyRound className="h-3.5 w-3.5" /> Manage credentials</Link></div>
            <div className="border border-border bg-card p-4"><h2 className="text-sm font-semibold">Velclaw projects</h2><div className="mt-3 space-y-2">{exampleProjects.map((project) => <button key={project.name} type="button" onClick={() => useProject(project)} className="block w-full border border-border p-3 text-left hover:border-violet-400/60"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium">{project.name}</span><Github className="h-3.5 w-3.5 text-muted-foreground" /></div><p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">{project.repo}</p><p className="mt-1 font-mono text-[9px] text-violet-300">{project.host}</p></button>)}</div></div>
            <div className="border border-border bg-card p-4 text-xs leading-5 text-muted-foreground"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Runtime</p><p className="mt-2">GitHub → queue → build worker → Docker → reverse proxy → public Velclaw hostname.</p></div>
          </aside>
        </section>
      </div>
    </main>
  )
}
