import React, { useState } from 'react';
import {
  Terminal,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ShieldCheck,
  Cpu,
  Rocket,
  Bot,
  Menu,
  X,
  Copy,
  Check,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { num: '01', title: 'Authenticate', note: 'Connect your Git provider' },
  { num: '02', title: 'Select repo', note: 'Point an agent at a codebase' },
  { num: '03', title: 'Create task', note: 'Describe the change in plain language' },
  { num: '04', title: 'Choose agent', note: 'Cloud model or local Ollama' },
  { num: '05', title: 'Pick skill', note: 'Scope behavior: fix, refactor, audit' },
  { num: '06', title: 'Agent runs', note: 'Inside an isolated worktree' },
  { num: '07', title: 'Review diff', note: 'Line-by-line, before anything ships' },
  { num: '08', title: 'Commit & push', note: 'To a dedicated branch' },
  { num: '09', title: 'Open PR', note: 'With a written summary of intent' },
  { num: '10', title: 'Review gates', note: 'Gito checks quality and security' },
  { num: '11', title: 'Merge', note: 'Only once gates pass' },
  { num: '12', title: 'Deploy evidence', note: 'Recorded at velclaw.cfd/deploy' },
];

const FEATURES = [
  { icon: Bot, title: 'Repository-aware agents', description: 'Cloud models (GPT-4o, Claude) or local Ollama agents, each working with full repository context.' },
  { icon: Terminal, title: 'Isolated workspaces', description: 'Every task runs in a sandboxed Git worktree. Agents never touch your working tree, or each other.' },
  { icon: GitBranch, title: 'Git automation', description: 'Branches, commits, and pull requests happen automatically. Merges wait for review gates to pass.' },
  { icon: ShieldCheck, title: 'AI code review', description: 'Gito checks every diff for quality and security issues, and leaves inline comments before merge.' },
  { icon: Cpu, title: 'Extensible skills', description: 'Scope agent behavior with built-in skills — code-fix, refactor, security-audit — or write your own.' },
  { icon: Rocket, title: 'Velclaw Deploy', description: 'A dedicated control plane for releases. Verify deployment evidence at velclaw.cfd/deploy.' },
];

const PRINCIPLES = [
  'Reuse capabilities, not entire unrelated repositories',
  'Keep secrets out of source control',
  'Isolate agent execution from the application host',
  'Require explicit approval for destructive actions',
  'Prefer small, testable adapters over tight coupling',
  'velclaw.cfd is the sole canonical Velclaw host',
];

const TABS = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'features', label: 'Features' },
  { id: 'principles', label: 'Principles' },
];

function VelclawMark({ size = 36 }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-md bg-neutral-950 ring-1 ring-neutral-800 shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" width={size * 0.6} height={size * 0.6} fill="none">
        <path d="M7 6 L17 24 L11 44" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="square" />
        <path d="M20 4 L30 24 L22 44" stroke="#dc2626" strokeWidth="5.5" strokeLinecap="square" />
        <path d="M33 6 L43 22 L35 40" stroke="#b91c1c" strokeWidth="5.5" strokeLinecap="square" />
      </svg>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-xl mb-14">
      <p className="font-mono text-sm text-red-500 mb-3">{eyebrow}</p>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 leading-tight">{title}</h2>
      {description && <p className="mt-4 text-neutral-400 leading-relaxed">{description}</p>}
    </div>
  );
}

function CopyCommand({ command }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch (e) {
      // clipboard may be unavailable in this preview context — feedback still shows
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 px-4 py-3 font-mono text-sm text-neutral-400 transition-all active:scale-[0.98]"
    >
      <span className="text-red-500">$</span>
      <span>{command}</span>
      <span className="ml-2 flex items-center gap-1 text-xs text-neutral-600 group-hover:text-neutral-400">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-red-500" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copy
          </>
        )}
      </span>
    </button>
  );
}

export default function VelclawPlatformLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-red-600/40">
      <style>{`
        @keyframes vc-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .vc-cursor { animation: vc-blink 1s steps(1) infinite; }
        @keyframes vc-tab-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .vc-tab-panel { animation: vc-tab-in 260ms ease both; }
        @media (prefers-reduced-motion: reduce) {
          .vc-cursor { animation: none; opacity: 1; }
          .vc-tab-panel { animation: none; }
        }
        a:focus-visible, button:focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }
      `}</style>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VelclawMark size={30} />
            <span className="font-serif font-bold text-neutral-50 tracking-tight">Velclaw</span>
          </div>

          <nav className="hidden sm:flex items-center gap-8 font-mono text-sm text-neutral-400">
            <a href="https://velclaw.cfd/docs" className="hover:text-neutral-100 transition-colors">Docs</a>
            <a href="https://velclaw.cfd/deploy" className="hover:text-neutral-100 transition-colors">Deploy</a>
            <a href="https://velclaw.cfd/velclaw" className="hover:text-neutral-100 transition-colors">Dashboard</a>
          </nav>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="sm:hidden relative h-9 w-9 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-300 active:scale-95 transition-transform"
          >
            <Menu className={`h-4 w-4 absolute transition-all duration-200 ${menuOpen ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`} />
            <X className={`h-4 w-4 absolute transition-all duration-200 ${menuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} />
          </button>
        </div>

        {/* Mobile menu — animated expand/collapse */}
        <div
          className="sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out border-t border-neutral-800"
          style={{ maxHeight: menuOpen ? 220 : 0, opacity: menuOpen ? 1 : 0 }}
        >
          <nav className="flex flex-col px-6 py-2 font-mono text-sm text-neutral-400">
            {[
              { label: 'Docs', href: 'https://velclaw.cfd/docs' },
              { label: 'Deploy', href: 'https://velclaw.cfd/deploy' },
              { label: 'Dashboard', href: 'https://velclaw.cfd/velclaw' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="py-3 border-b border-neutral-900 last:border-0 hover:text-neutral-100 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-50 leading-[1.1] tracking-tight">
              Your repos, reviewed and shipped by agents.
            </h1>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-md">
              Velclaw runs repository-aware coding agents in isolated workspaces, opens the pull request, and holds the merge until review gates pass.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="https://velclaw.cfd/deploy"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-red-600 hover:bg-red-500 text-neutral-50 font-semibold transition-all active:scale-95"
              >
                <Terminal className="h-4 w-4" /> Start a task
              </a>
              <a
                href="https://velclaw.cfd/docs"
                className="inline-flex items-center px-5 py-3 rounded-md border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-semibold transition-all active:scale-95"
              >
                Read the docs
              </a>
            </div>

            <div className="mt-8">
              <CopyCommand command="npx velclaw init" />
            </div>
          </div>

          {/* Terminal / diff mock */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <span className="ml-2 font-mono text-xs text-neutral-500">agents/fix-auth.ts</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              <div className="flex gap-4 text-neutral-600">
                <span className="w-5 text-right">12</span>
                <span className="text-neutral-400">function verifyToken(token) {'{'}</span>
              </div>
              <div className="flex gap-4 text-neutral-600 line-through decoration-neutral-700">
                <span className="w-5 text-right">13</span>
                <span className="text-neutral-500">- &nbsp;return jwt.decode(token);</span>
              </div>
              <div className="flex gap-4">
                <span className="w-5 text-right text-neutral-600">13</span>
                <span className="text-red-400">+ &nbsp;return jwt.verify(token, SECRET);</span>
              </div>
              <div className="flex gap-4 text-neutral-600">
                <span className="w-5 text-right">14</span>
                <span className="text-neutral-400">{'}'}</span>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center gap-2 text-neutral-400">
                <GitPullRequest className="h-4 w-4 text-red-500" />
                <span>PR #482 opened by velclaw-agent</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-neutral-600">
                <GitCommit className="h-4 w-4" />
                <span>fix: verify JWT signature before trusting claims</span>
              </div>
              <div className="mt-4 text-neutral-500">
                <span className="text-red-500">vel</span>@task:~$ run fix-auth
                <span className="vc-cursor">_</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed content: Pipeline / Features / Principles */}
      <section className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16">
          <div className="flex items-center gap-2 border-b border-neutral-800 mb-14">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 font-mono text-sm transition-colors active:scale-95 ${
                    active ? 'text-neutral-50' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {tab.label}
                  <span
                    className="absolute left-0 right-0 -bottom-px h-0.5 bg-red-500 transition-transform duration-300 origin-left"
                    style={{ transform: active ? 'scaleX(1)' : 'scaleX(0)' }}
                  />
                </button>
              );
            })}
          </div>

          <div key={activeTab} className="vc-tab-panel pb-20">
            {activeTab === 'pipeline' && (
              <>
                <SectionHeading
                  eyebrow="The pipeline"
                  title="One task, twelve checkpoints."
                  description="From the first prompt to deployment evidence, every task moves through the same sequence."
                />
                <div className="grid md:grid-cols-2 gap-x-16">
                  {[WORKFLOW_STEPS.slice(0, 6), WORKFLOW_STEPS.slice(6, 12)].map((col, colIdx) => (
                    <ol key={colIdx} className="relative border-l border-neutral-800 ml-3">
                      {col.map((step) => (
                        <li key={step.num} className="relative pl-6 pb-8 last:pb-0">
                          <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-neutral-950 border border-red-500" />
                          <div className="font-mono text-xs text-red-500">{step.num}</div>
                          <div className="mt-1 font-semibold text-neutral-100">{step.title}</div>
                          <div className="text-sm text-neutral-500">{step.note}</div>
                        </li>
                      ))}
                    </ol>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'features' && (
              <>
                <SectionHeading eyebrow="What's included" title="Everything the workflow needs, nothing it doesn't." />
                <div className="grid md:grid-cols-2 border-t border-l border-neutral-800">
                  {FEATURES.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="border-r border-b border-neutral-800 p-8">
                        <Icon className="h-5 w-5 text-red-500 mb-4" />
                        <h3 className="font-semibold text-neutral-100 mb-2">{item.title}</h3>
                        <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'principles' && (
              <>
                <SectionHeading eyebrow="Ground rules" title="Built on solid principles." />
                <ul className="space-y-4 max-w-2xl">
                  {PRINCIPLES.map((principle, idx) => (
                    <li key={idx} className="flex items-start gap-3 font-mono text-sm text-neutral-400">
                      <span className="text-red-500 mt-0.5">+</span>
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50">
              Ship your first agent task today.
            </h2>
            <p className="mt-4 text-neutral-400">
              Read the documentation, connect a repository, and let an agent open its first pull request.
            </p>
            <div className="mt-8"><CopyCommand command="npx velclaw init" /></div>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://velclaw.cfd/docs"
                className="inline-flex items-center px-5 py-3 rounded-md bg-red-600 hover:bg-red-500 text-neutral-50 font-semibold transition-all active:scale-95"
              >
                Browse docs
              </a>
              <a
                href="https://velclaw.cfd/velclaw"
                className="inline-flex items-center px-5 py-3 rounded-md border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-semibold transition-all active:scale-95"
              >
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Professional footer */}
      <footer className="bg-neutral-950">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <VelclawMark size={26} />
                <span className="font-serif font-bold text-neutral-50">Velclaw</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                A unified platform for repository-aware coding agents — from task to reviewed, deployed pull request.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="https://github.com" aria-label="GitHub" className="h-9 w-9 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
                  <Github className="h-4 w-4" />
                </a>
                <a href="https://twitter.com" aria-label="Twitter" className="h-9 w-9 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com" aria-label="LinkedIn" className="h-9 w-9 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs text-neutral-500 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li><button onClick={() => setActiveTab('pipeline')} className="hover:text-neutral-100 transition-colors">Pipeline</button></li>
                <li><button onClick={() => setActiveTab('features')} className="hover:text-neutral-100 transition-colors">Features</button></li>
                <li><button onClick={() => setActiveTab('principles')} className="hover:text-neutral-100 transition-colors">Principles</button></li>
                <li><a href="https://velclaw.cfd/deploy" className="hover:text-neutral-100 transition-colors">Deploy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs text-neutral-500 mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
           