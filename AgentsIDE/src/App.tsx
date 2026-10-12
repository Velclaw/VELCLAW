import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Bot,
  Check,
  ChevronDown,
  Code2,
  FileCode2,
  Folder,
  GitBranch,
  GitPullRequest,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  TerminalSquare,
  TestTube2,
  Rocket,
  ExternalLink,
  ShieldCheck,
  LockKeyhole,
  AlertTriangle,
  CircleCheck,
  Ban,
  GitCommitHorizontal,
} from 'lucide-react'
import { CodeEditor } from './components/CodeEditor'
import { FileExplorer } from './components/FileExplorer'
import { executeTask } from './features/agent/taskExecutor'
import type { AgentTask } from './features/agent/types'
import { ReviewPanel } from './features/review/ReviewPanel'
import { AUTOSHIP_URL, ensureAgentsIDEProject, getAutoshipProjects, getAutoshipRun } from './features/deploy/autoship'
import type { AutoshipRun } from './features/deploy/autoship'

type View = 'workspace' | 'code' | 'agent' | 'review' | 'tools'
const files = [
  { name: 'App.tsx', path: 'src/App.tsx' },
  { name: 'index.css', path: 'src/index.css' },
  { name: 'main.tsx', path: 'src/main.tsx' },
  { name: 'package.json', path: 'package.json' },
]
const viewTitles: Record<View, string> = {
  workspace: 'Workspace',
  code: 'Code',
  agent: 'Agent',
  review: 'Review',
  tools: 'Tools',
}

function App() {
  const [view, setView] = useState<View>('workspace')
  const [prompt, setPrompt] = useState('')
  const [activeFile, setActiveFile] = useState('App.tsx')
  const [task, setTask] = useState<AgentTask | null>(null)
  const [busy, setBusy] = useState(false)
  const [deployBusy, setDeployBusy] = useState(false)
  const [deployMessage, setDeployMessage] = useState('')
  const [autoshipOnline, setAutoshipOnline] = useState(false)
  const [autoshipRuns, setAutoshipRuns] = useState(0)
  const [latestRun, setLatestRun] = useState<AutoshipRun | null>(null)

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const projects = await getAutoshipProjects()
        if (cancelled) return
        setAutoshipOnline(true)
        const project = projects.find(
          (item) => item.repoUrl.replace(/\/$/, '') === 'https://github.com/zskbot/AgentsIDE',
        )
        if (!project) return
        if (project.totalBuilds) setAutoshipRuns(project.totalBuilds)
        const response = await fetch(`${AUTOSHIP_URL}/api/pipelines?projectId=${encodeURIComponent(project.id)}`, {
          credentials: 'omit',
        })
        if (!response.ok) return
        const data = (await response.json()) as { runs?: AutoshipRun[] }
        const run = data.runs?.[0]
        if (run && !cancelled) setLatestRun(run)
      } catch {
        if (!cancelled) setAutoshipOnline(false)
      }
    }
    poll()
    const timer = window.setInterval(poll, 10000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!latestRun || !['queued', 'running'].includes(latestRun.status)) return
    let cancelled = false
    const timer = window.setInterval(async () => {
      try {
        const run = await getAutoshipRun(latestRun.id)
        if (!cancelled) setLatestRun(run)
      } catch {
        /* status polling is best-effort */
      }
    }, 3000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [latestRun?.id, latestRun?.status])

  const openFile = (file: string) => {
    setActiveFile(file)
    setView('code')
  }
  const startTask = async () => {
    if (!prompt.trim() || busy) return
    setBusy(true)
    setView('agent')
    try {
      const result = await executeTask(prompt.trim(), setTask)
      setTask(result)
      setView('review')
    } catch (error) {
      setTask((prev) => (prev ? { ...prev, status: 'error', error: String(error) } : null))
    } finally {
      setBusy(false)
    }
  }
  const deploy = async () => {
    if (deployBusy) return
    setDeployBusy(true)
    setDeployMessage('Checking Autoship deployment pipeline…')
    try {
      await ensureAgentsIDEProject()
      setAutoshipOnline(true)
      setDeployMessage(
        'CI-controlled deployment is active. Push to main or run the Autoship workflow to deploy; this browser never receives the API token.',
      )
    } catch (error) {
      setAutoshipOnline(false)
      setDeployMessage(`Autoship unavailable: ${String(error).replace(/^Error: /, '')}`)
    } finally {
      setDeployBusy(false)
    }
  }
  const approve = () => {
    if (task)
      setTask({
        ...task,
        status: 'complete',
        logs: [...task.logs, 'Changes approved locally. Persistence will be connected to the workspace runtime next.'],
      })
  }
  const reject = () => {
    if (task) {
      setTask({ ...task, status: 'idle', changes: [], logs: [...task.logs, 'Changes rejected by reviewer'] })
      setView('agent')
    }
  }

  const deploymentLabel = latestRun ? `${latestRun.status.toUpperCase()} · ${latestRun.id}` : 'Ready'
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⌁</span>
          <strong>AgentsIDE</strong>
        </div>
        <button className="workspace-switch">
          zskbot / AgentsIDE <ChevronDown size={14} />
        </button>
        <span className="page-title">{viewTitles[view]}</span>
        <div className="top-actions">
          <span className={`status-dot ${busy ? 'busy' : ''}`} />
          <span className="status-text">
            {busy ? 'Agent running' : task?.status === 'complete' ? 'Complete' : 'Ready'}
          </span>
          <button className="icon-btn" aria-label="Settings">
            <Settings2 size={18} />
          </button>
        </div>
      </header>
      <main className="main-content">
        {view === 'workspace' && (
          <Workspace
            onOpenCode={() => openFile(activeFile)}
            onOpenFile={openFile}
            onNewTask={() => setView('agent')}
            autoshipOnline={autoshipOnline}
            autoshipRuns={autoshipRuns}
            latestRun={deploymentLabel}
            onDeploy={deploy}
            deployBusy={deployBusy}
            deployMessage={deployMessage}
          />
        )}
        {view === 'code' && <CodeWorkspace activeFile={activeFile} onSelect={openFile} />}
        {view === 'agent' && <Agent prompt={prompt} setPrompt={setPrompt} onSend={startTask} busy={busy} task={task} />}
        {view === 'review' &&
          (task?.changes.length ? <ReviewPanel task={task} onApprove={approve} onReject={reject} /> : <Review />)}
        {view === 'tools' && <Tools onDeploy={deploy} deployBusy={deployBusy} deployMessage={deployMessage} />}
      </main>
      <nav className="bottom-nav" aria-label="Primary navigation">
        <NavItem
          icon={<Folder size={19} />}
          label="Work"
          active={view === 'workspace'}
          onClick={() => setView('workspace')}
        />
        <NavItem icon={<Code2 size={19} />} label="Code" active={view === 'code'} onClick={() => setView('code')} />
        <NavItem icon={<Bot size={19} />} label="Agent" active={view === 'agent'} onClick={() => setView('agent')} />
        <NavItem
          icon={<GitPullRequest size={19} />}
          label="Review"
          active={view === 'review'}
          onClick={() => setView('review')}
        />
        <NavItem
          icon={<TerminalSquare size={19} />}
          label="Tools"
          active={view === 'tools'}
          onClick={() => setView('tools')}
        />
      </nav>
    </div>
  )
}
function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  )
}
function Workspace({
  onOpenCode,
  onOpenFile,
  onNewTask,
  autoshipOnline,
  autoshipRuns,
  latestRun,
  onDeploy,
  deployBusy,
  deployMessage,
}: {
  onOpenCode: () => void
  onOpenFile: (file: string) => void
  onNewTask: () => void
  autoshipOnline: boolean
  autoshipRuns: number
  latestRun: string
  onDeploy: () => void
  deployBusy: boolean
  deployMessage: string
}) {
  return (
    <section className="screen workspace-screen">
      <div className="eyebrow">01 · WORKSPACE</div>
      <div className="hero-row">
        <div>
          <h1>Build with agents.</h1>
          <p>Code, review, test and ship from one workspace.</p>
        </div>
        <button className="primary-btn" onClick={onNewTask}>
          <Plus size={17} /> New task
        </button>
      </div>
      <div className="repo-card">
        <div className="repo-icon">
          <Code2 size={21} />
        </div>
        <div className="repo-copy">
          <strong>AgentsIDE</strong>
          <span>
            <GitBranch size={13} /> main · clean
          </span>
        </div>
        <span className="live-pill">READY</span>
      </div>
      <div className="deploy-card">
        <div>
          <span className="mini-label">AUTOSHIP</span>
          <strong>Continuous deployment</strong>
          <small>{autoshipOnline ? `Connected · ${latestRun}` : 'Connection not available yet'}</small>
        </div>
        <div className="deploy-side">
          <span className={`connection ${autoshipOnline ? 'online' : ''}`}>
            <span />
            {autoshipOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button className="primary-btn" onClick={onDeploy} disabled={deployBusy}>
            <Rocket size={16} /> {deployBusy ? 'Checking…' : 'Deploy'}
          </button>
        </div>
        {deployMessage && (
          <div className="deploy-message">
            {deployMessage} ·{' '}
            <a href={AUTOSHIP_URL} target="_blank" rel="noreferrer">
              Open Autoship <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
      <div className="section-heading">
        <span>Repository files</span>
        <button className="ghost-btn" onClick={onOpenCode}>
          Open editor <Code2 size={15} />
        </button>
      </div>
      <div className="file-list">
        {files.map((file) => (
          <button
            className={`file-row ${file.name === 'App.tsx' ? 'selected' : ''}`}
            key={file.path}
            onClick={() => onOpenFile(file.name)}
          >
            <FileCode2 size={17} />
            <span>{file.name}</span>
            <small>{file.path}</small>
          </button>
        ))}
      </div>
      <div className="metrics">
        <Metric label="Changes" value="0" />
        <Metric label="Tests" value="Ready" />
        <Metric label="Autoship" value={autoshipRuns ? `${autoshipRuns} runs` : 'Ready'} />
      </div>
    </section>
  )
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
function CodeWorkspace({ activeFile, onSelect }: { activeFile: string; onSelect: (file: string) => void }) {
  return (
    <section className="screen editor-screen">
      <div className="editor-toolbar">
        <button className="ghost-btn">
          <Search size={16} /> Search
        </button>
        <span className="editor-file">{activeFile}</span>
        <button className="icon-btn">
          <Play size={17} />
        </button>
      </div>
      <div className="editor-layout">
        <FileExplorer activeFile={activeFile} onSelect={onSelect} />
        <CodeEditor file={activeFile} />
      </div>
      <div className="editor-footer">
        <span>
          <GitBranch size={14} /> main
        </span>
        <span>Editor ready</span>
      </div>
    </section>
  )
}
function Agent({
  prompt,
  setPrompt,
  onSend,
  busy,
  task,
}: {
  prompt: string
  setPrompt: (v: string) => void
  onSend: () => void
  busy: boolean
  task: AgentTask | null
}) {
  return (
    <section className="screen agent-screen">
      <div className="eyebrow">04 · AGENT RUNTIME</div>
      <h1>What should I build?</h1>
      <p className="muted">
        Describe a coding task. The runtime will plan the change, prepare an edit and send it to Review.
      </p>
      <div className="agent-card">
        <div className="agent-head">
          <span className="agent-avatar">
            <Bot size={18} />
          </span>
          <div>
            <strong>AgentsIDE Agent</strong>
            <span>Workspace-aware coding agent</span>
          </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={busy}
          placeholder="e.g. Add authentication to the app..."
        />
        <div className="prompt-actions">
          <div className="chips">
            <button onClick={() => setPrompt('Fix the current bug')}>Fix bug</button>
            <button onClick={() => setPrompt('Refactor this module')}>Refactor</button>
            <button onClick={() => setPrompt('Add a new feature')}>Add feature</button>
          </div>
          <button className="send-btn" disabled={!prompt.trim() || busy} onClick={onSend}>
            {busy ? <span className="spinner" /> : <Send size={17} />}
          </button>
        </div>
      </div>
      {task && (
        <div className="runtime-card">
          <div>
            <span className="mini-label">RUNTIME</span>
            <strong>{task.status.toUpperCase()}</strong>
          </div>
          <div className="runtime-steps">
            <span
              className={['planning', 'executing', 'testing', 'review', 'complete'].includes(task.status) ? 'done' : ''}
            >
              Plan
            </span>
            <span>→</span>
            <span className={['executing', 'testing', 'review', 'complete'].includes(task.status) ? 'done' : ''}>
              Edit
            </span>
            <span>→</span>
            <span className={['testing', 'review', 'complete'].includes(task.status) ? 'done' : ''}>Test</span>
            <span>→</span>
            <span className={['review', 'complete'].includes(task.status) ? 'done' : ''}>Review</span>
          </div>
        </div>
      )}
    </section>
  )
}
function Review() {
  const [decision, setDecision] = useState<'pending' | 'approved' | 'blocked'>('pending')
  const checks = [
    { label: 'Secrets & credentials', detail: 'No exposed tokens or private keys', status: 'passed' },
    { label: 'Malware & obfuscation', detail: 'Static analysis completed in sandbox', status: 'passed' },
    { label: 'Dependency risk', detail: '126 packages · 0 critical advisories', status: 'passed' },
    { label: 'Production policy', detail: 'Protected files unchanged', status: 'passed' },
  ]

  return (
    <section className="screen review-screen">
      <div className="eyebrow">05 · SECURITY REVIEW AGENT</div>
      <div className="review-title">
        <div>
          <h1>Autonomous gatekeeper</h1>
          <p className="muted">Every change is scanned before it can reach production.</p>
        </div>
        <span className={`clean-badge ${decision === 'blocked' ? 'blocked' : ''}`}>
          {decision === 'blocked' ? <Ban size={14} /> : <ShieldCheck size={14} />}
          {decision === 'pending' ? 'Awaiting decision' : decision === 'approved' ? 'Auto-approved' : 'Blocked'}
        </span>
      </div>
      <div className="security-hero">
        <div className="security-icon"><ShieldCheck size={25} /></div>
        <div>
          <span className="mini-label">LOW RISK · 0.8 / 10</span>
          <strong>Agent decision: safe to ship</strong>
          <p>Policy v2.4 · sandbox-7f3 · 34 seconds ago</p>
        </div>
        <div className="decision-lock"><LockKeyhole size={17} /><span>Policy locked</span></div>
      </div>
      <div className="security-grid">
        <div className="security-panel">
          <div className="panel-heading"><span>Automated checks</span><span className="check-count">4 / 4 passed</span></div>
          <div className="check-list">
            {checks.map((check) => (
              <div className="security-check" key={check.label}>
                <span className="check-icon"><CircleCheck size={16} /></span>
                <div><strong>{check.label}</strong><small>{check.detail}</small></div>
                <span className="passed-label">PASSED</span>
              </div>
            ))}
          </div>
        </div>
        <div className="security-panel policy-panel">
          <div className="panel-heading"><span>Decision policy</span><span className="policy-active">ACTIVE</span></div>
          <div className="policy-row"><span>Low risk</span><strong>Auto-approve</strong></div>
          <div className="policy-row"><span>Medium risk</span><strong>Human review</strong></div>
          <div className="policy-row"><span>High / critical</span><strong className="danger-text">Block & reject</strong></div>
          <div className="policy-note"><AlertTriangle size={15} /> Auth, infra and migrations always require human review.</div>
        </div>
      </div>
      <div className="review-commit"><div><GitCommitHorizontal size={17} /><span><strong>feat: refresh deployment controls</strong><small>main · 8 files changed · signed commit</small></span></div><span className="commit-id">a81f3c2</span></div>
      <div className="review-actions">
        <button className="secondary-btn" onClick={() => setDecision('blocked')}><Ban size={15} /> Block release</button>
        <button className="primary-btn" onClick={() => setDecision('approved')}><ShieldCheck size={15} /> Approve & deploy</button>
      </div>
    </section>
  )
}
function Tools({
  onDeploy,
  deployBusy,
  deployMessage,
}: {
  onDeploy: () => void
  deployBusy: boolean
  deployMessage: string
}) {
  return (
    <section className="screen tools-screen">
      <div className="eyebrow">06 · TOOLS</div>
      <h1>Developer tools</h1>
      <div className="tool-grid">
        <Tool icon={<TerminalSquare />} title="Terminal" text="Run commands in the workspace." />
        <Tool icon={<TestTube2 />} title="Tests" text="Run the project test suite." />
        <Tool icon={<GitBranch />} title="Git" text="Branches, commits and status." />
        <button className="tool-card" onClick={onDeploy} disabled={deployBusy}>
          <span>
            <Rocket />
          </span>
          <strong>{deployBusy ? 'Checking…' : 'Autoship Deploy'}</strong>
          <small>{deployMessage || 'Deployment is CI-controlled and credential-free in the browser.'}</small>
        </button>
      </div>
    </section>
  )
}
function Tool({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <button className="tool-card">
      <span>{icon}</span>
      <strong>{title}</strong>
      <small>{text}</small>
    </button>
  )
}
export default App
