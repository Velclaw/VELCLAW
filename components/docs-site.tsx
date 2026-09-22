'use client'

import Link from 'next/link'
import { Check, ChevronDown, Copy, FileText, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const pages = [
  { href: '/docs', label: 'Giới thiệu', group: 'Bắt đầu' },
  { href: '/docs/bat-dau', label: 'Bắt đầu sử dụng', group: 'Bắt đầu' },
  { href: '/docs/cai-dat', label: 'Cài đặt', group: 'Bắt đầu' },
  { href: '/docs/cau-hinh', label: 'Cấu hình dự án', group: 'Xây dựng' },
  { href: '/docs/trien-khai', label: 'Triển khai', group: 'Xây dựng' },
] as const

type PageKey = (typeof pages)[number]['href']

function CopyButton({ value, label = 'Sao chép' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
      aria-label={label}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="my-4 flex items-center gap-3 border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-emerald-300">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{children}</code>
      <CopyButton value={children} label="Sao chép lệnh" />
    </div>
  )
}

function AgentPromptCard() {
  const [expanded, setExpanded] = useState(false)
  const prompt =
    'Hãy giúp tôi thiết lập Velclaw. Dựa trên dự án của tôi, hãy cài đặt các gói cần thiết, kiểm tra cấu hình và xác nhận bản build trước khi triển khai.'

  return (
    <section className="my-6 border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-sm text-zinc-400">
        <span className="flex items-center gap-2">
          <FileText className="size-4" />
          Lời nhắc của tác nhân
        </span>
        <CopyButton value={prompt} />
      </div>
      <p className={`pt-3 text-sm leading-6 text-zinc-300 ${expanded ? '' : 'line-clamp-2'}`}>{prompt}</p>
      <button
        type="button"
        className="mt-3 w-full border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? 'Ẩn bớt' : 'Hiển thị thêm'}
      </button>
    </section>
  )
}

function Article({ page }: { page: PageKey }) {
  if (page === '/docs/bat-dau')
    return (
      <>
        <p>
          Triển khai dự án Velclaw theo ba bước: chuẩn bị môi trường, xác thực nền tảng triển khai và xác nhận bản
          build.
        </p>
        <AgentPromptCard />
        <h2>Điều kiện tiên quyết</h2>
        <ul>
          <li>Một tài khoản Vercel.</li>
          <li>Node.js 20 trở lên và pnpm 10.</li>
        </ul>
        <h2>1. Cài đặt phụ thuộc</h2>
        <CodeBlock>pnpm install</CodeBlock>
        <h2>2. Kiểm tra dự án</h2>
        <CodeBlock>pnpm type-check && pnpm lint && pnpm build</CodeBlock>
        <h2>3. Triển khai</h2>
        <CodeBlock>pnpm exec vercel --prod</CodeBlock>
      </>
    )
  if (page === '/docs/cai-dat')
    return (
      <>
        <p>Thiết lập môi trường phát triển cục bộ cho Velclaw bằng các công cụ được dự án hỗ trợ.</p>
        <h2>Sao chép kho lưu trữ</h2>
        <CodeBlock>git clone https://github.com/Velclaw/VELCLAW.git</CodeBlock>
        <h2>Cài đặt các gói phụ thuộc</h2>
        <CodeBlock>pnpm install</CodeBlock>
        <h2>Xác thực bản build</h2>
        <CodeBlock>pnpm build</CodeBlock>
        <p>
          Không chạy máy chủ phát triển trong môi trường tự động. Bạn có thể chạy lệnh phát triển trên máy cục bộ của
          mình.
        </p>
      </>
    )
  if (page === '/docs/cau-hinh')
    return (
      <>
        <p>Velclaw sử dụng Next.js. Cấu hình chạy được quản lý bằng biến môi trường và tệp cấu hình ở thư mục gốc.</p>
        <h2>Biến môi trường</h2>
        <p>
          Tạo tệp <code>.env.local</code> từ các biến môi trường cần thiết cho dịch vụ bạn bật.
        </p>
        <CodeBlock>NEXT_PUBLIC_AUTH_PROVIDERS=github,vercel</CodeBlock>
        <h2>Cấu hình triển khai</h2>
        <p>
          Xem <Link href="/docs/VELCLAW_DEPLOY">hướng dẫn triển khai chi tiết</Link> để biết các yêu cầu về miền, kiểm
          tra runtime và môi trường production.
        </p>
      </>
    )
  if (page === '/docs/trien-khai')
    return (
      <>
        <p>Đưa Velclaw lên Vercel sau khi các kiểm tra định dạng, kiểu dữ liệu, lint và build đã thành công.</p>
        <h2>Triển khai qua CLI</h2>
        <CodeBlock>pnpm exec vercel --prod</CodeBlock>
        <h2>Triển khai tự động từ GitHub</h2>
        <ul>
          <li>Import kho Velclaw vào Vercel Dashboard.</li>
          <li>Chọn framework Next.js.</li>
          <li>Thiết lập các biến môi trường production trong Vercel.</li>
          <li>Mỗi lần push lên nhánh production sẽ tạo một deployment mới.</li>
        </ul>
        <h2>Lệnh build</h2>
        <CodeBlock>pnpm build</CodeBlock>
      </>
    )
  return (
    <>
      <p>
        Velclaw là workspace AI-native cho agents, code, builds, runtime, review và delivery. Tài liệu này giúp bạn
        thiết lập và triển khai workspace một cách an toàn.
      </p>
      <h2>Bắt đầu từ đâu</h2>
      <ul>
        <li>
          <Link href="/docs/bat-dau">Bắt đầu sử dụng</Link> — chuẩn bị dự án và triển khai lần đầu.
        </li>
        <li>
          <Link href="/docs/cai-dat">Cài đặt</Link> — yêu cầu môi trường và các bước chuẩn bị.
        </li>
        <li>
          <Link href="/docs/trien-khai">Triển khai</Link> — đưa dự án lên Vercel.
        </li>
      </ul>
      <h2>Tài liệu kỹ thuật</h2>
      <p>
        Khám phá <Link href="/docs/VELCLAW_CONTEXT">ngữ cảnh dự án</Link>,{' '}
        <Link href="/docs/VELCLAW_DEPLOY">quy trình deploy</Link> và{' '}
        <Link href="/docs/VELCLAW_ECOSYSTEM">hệ sinh thái</Link>.
      </p>
    </>
  )
}

export function DocsSite() {
  const pathname = usePathname()
  const currentPage = (pages.find((page) => page.href === pathname) ?? pages[0]) as (typeof pages)[number]
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-800 bg-black/95 px-4 backdrop-blur">
        <Link href="/docs" className="flex min-w-0 items-center gap-2 text-sm" aria-label="Trang chủ tài liệu Velclaw">
          <span className="text-lg font-bold">△</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">Docs</span>
          {currentPage.href !== '/docs' && (
            <>
              <span className="text-zinc-600">/</span>
              <span className="truncate">{currentPage.label}</span>
            </>
          )}
        </Link>
        <button
          type="button"
          className="p-2 text-zinc-300 hover:text-white"
          onClick={() => setMenuOpen(true)}
          aria-label="Mở menu tài liệu"
        >
          <Menu className="size-5" />
        </button>
      </header>
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Điều hướng tài liệu"
        >
          <div className="flex h-10 items-center justify-between border-b border-zinc-800">
            <Link href="/docs" onClick={() => setMenuOpen(false)} className="text-sm">
              △ <span className="text-zinc-500">/ Docs</span>
            </Link>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="mt-6 space-y-6">
            {['Bắt đầu', 'Xây dựng'].map((group) => (
              <div key={group}>
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">{group}</p>
                {pages
                  .filter((page) => page.group === group)
                  .map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-2 py-2 text-sm ${page.href === currentPage.href ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {page.label}
                    </Link>
                  ))}
              </div>
            ))}
          </nav>
        </div>
      )}
      <main className="mx-auto max-w-3xl px-5 py-7 pb-20">
        <div className="mb-8 flex gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="inline-flex items-center gap-2 border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            <Copy className="size-3.5" />
            Sao chép trang
          </button>
          <span className="inline-flex items-center gap-1 border border-zinc-800 px-3 py-2 text-sm text-zinc-500">
            Trên trang này <ChevronDown className="size-3.5" />
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {currentPage.label === 'Giới thiệu' ? 'Giới thiệu Velclaw' : currentPage.label}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Tài liệu chính thức cho Velclaw — mọi thứ bạn cần để cài đặt, cấu hình và triển khai workspace.
        </p>
        <article className="docs-prose mt-8">
          <Article page={currentPage.href} />
        </article>
      </main>
    </div>
  )
}
