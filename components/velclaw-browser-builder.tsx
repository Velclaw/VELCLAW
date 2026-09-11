'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { WebContainer, type FileSystemTree } from '@webcontainer/api'
import { Code2, FolderTree, Github, LoaderCircle, Play, Rocket, Sparkles, Terminal, Wand2 } from 'lucide-react'

const starterFiles = {
  'package.json': `{
  "name": "velclaw-app",
  "private": true,
  "scripts": { "dev": "vite --host 0.0.0.0" },
  "dependencies": { "vite": "latest", "react": "latest", "react-dom": "latest" }
}`,
  'index.html': `<!doctype html>\n<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Velclaw App</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
  'src/main.jsx': `import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './style.css'\n\nfunction App() {\n  return <main><h1>Built with Velclaw</h1><p>Your browser is the development environment.</p></main>\n}\n\ncreateRoot(document.getElementById('root')).render(<App />)`,
  'src/style.css': `:root{font-family:Inter,system-ui,sans-serif;color:#f7f7f8;background:#09090b}body{margin:0;min-height:100vh;display:grid;place-items:center}main{text-align:center}h1{font-size:clamp(2rem,6vw,4rem);margin:0 0 .75rem}p{color:#a1a1aa}`,
} as const

type FileName = keyof typeof starterFiles
type ProjectFiles = Record<FileName, string>

function toFileSystemTree(files: ProjectFiles): FileSystemTree {
  const tree: FileSystemTree = {}
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split('/')
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

export function VelclawBrowserBuilder() {
  const webcontainerRef = useRef<WebContainer | null>(null)
  const [activeFile, setActiveFile] = useState<FileName>('src/main.jsx')
  const [files, setFiles] = useState<ProjectFiles>(starterFiles)
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('Browser runtime idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const fileNames = useMemo(() => Object.keys(files) as FileName[], [files])

  useEffect(() => () => {
    webcontainerRef.current?.teardown()
    webcontainerRef.current = null
  }, [])

  async function startRuntime() {
    if (running) return
    setRunning(true)
    setMessage('Booting browser runtime…')
    setLogs([])

    try {
      const container = webcontainerRef.current ?? (await WebContainer.boot())
      webcontainerRef.current = container
      await container.mount(toFileSystemTree(files))

      const install = await container.spawn('npm', ['install'])
      install.output.pipeTo(new WritableStream({ write: (data) => setLogs((current) => [...current.slice(-80), data]) }))
      const installExit = await install.exit
      if (installExit !== 0) throw new Error(`npm install exited with ${installExit}`)

      const dev = await container.spawn('npm', ['run', 'dev'])
      dev.output.pipeTo(new WritableStream({ write: (data) => setLogs((current) => [...current.slice(-80), data]) }))
      container.on('server-ready', (_port, url) => {
        setPreviewUrl(url)
        setMessage('Preview running in browser')
      })
      setMessage('Starting preview…')
      void dev.exit.then(() => setMessage('Preview process exited'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Browser runtime failed to start')
      setRunning(false)
    }
  }

  async function saveActiveFile(value: string) {
    setFiles((current) => ({ ...current, [activeFile]: value }))
    const container = webcontainerRef.current
    if (container) {
      await container.fs.writeFile(`/${activeFile}`, value)
      setMessage(`${activeFile} synced to browser runtime`)
    } else {
      setMessage('Unsaved browser workspace change')
    }
  }

  function applyPrompt() {
    const text = prompt.trim()
    if (!text) return
    const next = `${files[activeFile]}\n\n// Velclaw agent request: ${text.replaceAll('\n', ' ')}`
    void saveActiveFile(next)
    setPrompt('')
  }

  return (
    <main className="min-h-screen bg-[#08090c] text-zinc-100">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#0d0f13] px-3 md:px-5">
        <div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center border border-violet-400/40 bg-violet-500/10"><Sparkles className="h-4 w-4 text-violet-300" /></div><div><div className="text-sm font-semibold tracking-wide">VELCLAW</div><div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Browser Builder</div></div></div>
        <div className="flex items-center gap-2"><button className="hidden items-center gap-2 border border-white/10 px-3 py-1.5 text-xs text-zinc-300 md:flex"><Github className="h-3.5 w-3.5" /> GitHub</button><button onClick={startRuntime} disabled={running} className="flex items-center gap-2 bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60">{running ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />} Run</button></div>
      </header>

      <section className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-[220px_minmax(0,1fr)_minmax(320px,42vw)]">
        <aside className="hidden border-r border-white/10 bg-[#0b0d11] lg:block"><div className="flex h-11 items-center gap-2 border-b border-white/10 px-4 text-xs font-semibold"><FolderTree className="h-4 w-4 text-zinc-400" /> Files</div><div className="p-2">{fileNames.map((name) => <button key={name} onClick={() => setActiveFile(name)} className={`mb-0.5 flex w-full items-center gap-2 px-3 py-2 text-left text-xs ${name === activeFile ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><Code2 className="h-3.5 w-3.5" /> {name}</button>)}</div></aside>

        <section className="flex min-h-0 flex-col border-r border-white/10 bg-[#101217]">
          <div className="flex h-11 items-center justify-between border-b border-white/10 px-3"><div className="flex items-center gap-2 text-xs text-zinc-300"><Code2 className="h-4 w-4" /> {activeFile}</div><button onClick={startRuntime} disabled={running} className="flex items-center gap-2 border border-white/10 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5"><Play className="h-3 w-3" /> Run</button></div>
          <textarea value={files[activeFile]} onChange={(event) => void saveActiveFile(event.target.value)} spellCheck={false} className="min-h-[50vh] flex-1 resize-none bg-[#0a0c10] p-4 font-mono text-[12px] leading-6 text-zinc-200 outline-none" aria-label={`Editor for ${activeFile}`} />
          <div className="border-t border-white/10 bg-[#0c0e12] p-3"><div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500"><Wand2 className="h-3 w-3" /> Agent</div><div className="flex gap-2"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyPrompt() }} placeholder="Ask Velclaw to change the code…" className="min-w-0 flex-1 border border-white/10 bg-[#08090c] px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600" /><button onClick={applyPrompt} className="border border-violet-400/40 bg-violet-500/10 px-3 text-xs text-violet-200 hover:bg-violet-500/20">Apply</button></div></div>
        </section>

        <section className="flex min-h-0 flex-col bg-[#090a0d]"><div className="flex h-11 items-center justify-between border-b border-white/10 px-3"><div className="flex items-center gap-2 text-xs text-zinc-300"><Terminal className="h-4 w-4" /> Preview</div><span className="max-w-[55%] truncate text-[10px] text-zinc-500">{message}</span></div><div className="m-3 flex min-h-[55vh] flex-1 overflow-hidden border border-white/10 bg-white shadow-2xl">{previewUrl ? <iframe title="Velclaw live preview" src={previewUrl} className="h-full min-h-[55vh] w-full border-0" allow="clipboard-read; clipboard-write" /> : <div className="m-auto max-w-md px-8 text-center text-zinc-950"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-zinc-950 text-white"><Sparkles className="h-5 w-5" /></div><h1 className="text-2xl font-semibold">Velclaw Preview</h1><p className="mt-2 text-sm text-zinc-500">Run the project to boot Node.js, npm and the development server directly inside this browser tab.</p></div>}</div><div className="max-h-32 overflow-auto border-t border-white/10 bg-[#050608] px-3 py-2 font-mono text-[10px] text-zinc-500">{logs.length ? logs.join('') : 'Terminal output will appear here.'}</div></section>
      </section>
    </main>
  )
}
