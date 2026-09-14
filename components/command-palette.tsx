'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const COMMANDS = [
  { label: 'New Task', hint: 'Create a new agent task', href: '/' },
  { label: 'Dashboard', hint: 'Open Velclaw dashboard', href: '/dashboard' },
  { label: 'Deployments', hint: 'View deployments and delivery state', href: '/deployments' },
  { label: 'Hosting', hint: 'Manage hosted services', href: '/hosting' },
  { label: 'API Keys', hint: 'Manage developer API keys', href: '/api-keys' },
  { label: 'MCP', hint: 'Manage MCP servers', href: '/mcp' },
  { label: 'Plugins', hint: 'Browse plugins', href: '/plugins' },
  { label: 'Settings', hint: 'Open workspace settings', href: '/settings' },
] as const

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMMANDS
    return COMMANDS.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    setSelected(0)
  }, [query, open])

  const navigate = (href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelected((value) => Math.min(value + 1, Math.max(filtered.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelected((value) => Math.max(value - 1, 0))
    } else if (event.key === 'Enter' && filtered[selected]) {
      event.preventDefault()
      navigate(filtered[selected].href)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Velclaw Command Palette</DialogTitle>
          <DialogDescription>Search workspace navigation and actions.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center border-b px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search Velclaw…"
            aria-label="Search Velclaw commands"
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <kbd className="hidden sm:inline-flex shrink-0 border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2" role="listbox" aria-label="Velclaw commands">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">No matching commands.</div>
          ) : (
            filtered.map((command, index) => (
              <button
                key={command.href}
                type="button"
                role="option"
                aria-selected={selected === index}
                onMouseEnter={() => setSelected(index)}
                onClick={() => navigate(command.href)}
                className={cn(
                  'flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors',
                  selected === index ? 'border-primary/40 bg-primary/10' : 'border-transparent hover:bg-accent',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{command.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{command.hint}</div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
              </button>
            ))
          )}
        </div>
        <div className="border-t px-3 py-2 text-[10px] font-mono text-muted-foreground">
          ↑↓ navigate · Enter open · Ctrl/⌘ K toggle
        </div>
      </DialogContent>
    </Dialog>
  )
}
