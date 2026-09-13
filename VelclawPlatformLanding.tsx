import React from 'react';
import { 
  Bot, 
  Terminal, 
  GitBranch, 
  ShieldCheck, 
  Cpu, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  Lock,
  Boxes,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const WORKFLOW_STEPS = [
  { num: '01', title: 'Authenticate' },
  { num: '02', title: 'Select repo' },
  { num: '03', title: 'Create task' },
  { num: '04', title: 'Choose agent' },
  { num: '05', title: 'Pick skill' },
  { num: '06', title: 'Agent runs' },
  { num: '07', title: 'Review diff' },
  { num: '08', title: 'Commit & push' },
  { num: '09', title: 'Open PR' },
  { num: '10', title: 'Review gates' },
  { num: '11', title: 'Merge' },
  { num: '12', title: 'Deploy evidence' },
];

const FEATURES = [
  {
    icon: <Bot className="h-6 w-6 text-sky-400" />,
    title: 'Repository-aware Agents',
    description: 'Cloud (GPT-4o, Claude) and local Ollama agents with full repository context and code understanding.',
  },
  {
    icon: <Terminal className="h-6 w-6 text-emerald-400" />,
    title: 'Isolated Workspaces',
    description: "Every task runs in a sandboxed Git worktree. Agents can't affect your working tree or other tasks.",
  },
  {
    icon: <GitBranch className="h-6 w-6 text-indigo-400" />,
    title: 'Git Automation',
    description: 'Automatic branch creation, commits, and pull requests. Merge only when review gates pass.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-teal-400" />,
    title: 'AI Code Review (Gito)',
    description: 'Automated quality and security review with inline comments before any code is merged.',
  },
  {
    icon: <Cpu className="h-6 w-6 text-purple-400" />,
    title: 'Extensible Skills',
    description: 'Scope agent behavior with built-in skills (code-fix, refactor, security-audit) or create your own.',
  },
  {
    icon: <Rocket className="h-6 w-6 text-rose-400" />,
    title: 'Velclaw Deploy',
    description: 'Dedicated deployment control plane. Prepare releases and verify deployment evidence at velclaw.cfd/deploy.',
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

export default function VelclawPlatformLanding() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-sky-500/30">
      {/* 1. Header & Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))]" />
        
        <div className="container mx-auto px-4 relative z-10 max-w-5xl text-center">
          <Badge variant="outline" className="mb-6 px-3 py-1 font-mono text-xs border-sky-500/30 text-sky-400 bg-sky-950/40">
            ZSKBOT AI Coding Agent Platform — v1.4
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans max-w-3xl mx-auto leading-tight">
            The unified AI coding <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400">
              agent platform
            </span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Repository-aware agents, isolated workspaces, Git automation, AI code review, and deployment control — behind one workflow.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6 shadow-lg shadow-sky-500/20">
              <a href="https://velclaw.cfd/deploy">
                Quick Start <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300">
              <a href="https://velclaw.cfd/docs">
                <BookOpen className="mr-2 h-4 w-4" /> Read the Docs
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. One Workflow. End to End (12-Step Grid) */}
      <section className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              One workflow. End to end.
            </h2>
            <p className="mt-3 text-slate-400">
              From task creation to deployment evidence — Velclaw handles the entire AI coding lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {WORKFLOW_STEPS.map((step) => (
              <div 
                key={step.num}
                className="group p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 hover:border-sky-500/40 transition-all duration-200"
              >
                <div className="font-mono text-xs text-sky-400 font-semibold mb-2">
                  {step.num}
                </div>
                <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Everything You Need (Features) */}
      <section className="py-24 border-b border-slate-800/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
            <p className="mt-3 text-slate-400">
              Velclaw combines best-in-class components into a single, coherent platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((item, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 hover:border-slate-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center mb-5 border border-slate-700/50">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Built on Solid Principles */}
      <section className="py-20 border-b border-slate-800/60 bg-slate-950/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
            Built on solid principles
          </h2>

          <div className="space-y-3">
            {PRINCIPLES.map((principle, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40 text-slate-300 text-sm font-medium"
              >
                <CheckCircle2 className="h-5 w-5 text-sky-400 shrink-0" />
                <span>{principle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Footer */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Start building with Velclaw
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Read the documentation and run your first AI coding task today.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6">
              <a href="https://velclaw.cfd/docs">
                <BookOpen className="mr-2 h-4 w-4" /> Browse Docs
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300">
              <a href="https://velclaw.cfd/velclaw">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
