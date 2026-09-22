'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { TaskSidebar } from '@/components/task-sidebar'
import { Task } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Menu, PanelLeftClose } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSidebarWidth, setSidebarWidth, getSidebarOpen, setSidebarOpen } from '@/lib/utils/cookies'
import { nanoid } from 'nanoid'
import { ConnectorsProvider } from '@/components/connectors-provider'
import { CommandPalette } from '@/components/command-palette'

interface AppLayoutProps {
  children: React.ReactNode
  initialSidebarWidth?: number
  initialSidebarOpen?: boolean
  initialIsMobile?: boolean
}

interface TasksContextType {
  refreshTasks: () => Promise<void>
  toggleSidebar: () => void
  isSidebarOpen: boolean
  isSidebarResizing: boolean
  addTaskOptimistically: (taskData: { prompt: string; repoUrl: string; selectedAgent: string; selectedModel: string; installDependencies: boolean; maxDuration: number }) => { id: string; optimisticTask: Task }
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)
export const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks must be used within AppLayout')
  return context
}

function SidebarLoader({ width }: { width: number }) {
  return (
    <div className="h-full border-r bg-muted px-2 md:px-3 pt-3 md:pt-5.5 pb-3 md:pb-4 overflow-y-auto" style={{ width: `${width}px` }}>
      <div className="mb-3 md:mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1"><span className="text-xs font-medium px-2 py-1 text-foreground bg-accent">Tasks</span><span className="text-xs font-medium px-2 py-1 text-muted-foreground">Repos</span></div>
          <div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled><Trash2 className="h-4 w-4" /></Button><Link href="/"><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Plus className="h-4 w-4" /></Button></Link></div>
        </div>
      </div>
      <div className="space-y-1">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="animate-pulse h-[70px]"><CardContent className="px-3 py-2" /></Card>)}</div>
    </div>
  )
}

export function AppLayout({ children, initialSidebarWidth, initialSidebarOpen, initialIsMobile }: AppLayoutProps) {
  const pathname = usePathname()
  const isStandalone = pathname === '/' || pathname === '/docs' || pathname.startsWith('/docs/')
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => initialIsMobile ? false : (initialSidebarOpen ?? true))
  const [sidebarWidth, setSidebarWidthState] = useState(initialSidebarWidth || getSidebarWidth())
  const [isResizing, setIsResizing] = useState(false)
  const [isDesktop, setIsDesktop] = useState(!initialIsMobile)
  const [hasMounted, setHasMounted] = useState(false)

  const updateSidebarWidth = (newWidth: number) => { setSidebarWidthState(newWidth); setSidebarWidth(newWidth) }
  const updateSidebarOpen = useCallback((isOpen: boolean, saveToCookie = true) => {
    setIsSidebarOpen(isOpen)
    if (saveToCookie && typeof window !== 'undefined' && window.innerWidth >= 1024) setSidebarOpen(isOpen)
  }, [])

  useEffect(() => {
    const actualIsDesktop = window.innerWidth >= 1024
    setIsDesktop(actualIsDesktop)
    if (!actualIsDesktop) setIsSidebarOpen(false)
    else if (initialIsMobile) setIsSidebarOpen(getSidebarOpen() ?? initialSidebarOpen ?? true)
    setHasMounted(true)
  }, [initialIsMobile, initialSidebarOpen])

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) setTasks((await response.json()).tasks)
      else if (response.status === 401) setTasks([])
    } catch (error) { console.error('Error fetching tasks:', error) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { if (!isStandalone) fetchTasks() }, [fetchTasks, isStandalone])
  useEffect(() => { if (isStandalone) return; const interval = setInterval(fetchTasks, 5000); return () => clearInterval(interval) }, [fetchTasks, isStandalone])

  const toggleSidebar = useCallback(() => updateSidebarOpen(!isSidebarOpen), [isSidebarOpen, updateSidebarOpen])
  useEffect(() => {
    const onResize = () => { const desktop = window.innerWidth >= 1024; setIsDesktop(desktop); if (!desktop) setIsSidebarOpen(false) }
    window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize)
  }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') { event.preventDefault(); toggleSidebar() } }
    document.addEventListener('keydown', onKeyDown); return () => document.removeEventListener('keydown', onKeyDown)
  }, [toggleSidebar])

  const addTaskOptimistically = (taskData: { prompt: string; repoUrl: string; selectedAgent: string; selectedModel: string; installDependencies: boolean; maxDuration: number }) => {
    const id = nanoid()
    const optimisticTask: Task = { id, userId: 'temp', prompt: taskData.prompt, title: null, repoUrl: taskData.repoUrl, selectedAgent: taskData.selectedAgent, selectedModel: taskData.selectedModel, installDependencies: taskData.installDependencies, maxDuration: taskData.maxDuration, keepAlive: false, enableBrowser: false, status: 'pending', progress: 0, logs: [], error: null, branchName: null, sandboxId: null, agentSessionId: null, sandboxUrl: null, previewUrl: null, mcpServerIds: null, prUrl: null, prNumber: null, prStatus: null, prMergeCommitSha: null, createdAt: new Date(), updatedAt: new Date(), completedAt: null, deletedAt: null }
    setTasks((prev) => [optimisticTask, ...prev]); return { id, optimisticTask }
  }

  const closeSidebar = () => updateSidebarOpen(false, false)
  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsResizing(true) }
  useEffect(() => {
    const move = (e: MouseEvent) => { if (!isResizing) return; const width = e.clientX; if (width >= 200 && width <= 600) updateSidebarWidth(width) }
    const up = () => setIsResizing(false)
    if (isResizing) { document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none' }
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.body.style.cursor = ''; document.body.style.userSelect = '' }
  }, [isResizing])

  return (
    <TasksContext.Provider value={{ refreshTasks: fetchTasks, toggleSidebar, isSidebarOpen, isSidebarResizing: isResizing, addTaskOptimistically }}>
      <ConnectorsProvider>
        {isStandalone ? children : (
          <div className="h-dvh flex relative" style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}>
            {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={closeSidebar} aria-hidden="true" />}
            <aside className={`fixed inset-y-0 left-0 z-40 ${isResizing || !hasMounted ? '' : 'transition-transform duration-200 ease-out'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: `${sidebarWidth}px` }} aria-label="Velclaw workspace navigation">
              <div className="h-full overflow-hidden">{isLoading ? <SidebarLoader width={sidebarWidth} /> : <TaskSidebar tasks={tasks} width={sidebarWidth} />}</div>
            </aside>
            <div className={`hidden lg:block fixed inset-y-0 cursor-col-resize group z-50 ${isSidebarOpen ? 'w-1 opacity-100' : 'w-0 opacity-0'}`} onMouseDown={isSidebarOpen ? handleMouseDown : undefined} style={{ left: isSidebarOpen ? `${sidebarWidth}px` : '0px' }} aria-hidden="true"><div className="absolute inset-y-0 left-0 w-0.5 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
            <main className={`flex-1 min-w-0 overflow-auto flex flex-col ${isResizing || !hasMounted ? '' : 'transition-[margin] duration-200 ease-out'}`} style={{ marginLeft: isDesktop && isSidebarOpen ? `${sidebarWidth + 4}px` : '0px' }}>
              <div className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <Button variant="ghost" size="icon" className="size-8" onClick={toggleSidebar} aria-label={isSidebarOpen ? 'Close workspace sidebar' : 'Open workspace sidebar'}>
                  {isSidebarOpen ? <PanelLeftClose className="size-4" /> : <Menu className="size-4" />}
                </Button>
                <Link href="/" className="font-mono text-sm font-semibold tracking-tight">VELCLAW</Link>
                <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-muted-foreground"><span className="hidden sm:inline">⌘K</span><span className="hidden md:inline">Command</span></div>
              </div>
              <div className="min-h-0 flex-1">{children}</div>
            </main>
            <CommandPalette />
          </div>
        )}
      </ConnectorsProvider>
    </TasksContext.Provider>
  )
}
