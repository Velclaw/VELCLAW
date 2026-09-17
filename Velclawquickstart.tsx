'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Bot, Boxes, Check, ChevronRight, Copy, Github, Menu, Moon, Rocket, Search, ShieldCheck, Sun, X } from 'lucide-react'

type Step = { id: string; num: string; title: string; body: string; code?: string }
type Feedback = 'up' | 'down' | null
type SidebarProps = { dark: boolean; muted: string; onNavigate?: () => void }

const TOC = [
  { id: 'cai-dat', label: 'Cài đặt CLI' },
  { id: 'xac-thuc', label: 'Xác thực tài khoản' },
  { id: 'ket-noi', label: 'Kết nối kho mã nguồn' },
  { id: 'tac-vu-dau-tien', label: 'Tạo tác vụ đầu tiên' },
  { id: 'xem-lai', label: 'Xem lại và merge' },
  { id: 'buoc-tiep-theo', label: 'Bước tiếp theo' },
]

const STEPS: Step[] = [
  { id: 'cai-dat', num: '1', title: 'Cài đặt CLI', body: 'Cài Velclaw CLI bằng npm. Yêu cầu Node.js 18 trở lên.', code: 'npm install -g velclaw-deploy' },
  { id: 'xac-thuc', num: '2', title: 'Xác thực tài khoản', body: 'Đăng nhập bằng Git provider để Velclaw có thể làm việc với repository của bạn.', code: 'velclaw-deploy login' },
  { id: 'ket-noi', num: '3', title: 'Kết nối kho mã nguồn', body: 'Chỉ định repository và branch cần triển khai.', code: 'velclaw-deploy deploy https://github.com/your-org/your-repo --branch main' },
  { id: 'tac-vu-dau-tien', num: '4', title: 'Tạo tác vụ đầu tiên', body: 'Mô tả thay đổi bạn muốn agent thực hiện trong workspace cô lập.', code: 'velclaw task create "Sửa lỗi xác thực JWT"' },
  { id: 'xem-lai', num: '5', title: 'Xem lại và merge', body: 'Kiểm tra diff, build và test trước khi merge. Velclaw không bỏ qua bước review.' },
]

function CodeBlock({ code, dark }: { code: string; dark: boolean }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(code) } catch { /* clipboard may be unavailable */ }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }
  return <div className={`mt-3 overflow-hidden rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'}`}><div className={`flex items-center justify-between border-b px-3 py-2 text-xs ${dark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'}`}><span>bash</span><button onClick={copy} className="flex items-center gap-1 hover:text-red-500">{copied ? <Check className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>}{copied ? 'Đã sao chép' : 'Sao chép'}</button></div><pre className="overflow-x-auto px-3 py-3 font-mono text-xs"><span className="text-red-500">$ </span>{code}</pre></div>
}

function SidebarNav({ dark, muted, onNavigate }: SidebarProps) {
  const groups = [
    { label: 'Bắt đầu', items: [{ id: 'index', label: 'Tổng quan', icon: BookOpen }, { id: 'quickstart', label: 'Quickstart', icon: Rocket }] },
    { label: 'Nền tảng', items: [{ id: 'workspace', label: 'Không gian làm việc', icon: Boxes }, { id: 'agents', label: 'Agents', icon: Bot }, { id: 'build-runtime', label: 'Build & Runtime', icon: Rocket }] },
    { label: 'Tích hợp', items: [{ id: 'github-delivery', label: 'GitHub Delivery', icon: Github }, { id: 'security', label: 'Bảo mật', icon: ShieldCheck }] },
  ]
  return <nav className="space-y-6">{groups.map((group) => <div key={group.label}><div className={`mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider ${muted}`}>{group.label}</div>{group.items.map((item) => { const Icon = item.icon; return <a key={item.id} href={`#${item.id}`} onClick={onNavigate} className={`mb-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm ${item.id === 'quickstart' ? (dark ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-900') : `${muted} hover:text-red-500`}`}><Icon className="h-3.5 w-3.5"/>{item.label}</a> })}</div>)}</nav>
}

export default function VelclawQuickstart() {
  const [dark, setDark] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('cai-dat')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      let current = TOC[0]?.id || 'cai-dat'
      for (const item of TOC) { const element = sectionRefs.current[item.id]; if (element && element.getBoundingClientRect().top < 150) current = item.id }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const muted = dark ? 'text-neutral-500' : 'text-neutral-500'
  const border = dark ? 'border-neutral-800' : 'border-neutral-200'
  const surface = dark ? 'bg-neutral-900' : 'bg-neutral-50'
  const bg = dark ? 'bg-neutral-950' : 'bg-white'
  const text = dark ? 'text-neutral-200' : 'text-neutral-800'

  function scrollTo(id: string) { sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return <div className={`min-h-screen ${bg} ${text}`}>
    <header className={`sticky top-0 z-40 border-b ${border} ${bg}/95 backdrop-blur`}><div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4"><button className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Mở menu"><Menu className="h-5 w-5"/></button><div className="flex items-center gap-2 font-semibold"><div className="grid h-6 w-6 place-items-center rounded bg-neutral-950"><Rocket className="h-3.5 w-3.5 text-red-500"/></div>Velclaw</div><span className={`hidden text-sm md:block ${muted}`}>Tài liệu</span><div className="flex-1"/><button onClick={() => setSearchOpen(true)} className={`hidden items-center gap-2 rounded-md border px-3 py-1.5 text-xs sm:flex ${border} ${muted}`}><Search className="h-3.5 w-3.5"/>Tìm kiếm...<kbd className={`border px-1 ${border}`}>⌘K</kbd></button><button onClick={() => setDark((value) => !value)} className={`grid h-8 w-8 place-items-center rounded-md border ${border}`} aria-label="Đổi giao diện">{dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}</button><a href="https://velclaw.cfd/deploy" className="hidden rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white sm:block">Bắt đầu</a></div></header>
    {mobileNavOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} aria-label="Đóng menu"/><aside className={`relative h-full w-72 ${bg} border-r ${border} p-5`}><button onClick={() => setMobileNavOpen(false)} className="mb-6"><X className="h-5 w-5"/></button><SidebarNav dark={dark} muted={muted} onNavigate={() => setMobileNavOpen(false)}/></aside></div>}
    <div className="mx-auto flex max-w-[1400px]"><aside className={`sticky top-14 hidden h-[calc(100vh-56px)] w-64 shrink-0 overflow-y-auto border-r ${border} p-5 lg:block`}><SidebarNav dark={dark} muted={muted}/></aside><main className="min-w-0 max-w-3xl flex-1 px-5 py-10 md:px-10"><div className={`mb-4 flex items-center gap-1.5 text-xs ${muted}`}>Tài liệu<ChevronRight className="h-3 w-3"/>Bắt đầu<ChevronRight className="h-3 w-3"/>Quickstart</div><div className="mb-3 flex items-center gap-2 text-xs text-red-500"><Rocket className="h-4 w-4"/>5 phút để hoàn thành</div><h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Quickstart</h1><p className={`mb-8 text-lg leading-relaxed ${muted}`}>Cài đặt CLI, kết nối repository và đưa tác vụ đầu tiên vào workflow của Velclaw.</p><div className={`mb-10 rounded-lg border-l-4 border-l-sky-500 ${border} ${surface} px-4 py-3 text-sm`}><strong>Yêu cầu:</strong> Node.js 18+ và quyền truy cập repository.</div><div className="space-y-10">{STEPS.map((step) => <div key={step.id} ref={(element) => { sectionRefs.current[step.id] = element }} className="scroll-mt-24"><div className="mb-2 flex items-center gap-3"><span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${activeSection === step.id ? 'bg-red-600 text-white' : `${surface} ${muted}`}`}>{step.num}</span><h2 className="text-lg font-semibold">{step.title}</h2></div><p className={`pl-9 leading-relaxed ${muted}`}>{step.body}</p>{step.code && <div className="pl-9"><CodeBlock code={step.code} dark={dark}/></div>}</div>)}</div><div ref={(element) => { sectionRefs.current['buoc-tiep-theo'] = element }} className="mt-16 scroll-mt-24"><h2 className="mb-5 text-xl font-semibold">Bước tiếp theo</h2><div className="grid gap-3 sm:grid-cols-3">{[{title:'Workspace',desc:'Quản lý workspace cô lập.',icon:Boxes},{title:'Agents',desc:'Xây workflow agent.',icon:Bot},{title:'Bảo mật',desc:'Kiểm soát secrets và quyền.',icon:ShieldCheck}].map(({title,desc,icon:Icon}) => <a key={title} href={`#${title.toLowerCase()}`} className={`rounded-lg border ${border} p-4 hover:border-red-500`}><Icon className="mb-3 h-4 w-4 text-red-500"/><div className="mb-1 flex items-center gap-1 text-sm font-medium">{title}<ArrowRight className="h-3 w-3"/></div><p className={`text-xs ${muted}`}>{desc}</p></a>)}</div></div><div className={`mt-16 flex flex-col gap-4 border-t ${border} pt-6 sm:flex-row sm:items-center sm:justify-between`}><div className={`text-xs ${muted}`}>Trang này hữu ích chứ?</div><div className="flex gap-2"><button onClick={() => setFeedback('up')} className={`rounded border px-3 py-1 text-xs ${feedback === 'up' ? 'border-red-500 text-red-500' : border}`}>Có</button><button onClick={() => setFeedback('down')} className={`rounded border px-3 py-1 text-xs ${feedback === 'down' ? 'border-red-500 text-red-500' : border}`}>Chưa</button></div></div></main><aside className="hidden w-56 shrink-0 py-10 pl-4 xl:block"><div className="sticky top-20"><div className={`mb-3 text-xs font-medium ${muted}`}>Trên trang này</div><ul className="space-y-2 text-sm">{TOC.map((item) => <li key={item.id}><button onClick={() => scrollTo(item.id)} className={activeSection === item.id ? 'font-medium text-red-500' : muted}>{item.label}</button></li>)}</ul></div></aside></div>
    {searchOpen && <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24"><div className={`w-full max-w-lg rounded-lg border ${border} ${bg} p-4 shadow-2xl`}><div className="mb-4 flex items-center gap-2"><Search className="h-4 w-4"/><input autoFocus onKeyDown={(event) => { if (event.key === 'Escape' || event.key === 'Enter') setSearchOpen(false) }} placeholder="Tìm kiếm tài liệu..." className="flex-1 bg-transparent text-sm outline-none"/><button onClick={() => setSearchOpen(false)}><X className="h-4 w-4"/></button></div><div className={`text-xs ${muted}`}>Tìm theo tiêu đề, API, runtime, agents hoặc deployment.</div></div></div>}
  </div>
}
