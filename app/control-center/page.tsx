'use client'

import { useMemo, useState } from 'react'

type Repo = { name: string; owner: string; group: string; status: string; url: string; note: string }
const repos: Repo[] = [
  {
    name: 'VELCLAW',
    owner: 'Velclaw',
    group: 'Core',
    status: 'Canonical',
    url: 'https://github.com/Velclaw/VELCLAW',
    note: 'Workspace trung tâm',
  },
  {
    name: 'VelclawHost',
    owner: 'Velclaw',
    group: 'Infrastructure',
    status: 'Render',
    url: 'https://github.com/Velclaw/VelclawHost',
    note: 'Hosting & deployment control plane',
  },
  {
    name: 'VelCli',
    owner: 'Velclaw',
    group: 'Core',
    status: 'Render',
    url: 'https://github.com/Velclaw/VelCli',
    note: 'AI coding workspace',
  },
  {
    name: 'Velcli-Build',
    owner: 'zskbot',
    group: 'Agents',
    status: 'Render',
    url: 'https://github.com/zskbot/Velcli-Build',
    note: 'Agent build workspace',
  },
  {
    name: 'VELCLAW.COM',
    owner: 'Velclaw',
    group: 'Web',
    status: 'Render ×2',
    url: 'https://github.com/Velclaw/VELCLAW.COM',
    note: 'Website; hai dịch vụ Render cần đối chiếu',
  },
  {
    name: 'repo-Velclaw',
    owner: 'Velclaw',
    group: 'Core',
    status: 'Render ×2',
    url: 'https://github.com/Velclaw/repo-Velclaw',
    note: 'Core/legacy services cần kiểm toán',
  },
  {
    name: 'Oauth',
    owner: 'Velclaw',
    group: 'Identity',
    status: 'Verify',
    url: 'https://github.com/Velclaw/Oauth',
    note: 'OAuth callbacks & session boundary',
  },
  {
    name: 'Autoship',
    owner: 'Velclaw',
    group: 'Automation',
    status: 'Discovered',
    url: 'https://github.com/Velclaw/Autoship',
    note: 'Cần kiểm tra README và deployment',
  },
  {
    name: 'Page',
    owner: 'Velclaw',
    group: 'Web',
    status: 'Discovered',
    url: 'https://github.com/Velclaw/Page',
    note: 'Cần phân loại vai trò',
  },
  {
    name: 'VELCLAW.DEV',
    owner: 'Velclaw',
    group: 'Web',
    status: 'Discovered',
    url: 'https://github.com/Velclaw/VELCLAW.DEV',
    note: 'Cần đối chiếu domain và deployment',
  },
  {
    name: 'Velcat-pro',
    owner: 'Velclaw',
    group: 'Product',
    status: 'Discovered',
    url: 'https://github.com/Velclaw/Velcat-pro',
    note: 'Cần kiểm tra quan hệ sản phẩm',
  },
  {
    name: 'velclaw-mobile',
    owner: 'Velclaw',
    group: 'Product',
    status: 'Discovered',
    url: 'https://github.com/Velclaw/velclaw-mobile',
    note: 'Ứng dụng mobile',
  },
  {
    name: 'IDE',
    owner: 'Velclaw',
    group: 'Product',
    status: 'Private',
    url: 'https://github.com/Velclaw/IDE',
    note: 'Private repository; giữ nguyên quyền truy cập',
  },
  {
    name: 'velclaw-deploy',
    owner: 'Velclaw',
    group: 'Infrastructure',
    status: 'Private',
    url: 'https://github.com/Velclaw/velclaw-deploy',
    note: 'Deployment configuration',
  },
  {
    name: 'docs.velclaw.ai',
    owner: 'Velclaw',
    group: 'Docs',
    status: 'Private',
    url: 'https://github.com/Velclaw/docs.velclaw.ai',
    note: 'Documentation site',
  },
  {
    name: 'SandboxCode',
    owner: 'zskbot',
    group: 'Sandbox',
    status: 'Discovered',
    url: 'https://github.com/zskbot/SandboxCode',
    note: 'Cần xác minh là sản phẩm hay fork',
  },
  {
    name: 'SandboxCodex',
    owner: 'zskbot',
    group: 'Sandbox',
    status: 'Discovered',
    url: 'https://github.com/zskbot/SandboxCodex',
    note: 'Cần đối chiếu với SandboxCode',
  },
  {
    name: 'CodeXsanBox',
    owner: 'zskbot',
    group: 'Sandbox',
    status: 'Discovered',
    url: 'https://github.com/zskbot/CodeXsanBox',
    note: 'Cần phân loại và kiểm tra lịch sử',
  },
  {
    name: 'riks',
    owner: 'zskbot',
    group: 'Agents',
    status: 'Discovered',
    url: 'https://github.com/zskbot/riks',
    note: 'Nhóm RIKS',
  },
  {
    name: 'riks-cli',
    owner: 'zskbot',
    group: 'Agents',
    status: 'Discovered',
    url: 'https://github.com/zskbot/riks-cli',
    note: 'CLI liên quan RIKS',
  },
  {
    name: 'auren-os',
    owner: 'zskbot',
    group: 'Product',
    status: 'Discovered',
    url: 'https://github.com/zskbot/auren-os',
    note: 'Nhóm Auren',
  },
  {
    name: '.auren',
    owner: 'zskbot',
    group: 'Product',
    status: 'Discovered',
    url: 'https://github.com/zskbot/.auren',
    note: 'Cần xác định liên hệ với Auren OS',
  },
  {
    name: 'Hosting',
    owner: 'zskbot',
    group: 'Infrastructure',
    status: 'Discovered',
    url: 'https://github.com/zskbot/Hosting',
    note: 'Có thể liên quan hạ tầng; chưa kết luận',
  },
  {
    name: 'coding-agent-platform',
    owner: 'zskbot',
    group: 'Agents',
    status: 'Private',
    url: 'https://github.com/zskbot/coding-agent-platform',
    note: 'Private repository; chưa kiểm tra triển khai',
  },
]
const nav = [
  'Overview',
  'Repositories',
  'Deployments',
  'Domains & DNS',
  'Databases',
  'Integrations',
  'Security',
  'Audit log',
]
const services = [
  {
    name: 'velclawhost',
    repo: 'Velclaw/VelclawHost',
    url: 'https://velclawhost.onrender.com',
    status: 'Needs deploy check',
    id: 'srv-db2mqafavr4c73eljaa0',
  },
  {
    name: 'velcli',
    repo: 'Velclaw/VelCli',
    url: 'https://velcli.onrender.com',
    status: 'Verify health',
    id: 'srv-db40auqd0e5s73fbabog',
  },
  {
    name: 'velcli-build',
    repo: 'zskbot/Velcli-Build',
    url: 'https://velcli-build.onrender.com',
    status: 'Verify health',
    id: 'srv-db5ffqd9fdbs73cmdn5g',
  },
  {
    name: 'velclaw-com-live',
    repo: 'Velclaw/VELCLAW.COM',
    url: 'https://velclaw-com-live.onrender.com',
    status: 'Route unknown',
    id: 'srv-db2lemmgekts73fdrvtg',
  },
  {
    name: 'velclaw-com',
    repo: 'Velclaw/VELCLAW.COM',
    url: 'https://velclaw-com.onrender.com',
    status: 'Route unknown',
    id: 'srv-db2lcbk9v7es738hrvl0',
  },
  {
    name: 'velclaw-core-v2',
    repo: 'Velclaw/repo-Velclaw',
    url: 'https://velclaw-core-v2.onrender.com',
    status: 'Compare with core',
    id: 'srv-dak2tuh42hec73bqfdcg',
  },
  {
    name: 'velclaw-core',
    repo: 'Velclaw/repo-Velclaw',
    url: 'https://velclaw-core.onrender.com',
    status: 'Compare with core-v2',
    id: 'srv-dak2thqfngtc7381rh9g',
  },
]
export default function ControlCenterPage() {
  const [section, setSection] = useState('Overview')
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('All')
  const [showAllServices, setShowAllServices] = useState(false)
  const filtered = useMemo(
    () =>
      repos.filter(
        (r) =>
          (scope === 'All' || r.owner === scope) &&
          (r.name + ' ' + r.owner + ' ' + r.group + ' ' + r.note).toLowerCase().includes(query.toLowerCase()),
      ),
    [query, scope],
  )
  return (
    <main className="min-h-screen bg-[#080910] text-[#f3f4fa]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-white/8 bg-[#0b0c14] p-5 lg:flex lg:flex-col">
          <a href="/" className="mb-9 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-400/40 bg-violet-400/10 text-lg font-black text-violet-200">
              V
            </div>
            <div>
              <div className="text-sm font-bold tracking-[.16em]">VELCLAW</div>
              <div className="mt-1 text-[10px] tracking-[.22em] text-violet-300">CONTROL CENTER</div>
            </div>
          </a>
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">Workspace</div>
          <nav className="space-y-1">
            {nav.map((n, i) => (
              <button
                key={n}
                onClick={() => setSection(n)}
                className={
                  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ' +
                  (section === n
                    ? 'bg-violet-400/12 text-violet-200 ring-1 ring-violet-300/20'
                    : 'text-white/55 hover:bg-white/5 hover:text-white')
                }
              >
                <span className="w-5 text-center">{['◈', '⌘', '⇧', '◎', '▤', '⌁', '⛨', '≡'][i]}</span>
                {n}
                {n === 'Repositories' && (
                  <span className="ml-auto rounded-md bg-white/8 px-2 py-0.5 text-xs">{repos.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/8 bg-white/[.025] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-300" /> Audit in progress
            </div>
            <p className="text-xs leading-5 text-white/40">
              Danh mục hiện tại là dữ liệu phát hiện ban đầu. Chưa phải kết quả quét toàn bộ API.
            </p>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#080910]/90 px-4 py-4 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-violet-300/30 bg-violet-400/10 font-bold text-violet-200 lg:hidden">
                V
              </div>
              <div>
                <div className="text-xs text-white/40">Workspace / {section}</div>
                <div className="mt-1 text-sm font-semibold">VELCLAW · CONTROL CENTER</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Connected accounts
              </span>
              <a
                className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
                href="https://github.com/Velclaw/VELCLAW"
              >
                Open core repo ↗
              </a>
            </div>
          </header>
          <div className="mx-auto max-w-[1500px] p-4 sm:p-7">
            <div className="mb-7 overflow-hidden rounded-3xl border border-violet-300/15 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,.18),transparent_45%),linear-gradient(135deg,#121322,#0b0c14)] p-6 sm:p-9">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/8 px-3 py-1.5 text-[11px] text-violet-200">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300" /> UNIFIED OPERATIONS
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Một nơi. Toàn bộ hệ sinh thái.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
                Quản lý repository, môi trường chạy, domain, dữ liệu và tích hợp của VELCLAW từ một bảng điều khiển
                thống nhất.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => setSection('Repositories')}
                  className="rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-[#11101b] hover:bg-violet-200"
                >
                  Khám phá repositories →
                </button>
                <button
                  onClick={() => setSection('Deployments')}
                  className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
                >
                  Xem deployments
                </button>
              </div>
            </div>
            <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                {
                  label: 'Repos đã đưa vào danh mục',
                  value: String(repos.length),
                  sub: 'Từ hai nguồn tài khoản được kiểm tra',
                  icon: '⌘',
                },
                { label: 'Render services nhận diện', value: '7+', sub: 'Đã ánh xạ một phần', icon: '⇧' },
                { label: 'Cần xác minh', value: '12', sub: 'Domain, health, quyền truy cập', icon: '◷' },
                { label: 'Hành động phá huỷ', value: '0', sub: 'Không tự xóa hoặc chuyển repo', icon: '⛨' },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-white/8 bg-[#10111a] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs text-white/45">{c.label}</span>
                    <span className="text-lg text-violet-200">{c.icon}</span>
                  </div>
                  <div className="text-3xl font-semibold tracking-tight">{c.value}</div>
                  <div className="mt-2 text-[11px] leading-5 text-white/35">{c.sub}</div>
                </div>
              ))}
            </div>
            {section === 'Overview' && (
              <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl border border-white/8 bg-[#10111a] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">Deployment inventory</h2>
                      <p className="mt-1 text-xs text-white/40">Dịch vụ Render phát hiện trong workspace VELCLAW</p>
                    </div>
                    <button onClick={() => setSection('Deployments')} className="text-xs text-violet-200">
                      Xem tất cả ↗
                    </button>
                  </div>
                  <div className="space-y-2">
                    {services.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/6 bg-white/[.02] p-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{s.name}</div>
                          <div className="mt-1 truncate text-xs text-white/35">{s.repo}</div>
                        </div>
                        <span className="rounded-full border border-amber-300/15 bg-amber-300/5 px-2.5 py-1 text-[10px] text-amber-200">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-[#10111a] p-5">
                  <h2 className="font-semibold">Integration map</h2>
                  <p className="mt-1 text-xs text-white/40">Những hệ thống cần liên kết và xác minh</p>
                  <div className="mt-5 space-y-3">
                    {[
                      { n: 'GitHub', d: 'Repositories, branches, PRs', s: 'Connected' },
                      { n: 'Render', d: 'Services & deploy history', s: 'Connected' },
                      { n: 'Vercel', d: 'Projects & domains', s: 'Connected' },
                      { n: 'Cloudflare', d: 'DNS, Access, Workers', s: 'Audit needed' },
                      { n: 'Supabase / PostgreSQL', d: 'Persistence & migrations', s: 'Verify access' },
                      { n: 'AI providers / OAuth', d: 'Model routing & identity', s: 'Map credentials safely' },
                    ].map((x) => (
                      <div
                        key={x.n}
                        className="flex items-center justify-between gap-3 border-b border-white/6 pb-3 last:border-0"
                      >
                        <div>
                          <div className="text-sm">{x.n}</div>
                          <div className="mt-1 text-xs text-white/35">{x.d}</div>
                        </div>
                        <span className="text-[10px] text-white/45">{x.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {section === 'Repositories' && (
              <div className="rounded-2xl border border-white/8 bg-[#10111a] p-4 sm:p-5">
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Repository registry</h2>
                    <p className="mt-1 text-xs text-white/40">
                      Danh mục khám phá ban đầu — chưa bao gồm toàn bộ kết quả phân trang
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#0b0c14] px-3 py-2 text-xs"
                    >
                      <option>All</option>
                      <option>Velclaw</option>
                      <option>zskbot</option>
                    </select>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Tìm repository..."
                      className="min-w-0 rounded-xl border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-violet-300/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {filtered.map((r) => (
                    <div
                      key={r.owner + r.name}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-white/6 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:text-violet-200"
                          >
                            {r.owner}/{r.name} ↗
                          </a>
                          <span className="rounded-md bg-white/6 px-2 py-1 text-[10px] text-white/45">{r.group}</span>
                          <span className="rounded-md border border-white/8 px-2 py-1 text-[10px] text-white/45">
                            {r.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-white/40">{r.note}</p>
                      </div>
                      <div className="text-[10px] text-white/35">Default branch chưa đồng bộ</div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <p className="py-10 text-center text-sm text-white/40">Không tìm thấy repository phù hợp.</p>
                  )}
                </div>
              </div>
            )}
            {section === 'Deployments' && (
              <div className="rounded-2xl border border-white/8 bg-[#10111a] p-4 sm:p-5">
                <h2 className="text-lg font-semibold">Render services</h2>
                <p className="mb-5 mt-1 text-xs text-white/40">
                  Thông tin service được đọc từ workspace Render; tình trạng HTTP chưa được kiểm tra trực tiếp tại đây.
                </p>
                <div className="space-y-3">
                  {(showAllServices ? services : services.slice(0, 5)).map((s) => (
                    <div key={s.id} className="rounded-xl border border-white/7 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="mt-1 text-xs text-white/40">{s.repo}</div>
                          <div className="mt-2 break-all text-xs text-violet-200">{s.url}</div>
                          <div className="mt-2 font-mono text-[10px] text-white/25">{s.id}</div>
                        </div>
                        <a
                          href={'https://dashboard.render.com/web/' + s.id}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
                        >
                          Render dashboard ↗
                        </a>
                      </div>
                      <div className="mt-3 text-xs text-amber-200/80">● {s.status}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs"
                >
                  {showAllServices ? 'Thu gọn' : 'Hiện tất cả dịch vụ đã phát hiện'}
                </button>
              </div>
            )}
            {!['Overview', 'Repositories', 'Deployments'].includes(section) && (
              <div className="rounded-2xl border border-white/8 bg-[#10111a] p-6 sm:p-8">
                <div className="mb-3 text-xs uppercase tracking-[.2em] text-violet-200">Module · {section}</div>
                <h2 className="text-2xl font-semibold">Đang chờ kiểm kê tài nguyên</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
                  Module này sẽ hiển thị dữ liệu thật sau khi xác định được toàn bộ tài khoản, quyền API, domain,
                  database và quan hệ giữa các service. Không hiển thị trạng thái giả hoặc tự thay đổi cấu hình sản
                  xuất.
                </p>
                <div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-sm text-amber-100/80">
                  Cần hoàn tất quét phân trang GitHub và kiểm tra quyền Cloudflare/database trước khi coi module này là
                  đã tích hợp.
                </div>
              </div>
            )}
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-white/8 py-5 text-[11px] text-white/30 sm:flex-row">
              <span>VELCLAW · CONTROL CENTER — ecosystem operations</span>
              <span>Audit snapshot · 12 Oct 2026 · Partial inventory / not production verification</span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  )
}
