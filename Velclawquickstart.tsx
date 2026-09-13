import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sun,
  Moon,
  Github,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Menu,
  X,
  Rocket,
  BookOpen,
  Boxes,
  Bot,
  Cpu,
  GitBranch,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Bắt đầu',
    items: [
      { id: 'index', label: 'Tổng quan', icon: BookOpen },
      { id: 'quickstart', label: 'Quickstart', icon: Rocket, active: true },
    ],
  },
  {
    label: 'Nền tảng',
    items: [
      { id: 'workspace', label: 'Không gian làm việc', icon: Boxes },
      { id: 'agents', label: 'Agents', icon: Bot },
      { id: 'build-runtime', label: 'Build & Runtime', icon: Cpu },
    ],
  },
  {
    label: 'Tích hợp',
    items: [
      { id: 'github-delivery', label: 'GitHub Delivery', icon: GitBranch },
      { id: 'security', label: 'Bảo mật', icon: ShieldCheck },
    ],
  },
];

const TOC = [
  { id: 'cai-dat', label: 'Cài đặt CLI' },
  { id: 'xac-thuc', label: 'Xác thực tài khoản' },
  { id: 'ket-noi', label: 'Kết nối kho mã nguồn' },
  { id: 'tac-vu-dau-tien', label: 'Tạo tác vụ đầu tiên' },
  { id: 'xem-lai', label: 'Xem lại và merge' },
  { id: 'buoc-tiep-theo', label: 'Bước tiếp theo' },
];

const STEPS = [
  {
    id: 'cai-dat',
    num: '1',
    title: 'Cài đặt CLI',
    body: 'Cài Velclaw CLI toàn cục bằng npm. Yêu cầu Node.js 18 trở lên.',
    code: 'npm install -g velclaw',
  },
  {
    id: 'xac-thuc',
    num: '2',
    title: 'Xác thực tài khoản',
    body: 'Đăng nhập bằng tài khoản Git provider của bạn. Lệnh này sẽ mở trình duyệt để xác thực.',
    code: 'velclaw login',
  },
  {
    id: 'ket-noi',
    num: '3',
    title: 'Kết nối kho mã nguồn',
    body: 'Trỏ Velclaw tới kho mã nguồn bạn muốn agent làm việc cùng.',
    code: 'velclaw connect github.com/your-org/your-repo',
  },
  {
    id: 'tac-vu-dau-tien',
    num: '4',
    title: 'Tạo tác vụ đầu tiên',
    body: 'Mô tả thay đổi bạn muốn bằng ngôn ngữ tự nhiên, agent sẽ chạy trong một worktree cô lập.',
    code: 'velclaw task create "Sửa lỗi xác thực JWT"',
  },
  {
    id: 'xem-lai',
    num: '5',
    title: 'Xem lại và merge',
    body: 'Agent mở pull request kèm mô tả thay đổi. Gito kiểm tra chất lượng và bảo mật trước khi bạn merge, không có bước nào tự động bỏ qua review.',
    code: null,
  },
];

const NEXT_CARDS = [
  { icon: Boxes, title: 'Không gian làm việc', desc: 'Tìm hiểu cách worktree cô lập bảo vệ mã nguồn của bạn.' },
  { icon: Bot, title: 'Agents', desc: 'Chọn giữa model cloud hoặc chạy Ollama cục bộ.' },
  { icon: ShieldCheck, title: 'Bảo mật', desc: 'Cách Velclaw giới hạn quyền truy cập và bảo vệ secrets.' },
];

function useTheme() {
  const [dark, setDark] = useState(true);
  return { dark, toggle: () => setDark((d) => !d) };
}

function CodeBlock({ code, dark }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={`mt-3 rounded-lg border overflow-hidden ${dark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'}`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b ${dark ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <span className={`font-mono text-xs ${dark ? 'text-neutral-500' : 'text-neutral-400'}`}>bash</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs transition-colors active:scale-95 ${dark ? 'text-neutral-500 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-700'}`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-red-500" /> Đã sao chép
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Sao chép
            </>
          )}
        </button>
      </div>
      <div className="px-4 py-3 font-mono text-sm overflow-x-auto">
        <span className="text-red-500">$</span>{' '}
        <span className={dark ? 'text-neutral-200' : 'text-neutral-800'}>{code}</span>
      </div>
    </div>
  );
}

export default function VelclawQuickstart() {
  const { dark, toggle } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cai-dat');
  const [feedback, setFeedback] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      let current = TOC[0].id;
      for (const item of TOC) {
        const el = sectionRefs.current[item.id];
        if (el && el.getBoundingClientRect().top < 140) current = item.id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileNavOpen(false);
  };

  const bg = dark ? 'bg-neutral-950' : 'bg-white';
  const text = dark ? 'text-neutral-200' : 'text-neutral-800';
  const border = dark ? 'border-neutral-800' : 'border-neutral-200';
  const muted = dark ? 'text-neutral-500' : 'text-neutral-500';
  const sidebarBg = dark ? 'bg-neutral-950' : 'bg-white';
  const surface = dark ? 'bg-neutral-900' : 'bg-neutral-50';

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors`}>
      <style>{`
        @keyframes vc-fade { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
        .vc-fade { animation: vc-fade 200ms ease both; }
        a:focus-visible, button:focus-visible { outline: 2px solid #ef4444; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .vc-fade { animation: none; } }
      `}</style>

      {/* Top bar */}
      <header className={`sticky top-0 z-40 border-b ${border} ${bg}/95 backdrop-blur`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => setMobileNavOpen(true)}
            className={`lg:hidden h-8 w-8 flex items-center justify-center rounded-md border ${border} active:scale-95 transition-transform`}
            aria-label="Mở menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-6 w-6 rounded-md bg-neutral-950 ring-1 ring-neutral-800 flex items-center justify-center">
              <svg viewBox="0 0 48 48" width="14" height="14" fill="none">
                <path d="M7 6 L17 24 L11 44" stroke="#ef4444" strokeWidth="6" strokeLinecap="square" />
                <path d="M20 4 L30 24 L22 44" stroke="#dc2626" strokeWidth="6" strokeLinecap="square" />
                <path d="M33 6 L43 22 L35 40" stroke="#b91c1c" strokeWidth="6" strokeLinecap="square" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Velclaw</span>
          </div>

          <nav className={`hidden md:flex items-center gap-1 text-sm ${muted}`}>
            <span className={`px-3 py-1.5 rounded-md font-medium ${dark ? 'text-neutral-100 bg-neutral-900' : 'text-neutral-900 bg-neutral-100'}`}>Tài liệu</span>
            <span className="px-3 py-1.5 rounded-md hover:opacity-80 cursor-pointer">Tham chiếu API</span>
          </nav>

          <div className="flex-1" />

          <button
            onClick={() => setSearchOpen(true)}
            className={`hidden sm:flex items-center gap-2 w-64 px-3 py-1.5 rounded-md border ${border} ${muted} text-sm hover:border-neutral-500 transition-colors`}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Tìm kiếm...</span>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${border}`}>⌘K</span>
          </button>

          <button onClick={() => setSearchOpen(true)} className="sm:hidden h-8 w-8 flex items-center justify-center">
            <Search className="h-4 w-4" />
          </button>

          <a href="https://github.com" aria-label="GitHub" className={`h-8 w-8 hidden sm:flex items-center justify-center rounded-md hover:${surface} transition-colors`}>
            <Github className="h-4 w-4" />
          </a>

          <button
            onClick={toggle}
            aria-label="Đổi giao diện sáng/tối"
            className={`h-8 w-8 flex items-center justify-center rounded-md border ${border} active:scale-95 transition-transform`}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <a
            href="https://velclaw.cfd/deploy"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all active:scale-95"
          >
            Bắt đầu
          </a>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar - desktop */}
        <aside className={`hidden lg:block w-64 shrink-0 border-r ${border} h-[calc(100vh-56px)] sticky top-14 overflow-y-auto py-8 pr-4`}>
          <SidebarNav dark={dark} muted={muted} />
        </aside>

        {/* Sidebar - mobile drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
            <div className={`relative w-72 h-full ${bg} border-r ${border} p-6 overflow-y-auto vc-fade`}>
              <button onClick={() => setMobileNavOpen(false)} className="mb-6 h-8 w-8 flex items-center justify-center rounded-md border border-current/20">
                <X className="h-4 w-4" />
              </button>
              <SidebarNav dark={dark} muted={muted} onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 md:px-10 py-10 max-w-3xl">
          <div className={`flex items-center gap-1.5 text-xs ${muted} mb-4`}>
            <span>Tài liệu</span>
            <ChevronRight className="h-3 w-3" />
            <span>Bắt đầu</span>
            <ChevronRight className="h-3 w-3" />
            <span className={dark ? 'text-neutral-300' : 'text-neutral-700'}>Quickstart</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Rocket className="h-4 w-4 text-red-500" />
            <span className="font-mono text-xs text-red-500">5 phút để hoàn thành</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Quickstart</h1>
          <p className={`text-lg ${muted} leading-relaxed mb-8`}>
            Cài đặt CLI, kết nối một kho mã nguồn, và để agent đầu tiên mở pull request của bạn.
          </p>

          <div className={`rounded-lg border-l-4 border-l-sky-500 ${border} border ${surface} px-4 py-3 mb-10 text-sm`}>
            <strong className="font-semibold">Yêu cầu:</strong> Node.js 18 trở lên, và quyền admin trên kho mã nguồn bạn muốn kết nối.
          </div>

          <div className="space-y-10">
            {STEPS.map((step) => (
              <div
                key={step.id}
                ref={(el) => (sectionRefs.current[step.id] = el)}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold ${activeSection === step.id ? 'bg-red-600 text-white' : `${surface} ${muted}`}`}>
                    {step.num}
                  </span>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
                <p className={`${muted} leading-relaxed pl-9`}>{step.body}</p>
                {step.code && <div className="pl-9"><CodeBlock code={step.code} dark={dark} /></div>}
              </div>
            ))}
          </div>

          <div ref={(el) => (sectionRefs.current['buoc-tiep-theo'] = el)} className="mt-16 scroll-mt-24">
            <h2 className="font-semibold text-xl mb-5">Bước tiếp theo</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {NEXT_CARDS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <a
                    key={idx}
                    href="#"
                    className={`group rounded-lg border ${border} p-4 hover:border-red-500/50 transition-colors`}
                  >
                    <Icon className="h-4 w-4 text-red-500 mb-3" />
                    <div className="flex items-center gap-1 font-medium text-sm mb-1">
                      {card.title}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className={`text-xs ${muted} leading-relaxed`}>{card.desc}</p>
                  </a>
                );
              })}
            </div>
          </div>

          <div className={`mt-16 pt-6 border-t ${border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div className={`flex items-center gap-4 text-sm ${muted}`}>
              <a href="#" className="hover:text-red-500 transition-colors">Chỉnh sửa trang này</a>
              <a href="#" className="hover:text-red-500 transition-colors">Sao chép dưới dạng Markdown</a>
            </div>
            <div className={`flex items-center gap-2 text-sm ${muted}`}>
              <span>Trang này hữu ích chứ?</span>
              <button
                onClick={() => setFeedback('up')}
                className={`h-7 w-7 flex items-center justify-center rounded-md border transition-colors active:scale-95 ${feedback === 'up' ? 'border-red-500 text-red-500' : `${border}`}`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setFeedback('down')}
                className={`h-7 w-7 flex items-center justify-center rounded-md border transition-colors active:scale-95 ${feedback === 'down' ? 'border-red-500 text-red-500' : `${border}`}`}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
              {feedback && <span className="text-xs vc-fade">Cảm ơn phản hồi!</span>}
            </div>
          </div>
        </main>

        {/* TOC - desktop */}
        <aside className="hidden xl:block w-56 shrink-0 py-10 pl-6">
          <div className="sticky top-20">
            <p className={`text-xs font-medium ${muted} mb-3`}>Trên trang này</p>
            <ul className="space-y-2 text-sm">
              {TOC.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`text-left transition-colors ${activeSection === item.id ? 'text-red-500 font-medium' : `${muted} hover:${dark ? 'text-neutral-300' : 'text-neutral-700'}`}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSearchOpen(false)} />
          <div className={`relative w-full max-w-lg rounded-lg border ${border} ${bg} shadow-2xl vc-fade overflow-hidden`}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${border}`}>
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                autoFocus
                placeholder="Tìm kiếm tài liệu..."
                className={`flex-1 bg-transparent outline-none text-sm ${text} placeholder:${muted}`}
              />
              <button onClick={() => setSearchOpen(false)} className={`text-xs px-1.5 py-0.5 rounded border ${border} ${muted}`}>ESC</button>
            </div>
            <div className="p-2">
              {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSearchOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:${surface} transition-colors text-left`}
                  >
                    <Icon className="h-4 w-4 text-neutral-500" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNav({ dark, muted, onNavigate }) {
  return (
    <nav className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className={`text-xs font-medium ${muted} mb-2 px-2`}>{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={onNavigate}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      item.active
                        ? 'bg-red-600/10 text-red-500 font-medium'
                        : `${muted} hover:${dark ? 'text-neutral-200 hover:bg-neutral-900' : 'text-neutral-700 hover:bg-neutral-100'}`
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}