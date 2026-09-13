import React from 'react';
import {
  Terminal,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ShieldCheck,
  Cpu,
  Rocket,
  Bot,
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
  {
    icon: Bot,
    title: 'Repository-aware agents',
    description: 'Cloud models (GPT-4o, Claude) or local Ollama agents, each working with full repository context.',
  },
  {
    icon: Terminal,
    title: 'Isolated workspaces',
    description: 'Every task runs in a sandboxed Git worktree. Agents never touch your working tree, or each other.',
  },
  {
    icon: GitBranch,
    title: 'Git automation',
    description: 'Branches, commits, and pull requests happen automatically. Merges wait for review gates to pass.',
  },
  {
    icon: ShieldCheck,
    title: 'AI code review',
    description: 'Gito checks every diff for quality and security issues, and leaves inline comments before merge.',
  },
  {
    icon: Cpu,
    title: 'Extensible skills',
    description: 'Scope agent behavior with built-in skills — code-fix, refactor, security-audit — or write your own.',
  },
  {
    icon: Rocket,
    title: 'Velclaw Deploy',
    description: 'A dedicated control plane for releases. Verify deployment evidence at velclaw.cfd/deploy.',
  },
];

const PRINCIPLES = [
  'Reuse capabilities, not entire unrelated repositories',
  'Keep secrets out of source control',
  'Isolate agent execution from the application host',
  'Require explicit approval for destructive actions',
  'Prefer small, testable adapters over tight coupling',
  'velclaw.cfd is the sole canonical Velclaw host',
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

function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-xl mb-14 ${alignment}`}>
      <p className="font-mono text-sm text-red-500 mb-3">{eyebrow}</p>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-neutral-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export default function VelclawPlatformLanding() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-red-600/40">
      <style>{`
        @keyframes vc-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .vc-cursor { animation: vc-blink 1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .vc-cursor { animation: none; opacity: 1; }
        }
        a:focus-visible, button:focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }
      `}</style>

      {/* Nav */}
      <header className="border-b border-neutral-800">
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-red-600 hover:bg-red-500 text-neutral-50 font-semibold transition-colors"
              >
                <Terminal className="h-4 w-4" /> Start a task
              </a>
              <a
                href="https://velclaw.cfd/docs"
                className="inline-flex items-center px-5 py-3 rounded-md border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-semibold transition-colors"
              >
                Read the docs
              </a>
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 font-mono text-sm text-neutral-400">
              <span className="text-red-500">$</span> npx velclaw init
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

      {/* Workflow */}
      <section className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20">
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
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20">
          <SectionHeading
            eyebrow="What's included"
            title="Everything the workflow needs, nothing it doesn't."
          />

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
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-20">
          <SectionHeading
            eyebrow="Ground rules"
            title="Built on solid principles."
          />
          <ul className="space-y-4">
            {PRINCIPLES.map((principle, idx) => (
              <li key={idx} className="flex items-start gap-3 font-mono text-sm text-neutral-400">
                <span className="text-red-500 mt-0.5">+</span>
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50">
              Ship your first agent task today.
            </h2>
            <p className="mt-4 text-neutral-400">
              Read the documentation, connect a repository, and let an agent open its first pull request.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 font-mono text-sm text-neutral-400">
              <span className="text-red-500">$</span> npx velclaw init
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://velclaw.cfd/docs"
                className="inline-flex items-center px-5 py-3 rounded-md bg-red-600 hover:bg-red-500 text-neutral-50 font-semibold transition-colors"
              >
                Browse docs
              </a>
              <a
                href="https://velclaw.cfd/velclaw"
                className="inline-flex items-center px-5 py-3 rounded-md border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-semibold transition-colors"
              >
                Go to dashboard
              </a>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VelclawMark size={20} />
              <span className="font-mono text-xs text-neutral-600">Velclaw — velclaw.cfd</span>
            </div>
            <span className="font-mono text-xs text-neutral-600">v1.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}