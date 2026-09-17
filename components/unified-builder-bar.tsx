'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Code2, Globe, LayoutTemplate } from 'lucide-react'

const modes = [
  { id: 'app', label: 'App', icon: LayoutTemplate, href: '/builder' },
  { id: 'agent', label: 'Agent', icon: Bot, href: '/builder?mode=agent' },
  { id: 'browser', label: 'Browser', icon: Globe, href: '/builder?mode=browser' },
  { id: 'code', label: 'Code', icon: Code2, href: '/builder?mode=code' },
] as const

export function UnifiedBuilderBar() {
  const pathname = usePathname()
  const mode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : null

  return (
    <nav aria-label="Builder modes" className="flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-[#080a0e] px-3 py-2">
      <span className="mr-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Build</span>
      {modes.map(({ id, label, icon: Icon, href }) => {
        const active = id === 'app' ? pathname === '/builder' && !mode : pathname === '/builder' && mode === id
        return (
          <Link
            key={id}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-xs transition-colors ${
              active
                ? 'border-violet-400/60 bg-violet-500/10 text-white'
                : 'border-transparent text-zinc-500 hover:border-white/10 hover:bg-white/5 hover:text-zinc-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
