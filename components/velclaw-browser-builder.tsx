'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { WebContainer, type FileSystemTree, type PreviewMessage } from '@webcontainer/api'
import { Bot, Github, Play, Rocket, Terminal, FileCode2, Sparkles } from 'lucide-react'

type ProjectFiles = Record<string, string>
type AgentRole = 'coder' | 'reviewer' | 'tester' | 'deployer'

type AgentChange = { path: string; content: string }

const starterFiles: ProjectFiles = {
  'package.json': JSON.stringify({
    name: 'velclaw-app',
    private: true,
    scripts: { dev: 'vite --host 0.0.0.0', build: 'vite build' },
    dependencies: { vite: 'latest', react: 'latest', 'react-dom': 'latest' },
  }, null, 2),
  'index.html': '<!doctype html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Velclaw App</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>',
  'src/main.jsx': "import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './style.css'\n\nfunction App(){return <main><h1>Built with Velclaw</h1><p>Your browser is the development environment.</p></main>}\ncreateRoot(document.getElementById('root')).render(<App />)",
  'src/style.css': ':root{font-family:Inter,system-ui,sans-serif;color:#f7f7f8;background:#09090b}body{margin:0;min-height:100vh;display:grid;place-items:center}main{text-align:center}h1{font-size:clamp(2rem,6vw,4rem);margin:0 0 .75rem}p{color:#a1a1aa}',
}

function toFileSystemTree(files: ProjectFiles): FileSystemTree {
  const tree: FileSystemTree = {}
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split('/').filter(Boolean)
    let cursor = tree
    for (const part of parts.slice(0, -1)) {
      const current = cursor[part]
      if (!current || !('directory' in current)) cursor[part] = { directory: {} }
      cursor = (cursor[part] as { directory: FileSystemTree }).directory
    }
    const filename = parts.at(-1)
    if (filename) cursor[filename] = { file: { contents } }
  }
  return tree
}

function previewMessageText(message: PreviewMessage) {
  if ('message' in message && typeof message.message === 'string') return message.message
  if ('args' in message && Array.isArray(message.args)) return message.args.map((item) => String(item)).join(' ')
  return message.type
}

function safeCommand(command: string) {
  const value = command.trim()
  if (!value || value.length > 500) return false
  return !/(^|[;&|])\s*(rm\s+-rf\s+\/|mkfs|dd\s+if=|shutdown|reboot)\b|curl\b.*\|\s*(sh|bash)|wget\b.*\|\s*(sh|bash)/i.test(value)
}

export function VelclawBrowserBuilder() {
  const containerRef = useRef<WebContainer | null>(null)
  const processRef = useRef<{ kill(): void } | null>(null)
  const [files, setFiles] = useState<ProjectFiles>(starterFiles)
  const [activeFile, setActiveFile] = useState('src/main.jsx')
  const [role, setRole] = useState<AgentRole>('coder')
  const [prompt, setPrompt] = useState('')
  const [command, setCommand] = useState('npm run build')
  const [logs, setLogs] = useState<string[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState('Ready')
  const [agentOutput, setAgentOutput] = useState('')
  const [busy, setBusy] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [deployResult, setDeployResult] = useState('')
  const [tab, setTab] = useState<'files' | 'agent' | 'terminal' | 'deploy'>('files')

  const fileNames = useMemo(() => Object.keys(files).sort(), [files])

  useEffect(() => {
    const saved = window.localStorage.getItem('velclaw-builder-workspace')
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as ProjectFiles
      if (parsed && typeof parsed === 'object') setFiles(parsed)
    } catch {
      // Ignore invalid local workspace state.
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
    setLogs((current) => [...current.slice(-199), text])
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
    container.on('preview-message', (message) => appendLog(`[preview:${message.type}] ${previewMessageText(message)}\n`))
    await container.mount(toFileSystemTree(files))
    return container
  }

  async function runCommand() {
    if (!safeCommand(command)) {
      setStatus('Command blocked by browser safety policy')
      return
    }
    setBusy(true)
    setStatus(`Running: ${command}`)
    try {
      const container = await getContainer()
      const process = await container.spawn('jsh', ['-c', command])
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
    try {
      const container = await getContainer()
      setStatus('Installing dependencies…')
      const install = await container.spawn('npm', ['install'])
      install.output.pipeTo(new WritableStream({ write: (data) => appendLog(data) }))
      const exit = await install.exit
      if (exit !== 0) throw new Error(`npm install exited with ${exit}`)
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

  async function syncFile(path: string, content: string) {
    setFiles((current) => ({ ...current, [path]: content }))
    if (containerRef.current) await containerRef.current.fs.writeFile(`/${path}`, content)
    setStatus(`${path} saved`)
  }

  async function runAgent() {
    if (!prompt.trim()) return
    setBusy(true)
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
      const changes = Array.isArray(data.changes) ? data.changes as AgentChange[] : []
      if (changes.length) {
        const next = { ...files }
        for (const change of changes) next[change.path] = change.content
        setFiles(next)
        if (containerRef.current) {
          for (const change of changes) await containerRef.current.fs.writeFile(`/${change.path}`, change.content)
        }
      }
      setPrompt('')
      setStatus(changes.length ? `${changes.length} file(s) changed` : `${role} agent completed`)
    } catch (error) {
      setAgentOutput(error instanceof Error ? error.message : 'Agent failed')
      setStatus('Agent failed')
    } finally {
      setBusy(false)
    }
  }

  async function deploy() {
    if (!repoUrl.trim()) {
      setDeployResult('GitHub repository URL is required.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: 'velclaw-app', repoUrl, branch }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Deployment request failed')
      setDeployResult(JSON.stringify(data, null, 2))
      setStatus('Deployment queued')
    } catch (error) {
      setDeployResult(error instanceof Error ? error.message : 'Deployment failed')
      setStatus('Deployment failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100">
      <header className="flex min-h-14 items-center justify-between border-b border-white/10 bg-[#0c0e13] px-4">
        <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-violet-300" /><div><strong>Velclaw Builder</strong><div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Browser-native workspace</div></div></div>
        <div className="flex items-center gap-3"><span className="hidden max-w-[40vw] truncate text-xs text-zinc-500 md:block">{status}</span><button disabled={busy} onClick={startPreview} className="flex items-center gap-2 bg-violet-500 px-3 py-1.5 text-xs font-semibold hover:bg-violet-400 disabled:opacity-50"><Play className="h-3.5 w-3.5" /> Preview</button></div>
      </header>

      <div className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-[220px_minmax(0,1fr)_minmax(320px,42vw)]">
        <aside className="hidden border-r border-white/10 bg-[#0a0c10] p-3 lg:block">
          <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Workspace</div>
          {fileNames.map((path) => <button key={path} onClick={() => { setActiveFile(path); setTab('files') }} className={`mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs ${activeFile === path ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><FileCode2 className="h-3.5 w-3.5" />{path}</button>)}
        </aside>

        <section className="min-w-0 border-r border-white/10 bg-[#080a0e]">
          <div className="flex gap-1 border-b border-white/10 p-2">{(['files', 'agent', 'terminal', 'deploy'] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`px-3 py-1.5 text-xs ${tab === item ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>{item}</button>)}</div>
          {tab === 'files' && <div className="h-[calc(100vh-6.5rem)] p-4"><div className="mb-2 text-xs text-zinc-500">{activeFile}</div><textarea value={files[activeFile] || ''} onChange={(event) => setFiles((current) => ({ ...current, [activeFile]: event.target.value }))} onBlur={() => void syncFile(activeFile, files[activeFile] || '')} spellCheck={false} className="h-full w-full resize-none border border-white/10 bg-[#050609] p-4 font-mono text-xs leading-5 text-zinc-200 outline-none focus:border-violet-500" /></div>}
          {tab === 'agent' && <div className="space-y-4 p-4"><div className="flex items-center gap-2"><Bot className="h-4 w-4 text-violet-300" /><strong className="text-sm">Velclaw Agent</strong></div><select value={role} onChange={(event) => setRole(event.target.value as AgentRole)} className="w-full border border-white/10 bg-[#050609] p-2 text-xs"><option value="coder">Coder</option><option value="reviewer">Reviewer</option><option value="tester">Tester</option><option value="deployer">Deployer</option></select><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the change…" className="h-32 w-full border border-white/10 bg-[#050609] p-3 text-xs outline-none"/><button disabled={busy || !prompt.trim()} onClick={runAgent} className="bg-violet-500 px-4 py-2 text-xs font-semibold disabled:opacity-50">Run agent</button>{agentOutput && <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap border border-white/10 bg-black/30 p-3 text-xs text-zinc-300">{agentOutput}</pre>}</div>}
          {tab === 'terminal' && <div className="space-y-3 p-4"><div className="flex gap-2"><Terminal className="mt-2 h-4 w-4 text-zinc-500"/><input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void runCommand() }} className="flex-1 border border-white/10 bg-[#050609] p-2 font-mono text-xs"/><button onClick={() => void runCommand()} disabled={busy} className="bg-violet-500 px-3 text-xs">Run</button></div><pre className="h-[65vh] overflow-auto whitespace-pre-wrap bg-black p-3 font-mono text-xs text-zinc-300">{logs.join('')}</pre></div>}
          {tab === 'deploy' && <div className="space-y-4 p-4"><div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-violet-300"/><strong className="text-sm">Velclaw Hosting</strong></div><input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/org/repo" className="w-full border border-white/10 bg-[#050609] p-2 text-xs"/><input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="main" className="w-full border border-white/10 bg-[#050609] p-2 text-xs"/><button disabled={busy} onClick={() => void deploy()} className="flex items-center gap-2 bg-violet-500 px-4 py-2 text-xs font-semibold"><Rocket className="h-3.5 w-3.5"/> Deploy</button><pre className="max-h-[45vh] overflow-auto whitespace-pre-wrap border border-white/10 p-3 text-xs text-zinc-300">{deployResult}</pre></div>}
        </section>

        <aside className="min-h-[360px] bg-black/20 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500"><span>Live Preview</span>{previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer" className="text-violet-300">Open</a>}</div>
          <div className="h-[calc(100vh-6.5rem)] min-h-[340px] overflow-hidden border border-white/10 bg-white">{previewUrl ? <iframe title="Velclaw preview" src={previewUrl} className="h-full w-full border-0" /> : <div className="grid h-full place-items-center bg-[#101116] text-center text-xs text-zinc-500"><div><Github className="mx-auto mb-2 h-6 w-6"/><p>Run Preview to start the browser runtime.</p></div></div>}</div>
        </aside>
      </div>
    </main>
  )
}
