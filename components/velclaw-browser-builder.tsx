'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { WebContainer, type FileSystemTree } from '@webcontainer/api'
import {
  Bot,
  CheckCircle2,
  Code2,
  FileCode2,
  FolderTree,
  Github,
  GitPullRequest,
  LoaderCircle,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube2,
  Wand2,
  XCircle,
} from 'lucide-react'

type ProjectFiles = Record<string, string>
type AgentRole = 'coder' | 'reviewer' | 'tester' | 'deployer'
type Tab = 'agents' | 'terminal' | 'git' | 'changes' | 'logs' | 'deploy'

type StarterFile = { path: string; content: string }

const starterFiles: ProjectFiles = {
  'package.json': `{
  "name": "velclaw-app",
  "private": true,
  "scripts": { "dev": "vite --host 0.0.0.0", "build": "vite build" },
  "dependencies": { "vite": "latest", "react": "latest", "react-dom": "latest" }
}`,
  'index.html': `<!doctype html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Velclaw App</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
  'src/main.jsx': `import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './style.css'\n\nfunction App() {\n  return <main><h1>Built with Velclaw</h1><p>Your browser is the development environment.</p></main>\n}\n\ncreateRoot(document.getElementById('root')).render(<App />)`,
  'src/style.css': `:root{font-family:Inter,system-ui,sans-serif;color:#f7f7f8;background:#09090b}body{margin:0;min-height:100vh;display:grid;place-items:center}main{text-align:center}h1{font-size:clamp(2rem,6vw,4rem);margin:0 0 .75rem}p{color:#a1a1aa}`,
}

function toFileSystemTree(files: ProjectFiles): FileSystemTree {
  const tree: FileSystemTree = {}
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split('/').filter(Boolean)
    let cursor = tree
    for (const part of parts.slice(0, -1)) {
      const existing = cursor[part]
      if (!existing || !('directory' in existing)) cursor[part] = { directory: {} }
      cursor = (cursor[part] as { directory: FileSystemTree }).directory
    }
    cursor[parts.at(-1)!] = { file: { contents } }
  }
  return tree
}

function flattenTree(value: unknown, prefix = ''): ProjectFiles {
  const result: ProjectFiles = {}
  if (!value || typeof value !== 'object') return result
  for (const [name, node] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}/${name}` : name
    if (node && typeof node === 'object' && 'file' in node) {
      const file = (node as { file?: { contents?: unknown } }).file
      if (typeof file?.contents === 'string') result[path] = file.contents
    } else if (node && typeof node === 'object' && 'directory' in node) {
      Object.assign(result, flattenTree((node as { directory?: unknown }).directory, path))
    }
  }
  return result
}

function safeCommand(command: string) {
  const trimmed = command.trim()
  if (!trimmed || trimmed.length > 500) return false
  return !/(^|[;&|])\s*(rm\s+-rf\s+\/|mkfs|dd\s+if=|shutdown|reboot)\b|curl\b.*\|\s*(sh|bash)|wget\b.*\|\s*(sh|bash)/i.test(trimmed)
}

export function VelclawBrowserBuilder() {
  const containerRef = useRef<WebContainer | null>(null)
  const processRef = useRef<{ kill(): void } | null>(null)
  const [files, setFiles] = useState<ProjectFiles>(starterFiles)
  const [activeFile, setActiveFile] = useState('src/main.jsx')
  const [tab, setTab] = useState<Tab>('agents')
  const [role, setRole] = useState<AgentRole>('coder')
  const [prompt, setPrompt] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [projectName, setProjectName] = useState('velclaw-app')
  const [baseBranch, setBaseBranch] = useState('main')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState('Ready')
  const [logs, setLogs] = useState<string[]>([])
  const [agentOutput, setAgentOutput] = useState('')
  const [changedFiles, setChangedFiles] = useState<string[]>([])
  const [command, setCommand] = useState('npm run build')
  const [busy, setBusy] = useState(false)
  const [gitResult, setGitResult] = useState('')
  const [deployResult, setDeployResult] = useState('')

  const fileNames = useMemo(() => Object.keys(files).sort(), [files])
  const componentFiles = useMemo(() => fileNames.filter((path) => /\.(tsx?|jsx?)$/.test(path)), [fileNames])
  const pageFiles = useMemo(() => fileNames.filter((path) => /(^|\/)(page|route)\.(tsx?|jsx?)$/.test(path)), [fileNames])
  const assetFiles = useMemo(() => fileNames.filter((path) => /\.(png|jpe?g|gif|svg|webp|ico|woff2?)$/i.test(path)), [fileNames])

  useEffect(() => {
    const saved = window.localStorage.getItem('velclaw-builder-workspace')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ProjectFiles
        if (parsed && typeof parsed === 'object') setFiles(parsed)
      } catch {}
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('velclaw-builder-workspace', JSON.stringify(files))
    if (!files[activeFile]) setActiveFile(Object.keys(files)[0] || 'package.json')
  }, [files, activeFile])

  useEffect(() => () => {
    processRef.current?.kill()
    containerRef.current?.teardown()
    containerRef.current = null
  }, [])

  function appendLog(text: string) {
    setLogs((current) => [...current.slice(-200), text])
  }

  async function getContainer() {
    if (containerRef.current) return containerRef.current
    setStatus('Starting browser runtime…')
    const container = await WebContainer.boot({ forwardPreviewErrors: true })
    containerRef.current = container
    container.on('server-ready', (_port, url) => {
      setPreviewUrl(url)
      setStatus('Preview ready')
    })
    container.on('preview-message', (message) => appendLog(`[preview:${message.type}] ${message.message}\n`))
    await container.mount(toFileSystemTree(files))
    return container
  }

  async function runCommand(raw = command) {
    if (!safeCommand(raw)) {
      setStatus('Command blocked by browser safety policy')
      appendLog('Blocked unsafe terminal command.\n')
      return
    }
    setBusy(true)
    setStatus(`Running: ${raw}`)
    try {
      const container = await getContainer()
      const process = await container.spawn('jsh', ['-c', raw])
      processRef.current = process
      process.output.pipeTo(new WritableStream({ write: (data) => appendLog(data) }))
      const exit = await process.exit
      setStatus(exit === 0 ? `Command completed (${exit})` : `Command failed (${exit})`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Terminal failed')
    } finally {
      processRef.current = null
      setBusy(false)
    }
  }

  async function startPreview() {
    setBusy(true)
    setStatus('Installing dependencies…')
    try {
      const container = await getContainer()
      const install = await container.spawn('npm', ['install'])
      install.output.pipeTo(new WritableStream({ write: (data) => appendLog(data) }))
      const installExit = await install.exit
      if (installExit !== 0) throw new Error(`npm install exited with ${installExit}`)
      processRef.current?.kill()
      const dev = await container.spawn('npm', ['run', 'dev'])
      processRef.current = dev
      dev.output.pipeTo(new WritableStream({ write: (data) => appendLog(data) }))
      setStatus('Starting live preview…')
      void dev.exit.then(() => setStatus('Preview process exited'))
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Preview failed')
    } finally {
      setBusy(false)
    }
  }

  async function updateFile(path: string, content: string) {
    setFiles((current) => ({ ...current, [path]: content }))
    const container = containerRef.current
    if (container) {
      await container.fs.writeFile(`/${path}`, content)
      setStatus(`${path} synced to browser runtime`)
    } else setStatus('Workspace saved locally')
  }

  async function runAgent() {
    if (!prompt.trim()) return
    setBusy(true)
    setTab('agents')
    setStatus(`Velclaw ${role} agent working…`)
    try {
      const response = await fetch('/api/builder/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, prompt, files: Object.entries(files).map(([path, content]) => ({ path, content })) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Agent failed')
      setAgentOutput(data.output || '')
      if (Array.isArray(data.changes) && data.changes.length) {
        const next = { ...files }
        for (const change of data.changes as StarterFile[]) {
          next[change.path] = change.content
          setChangedFiles((current) => Array.from(new Set([...current, change.path])))
        }
        setFiles(next)
        const container = containerRef.current
        if (container) {
          for (const change of data.changes as StarterFile[]) await container.fs.writeFile(`/${change.path}`, change.content)
        }
        setStatus(`${data.changes.length} file(s) changed by Velclaw ${role}`)
      } else setStatus(`${role} agent completed`)
      setPrompt('')
    } catch (error) {
      setAgentOutput(error instanceof Error ? error.message : 'Agent failed')
      setStatus('Agent failed')
    } finally {
      setBusy(false)
    }
  }

  async function importGitHub() {
    if (!repoUrl.trim()) return
    setBusy(true)
    setStatus('Importing GitHub repository…')
    try {
      const response = await fetch('/api/builder/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'GitHub import failed')
      const imported = Object.fromEntries((data.files as StarterFile[]).map((file) => [file.path, file.content])) as ProjectFiles
      setFiles(imported)
      setActiveFile(Object.keys(imported).find((path) => path === 'package.json') || Object.keys(imported)[0] || 'package.json')
      setStatus(`Imported ${data.files.length} files from ${data.repo}`)
      setGitResult(`Imported commit ${data.commitSha.slice(0, 8)}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'GitHub import failed')
    } finally {
      setBusy(false)
    }
  }

  async function publishGitHub() {
    if (!repoUrl.trim()) return
    setBusy(true)
    setStatus('Publishing GitHub branch…')
    try {
      const safeProject = projectName.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'velclaw-app'
      const branchName = `velclaw/${safeProject}-${Date.now().toString(36)}`
      const response = await fetch('/api/builder/github/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, baseBranch, branchName, title: `Velclaw Builder: ${projectName}`, files: Object.entries(files).map(([path, content]) => ({ path, content })) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'GitHub publish failed')
      setGitResult(`PR #${data.prNumber}: ${data.prUrl}`)
      setStatus('GitHub branch + commit + PR created')
    } catch (error) {
      setGitResult(error instanceof Error ? error.message : 'GitHub publish failed')
      setStatus('GitHub publish failed')
    } finally {
      setBusy(false)
    }
  }

  async function deployVelclaw() {
    if (!repoUrl.trim()) {
      setDeployResult('Publish to GitHub first, then deploy from the repository.')
      return
    }
    setBusy(true)
    setStatus('Queueing Velclaw Hosting deployment…')
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, repoUrl, branch: baseBranch }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Deployment queue failed')
      setDeployResult(JSON.stringify(data.deployment, null, 2))
      setStatus('Deployment queued in Velclaw Hosting')
    } catch (error) {
      setDeployResult(error instanceof Error ? error.message : 'Deployment failed')
      setStatus('Deployment request failed')
    } finally {
      setBusy(false)
    }
  }

  const nav = [
    ['agents', 'Agents', Bot],
    ['terminal', 'Terminal', Terminal],
    ['git', 'Git', Github],
    ['changes', 'Changes', GitPullRequest],
    ['logs', 'Logs', FileCode2],
    ['deploy', 'Deploy', Rocket],
  ] as const

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-[#0c0e13] px-3 md:px-5">
        <div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center border border-violet-400/40 bg-violet-500/10"><Sparkles className="h-4 w-4 text-violet-300" /></div><div><div className="text-sm font-semibold tracking-wide">VELCLAW BUILDER</div><div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Browser-native software workspace</div></div></div>
        <div className="flex items-center gap-2"><span className="hidden max-w-[34vw] truncate text-[10px] text-zinc-500 md:block">{status}</span><button onClick={startPreview} disabled={busy} className="flex items-center gap-2 bg-violet-500 px-3 py-1.5 text-xs font-semibold hover:bg-violet-400 disabled:opacity-50"><Play className="h-3.5 w-3.5" /> Preview</button></div>
      </header>

      <section className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-[220px_minmax(0,1fr)_minmax(340px,44vw)]">
        <aside className="hidden border-r border-white/10 bg-[#0a0c10] lg:block">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold"><div className="flex items-center gap-2"><FolderTree className="h-4 w-4 text-zinc-400" /> PROJECT</div><div className="mt-3 grid grid-cols-3 gap-1 text-[9px] text-zinc-500"><span>Components {componentFiles.length}</span><span>Pages {pageFiles.length}</span><span>Assets {assetFiles.length}</span></div></div>
          <div className="max-h-[calc(100vh-8rem)] overflow-auto p-2">{fileNames.map((name) => <button key={name} onClick={() => setActiveFile(name)} className={`mb-0.5 flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] ${name === activeFile ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><Code2 className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{name}</span></button>)}</div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col border-r border-white/10 bg-[#101217]">
          <div className="flex h-11 items-center justify-between border-b border-white/10 px-3"><div className="flex min-w-0 items-center gap-2 text-xs text-zinc-300"><Code2 className="h-4 w-4 shrink-0" /><span className="truncate">{activeFile}</span></div><span className="text-[9px] text-emerald-400">browser workspace</span></div>
          <textarea value={files[activeFile] || ''} onChange={(event) => void updateFile(activeFile, event.target.value)} spellCheck={false} className="min-h-[50vh] flex-1 resize-none bg-[#090b0f] p-4 font-mono text-[12px] leading-6 text-zinc-200 outline-none" aria-label={`Editor for ${activeFile}`} />
          <div className="border-t border-white/10 bg-[#0b0d11] p-2">
            <div className="mb-2 flex gap-1 overflow-x-auto">{nav.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-[10px] ${tab === id ? 'bg-violet-500/15 text-violet-200' : 'text-zinc-500 hover:bg-white/5'}`}><Icon className="h-3 w-3" /> {label}</button>)}</div>
            {tab === 'agents' && <div><div className="mb-2 flex gap-1">{(['coder', 'reviewer', 'tester', 'deployer'] as AgentRole[]).map((item) => <button key={item} onClick={() => setRole(item)} className={`px-2 py-1 text-[10px] capitalize ${role === item ? 'bg-violet-500/20 text-violet-200' : 'bg-white/5 text-zinc-500'}`}>{item}</button>)}</div><div className="flex gap-2"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void runAgent() }} placeholder={`Ask Velclaw ${role}…`} className="min-w-0 flex-1 border border-white/10 bg-[#07080b] px-3 py-2 text-xs outline-none placeholder:text-zinc-600" /><button onClick={() => void runAgent()} disabled={busy} className="border border-violet-400/30 bg-violet-500/10 px-3 text-xs text-violet-200 disabled:opacity-50"><Wand2 className="inline h-3 w-3" /> Run</button></div>{agentOutput && <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap text-[10px] leading-5 text-zinc-400">{agentOutput}</pre>}</div>}
            {tab === 'terminal' && <div className="flex gap-2"><input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void runCommand() }} className="min-w-0 flex-1 border border-white/10 bg-[#07080b] px-3 py-2 font-mono text-xs outline-none" /><button onClick={() => void runCommand()} disabled={busy} className="border border-white/10 px-3 text-xs">Run</button></div>}
            {tab === 'git' && <div className="grid gap-2 md:grid-cols-2"><input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repo" className="border border-white/10 bg-[#07080b] px-3 py-2 text-xs outline-none" /><input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="import branch" className="border border-white/10 bg-[#07080b] px-3 py-2 text-xs outline-none" /><button onClick={() => void importGitHub()} disabled={busy} className="border border-white/10 px-3 py-2 text-xs">Import GitHub</button><input value={baseBranch} onChange={(event) => setBaseBranch(event.target.value)} placeholder="base branch" className="border border-white/10 bg-[#07080b] px-3 py-2 text-xs outline-none" /><input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="project name" className="border border-white/10 bg-[#07080b] px-3 py-2 text-xs outline-none" /><button onClick={() => void publishGitHub()} disabled={busy} className="flex items-center justify-center gap-2 border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200"><GitPullRequest className="h-3 w-3" /> Commit + PR</button>{gitResult && <pre className="md:col-span-2 whitespace-pre-wrap text-[10px] text-zinc-500">{gitResult}</pre>}</div>}
            {tab === 'changes' && <div className="max-h-32 overflow-auto text-[10px] text-zinc-400">{changedFiles.length ? changedFiles.map((path) => <div key={path} className="flex items-center gap-2 py-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> {path}</div>) : 'No agent changes yet.'}</div>}
            {tab === 'logs' && <pre className="max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-zinc-500">{logs.join('') || 'Terminal and preview logs appear here.'}</pre>}
            {tab === 'deploy' && <div className="grid gap-2 md:grid-cols-2"><div className="flex items-center gap-2 text-[10px] text-zinc-500"><ShieldCheck className="h-3 w-3 text-emerald-400" /> Browser runtime isolated from phone OS</div><button onClick={() => void deployVelclaw()} disabled={busy} className="flex items-center justify-center gap-2 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-200"><Rocket className="h-3 w-3" /> Publish to Velclaw Hosting</button>{deployResult && <pre className="md:col-span-2 max-h-32 overflow-auto whitespace-pre-wrap text-[10px] text-zinc-500">{deployResult}</pre>}</div>}
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-[#090a0d]"><div className="flex h-11 items-center justify-between border-b border-white/10 px-3"><div className="flex items-center gap-2 text-xs text-zinc-300"><Terminal className="h-4 w-4" /> LIVE PREVIEW</div><span className="text-[10px] text-zinc-500">{status}</span></div><div className="m-3 flex min-h-[55vh] flex-1 overflow-hidden border border-white/10 bg-white shadow-2xl">{previewUrl ? <iframe title="Velclaw live preview" src={previewUrl} className="h-full min-h-[55vh] w-full border-0" allow="clipboard-read; clipboard-write" /> : <div className="m-auto max-w-md px-8 text-center text-zinc-950"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-zinc-950 text-white"><Sparkles className="h-5 w-5" /></div><h1 className="text-2xl font-semibold">Velclaw Builder</h1><p className="mt-2 text-sm text-zinc-500">Node.js, npm, terminal and the live application run inside the browser. Your phone is the client, not the build server.</p><div className="mt-5 flex items-center justify-center gap-3 text-[10px] text-zinc-500"><Bot /> Agents <Github /> GitHub <TestTube2 /> Test <Rocket /> Deploy</div></div>}</div><div className="border-t border-white/10 bg-[#050608] px-3 py-2 text-[10px] text-zinc-600"><span className="text-emerald-400">●</span> WebContainer runtime · Velclaw Agents · GitHub · Velclaw Hosting</div></section>
      </section>
    </main>
  )
}
