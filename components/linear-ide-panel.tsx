'use client'

import { useEffect, useMemo, useState } from 'react'
import { CircleDot, ExternalLink, GitBranch, Link2, Loader2, Plus, Rocket, RefreshCw, Unplug } from 'lucide-react'

type Team = { id: string; name: string; key: string }
type Issue = {
  id: string
  identifier: string
  title: string
  description: string | null
  priority: number
  url: string
  state: { name: string }
  team: Team
}

type Props = { defaultRepoUrl?: string }

export function LinearIdePanel({ defaultRepoUrl = 'https://github.com/Velclaw/VELCLAW' }: Props) {
  const [connected, setConnected] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [teamId, setTeamId] = useState('')
  const [repoUrl, setRepoUrl] = useState(defaultRepoUrl)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const selectedTeam = useMemo(() => teams.find((team) => team.id === teamId), [teams, teamId])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(teamId ? `/api/linear?teamId=${encodeURIComponent(teamId)}` : '/api/linear', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load Linear')
      setConnected(Boolean(data.connected))
      setTeams(data.teams || [])
      setIssues(data.issues || [])
      if (!teamId && data.teams?.[0]?.id) setTeamId(data.teams[0].id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load Linear')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // The team selector has its own reload effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (teamId) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  async function createIssue() {
    if (!title.trim() || !teamId) return
    setWorking('create')
    setError('')
    try {
      const response = await fetch('/api/linear', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ teamId, title, description: `Build target: ${repoUrl}` }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to create issue')
      setTitle('')
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create issue')
    } finally {
      setWorking(null)
    }
  }

  async function buildIssue(issue: Issue) {
    setWorking(issue.id)
    setError('')
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: `Implement Linear issue ${issue.identifier}: ${issue.title}\n\n${issue.description || ''}`,
          title: issue.title,
          repoUrl,
          selectedAgent: 'codex',
          installDependencies: true,
          enableBrowser: true,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Build could not be started')
      window.location.href = `/tasks/${data.task.id}`
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Build could not be started')
      setWorking(null)
    }
  }

  if (!connected && !loading) {
    return (
      <aside className="w-full shrink-0 border-t border-white/10 bg-[#0b0d11] p-5 lg:w-[360px] lg:border-l lg:border-t-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black"><CircleDot size={19} /></div>
          <div><div className="text-sm font-semibold">Linear Build</div><div className="text-xs text-white/40">Issue → IDE → Build</div></div>
        </div>
        <p className="mt-5 text-sm leading-6 text-white/55">Connect Linear to turn project issues into executable Velclaw build tasks without leaving the IDE.</p>
        <a href="/api/linear/auth" className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90"><Link2 size={16} /> Connect Linear</a>
        {error && <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200">{error}</div>}
      </aside>
    )
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-white/10 bg-[#0b0d11] lg:w-[390px] lg:border-l lg:border-t-0">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black"><CircleDot size={17} /></div><div><div className="text-sm font-semibold">Linear Build</div><div className="text-[11px] text-emerald-300/80">CONNECTED</div></div></div>
          <button onClick={() => void load()} className="rounded-lg p-2 text-white/45 hover:bg-white/5 hover:text-white" title="Refresh"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button>
        </div>
        <div className="mt-4 grid gap-2">
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white outline-none">
            {teams.map((team) => <option key={team.id} value={team.id}>{team.key} · {team.name}</option>)}
          </select>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3"><GitBranch size={14} className="text-white/35" /><input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-xs text-white outline-none" placeholder="GitHub repository URL" /></div>
        </div>
      </div>

      <div className="border-b border-white/10 p-4">
        <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/35">New issue</span><span className="text-[11px] text-white/25">{selectedTeam?.key || '—'}</span></div>
        <div className="flex gap-2"><input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void createIssue() }} className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white outline-none" placeholder="What should Velclaw build?" /><button disabled={!title.trim() || !teamId || working === 'create'} onClick={() => void createIssue()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black disabled:opacity-30"><Plus size={16} /></button></div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[.16em] text-white/30">Issues</div>
        <div className="space-y-2">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-xl border border-white/8 bg-white/[.025] p-3 transition hover:border-white/15">
              <div className="flex items-start justify-between gap-3"><div className="text-[10px] font-semibold text-white/35">{issue.identifier} · {issue.state.name}</div><a href={issue.url} target="_blank" rel="noreferrer" className="text-white/25 hover:text-white"><ExternalLink size={13} /></a></div>
              <div className="mt-1 text-sm font-medium text-white/90">{issue.title}</div>
              {issue.description && <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/35">{issue.description}</div>}
              <button onClick={() => void buildIssue(issue)} disabled={working === issue.id} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white/[.07] text-xs font-semibold text-white hover:bg-white/[.12] disabled:opacity-50">{working === issue.id ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />} {working === issue.id ? 'Starting build…' : 'Build in Velclaw'}</button>
            </div>
          ))}
          {!issues.length && !loading && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/30">No issues in this team yet.</div>}
        </div>
      </div>

      {error && <div className="border-t border-red-400/15 bg-red-400/5 p-3 text-xs text-red-200">{error}</div>}
      <div className="border-t border-white/10 p-3"><a href="/api/linear/auth" className="flex h-9 items-center justify-center gap-2 rounded-lg text-xs text-white/35 hover:bg-white/5 hover:text-white"><Unplug size={14} /> Reconnect Linear</a></div>
    </aside>
  )
}
