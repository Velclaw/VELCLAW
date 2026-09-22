'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Copy,
  Globe2,
  Link2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Terminal,
  Trash2,
  Wifi,
  X,
  Zap,
} from 'lucide-react'

type DomainStatus = 'active' | 'pending' | 'attention'

type Domain = {
  name: string
  tld: string
  registrar: string
  status: DomainStatus
  expires: string
  autoRenew: boolean
  nameservers: string[]
  dns: number
  ssl: 'live' | 'pending'
  target: string
}

const seedDomains: Domain[] = [
  {
    name: 'velclaw.com',
    tld: '.com',
    registrar: 'Connected registrar',
    status: 'active',
    expires: '2027-08-14',
    autoRenew: true,
    nameservers: ['ns1.velclaw.cfd', 'ns2.velclaw.cfd'],
    dns: 8,
    ssl: 'live',
    target: 'Production',
  },
  {
    name: 'velclaw.app',
    tld: '.app',
    registrar: 'Connected registrar',
    status: 'active',
    expires: '2027-10-03',
    autoRenew: true,
    nameservers: ['ns1.velclaw.cfd', 'ns2.velclaw.cfd'],
    dns: 6,
    ssl: 'live',
    target: 'Application',
  },
  {
    name: 'velclaw.dev',
    tld: '.dev',
    registrar: 'Connected registrar',
    status: 'attention',
    expires: '2027-03-28',
    autoRenew: false,
    nameservers: ['Pending registrar sync', 'Pending registrar sync'],
    dns: 2,
    ssl: 'pending',
    target: 'Developer',
  },
]

const dnsRecords = [
  ['A', '@', '76.76.21.21', '300'],
  ['CNAME', 'www', 'cname.velclaw.host', '300'],
  ['CNAME', 'docs', 'docs.velclaw.cfd', '300'],
  ['TXT', '@', 'velclaw-verification=••••••••', '3600'],
  ['MX', '@', 'mx1.mail.provider', '3600'],
]

/** Renders the label and color treatment for a domain status. */
function StatusBadge({ status }: { status: DomainStatus }) {
  const map = {
    active: { label: 'Active', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
    pending: { label: 'Pending', cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
    attention: { label: 'Needs attention', cls: 'border-red-400/30 bg-red-400/10 text-red-300' },
  }
  const item = map[status]
  return <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${item.cls}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {item.label}
  </span>
}

/** Renders an interactive domain-management prototype backed by in-memory seed data. */
export function DomainControlPlane() {
  const [domains, setDomains] = useState(seedDomains)
  const [selected, setSelected] = useState(seedDomains[0])
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'overview' | 'dns' | 'nameservers' | 'settings'>('overview')
  const [showAdd, setShowAdd] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [notice, setNotice] = useState('')

  const filtered = useMemo(
    () => domains.filter((domain) => domain.name.toLowerCase().includes(query.toLowerCase())),
    [domains, query],
  )

  /** Selects a domain and returns its detail view to the overview tab. */
  const selectDomain = (domain: Domain) => {
    setSelected(domain)
    setTab('overview')
  }

  /** Adds valid-looking input as a pending in-memory domain and selects it. */
  const addDomain = () => {
    const normalized = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!normalized || !normalized.includes('.')) return

    const tld = '.' + normalized.split('.').pop()
    const domain: Domain = {
      name: normalized,
      tld,
      registrar: 'Awaiting connection',
      status: 'pending',
      expires: 'Not synced',
      autoRenew: false,
      nameservers: ['Configure at registrar', 'Configure at registrar'],
      dns: 0,
      ssl: 'pending',
      target: 'Unassigned',
    }

    setDomains((current) => [...current, domain])
    setSelected(domain)
    setNewDomain('')
    setShowAdd(false)
    setTab('overview')
    setNotice(`${normalized} added to the Velclaw control plane`)
    window.setTimeout(() => setNotice(''), 3200)
  }

  /** Writes a nameserver to the Clipboard API when available, then shows a transient notice. */
  const copyNameserver = async (value: string) => {
    await navigator.clipboard?.writeText(value)
    setNotice(`${value} copied`)
    window.setTimeout(() => setNotice(''), 2200)
  }

  return (
    <main className="min-h-screen bg-[#08070d] text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-[1480px]">
        <aside className="hidden w-[252px] shrink-0 border-r border-white/10 bg-[#0b0a10] lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
            <div className="grid h-8 w-8 place-items-center border border-violet-400/50 bg-violet-500/10 text-sm font-black text-violet-200">V</div>
            <div>
              <div className="text-sm font-bold tracking-wide">VELCLAW</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Control Plane</div>
            </div>
          </div>

          <div className="px-3 py-4">
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Workspace</div>
            {[
              ['Domains', Globe2],
              ['Hosting', Server],
              ['Deployments', Zap],
              ['Infrastructure', Activity],
            ].map(([label, Icon]) => (
              <button
                key={String(label)}
                className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-sm ${label === 'Domains' ? 'border-violet-400 bg-violet-500/10 text-violet-200' : 'border-transparent text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200'}`}
              >
                <Icon size={16} />
                {String(label)}
              </button>
            ))}
          </div>

          <div className="mt-auto border-t border-white/10 p-4">
            <div className="mb-3 text-[10px] uppercase tracking-[0.16em] text-zinc-600">DNS boundary</div>
            <div className="border border-violet-400/20 bg-violet-500/[0.04] p-3">
              <div className="flex items-center gap-2 text-xs text-zinc-300"><Wifi size={13} className="text-violet-300" /> Velclaw DNS</div>
              <div className="mt-1 font-mono text-[10px] text-zinc-600">ns1.velclaw.cfd</div>
              <div className="font-mono text-[10px] text-zinc-600">ns2.velclaw.cfd</div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0a0910]/95 px-4 py-3 backdrop-blur lg:px-7">
            <div className="flex items-center gap-3">
              <div className="lg:hidden grid h-8 w-8 place-items-center border border-violet-400/50 bg-violet-500/10 font-black text-violet-200">V</div>
              <div>
                <div className="text-xs text-zinc-500">Velclaw / Workspace</div>
                <h1 className="text-base font-semibold tracking-tight">Domain Manager</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden items-center gap-2 border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:border-violet-400/40 hover:text-zinc-100 sm:flex">
                <RefreshCw size={13} /> Sync all
              </button>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-violet-500 px-3 py-2 text-xs font-bold text-white hover:bg-violet-400">
                <Plus size={14} /> Add domain
              </button>
            </div>
          </header>

          <div className="border-b border-white/10 bg-[#0b0a10] px-4 py-5 lg:px-7">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Domains', String(domains.length), 'All managed domains', Globe2],
                ['Healthy', String(domains.filter((d) => d.status === 'active').length), 'DNS + SSL operational', ShieldCheck],
                ['DNS records', String(domains.reduce((sum, d) => sum + d.dns, 0)), 'Across all domains', Activity],
                ['Attention', String(domains.filter((d) => d.status === 'attention').length), 'Requires action', CircleAlert],
              ].map(([label, value, sub, Icon]) => (
                <div key={String(label)} className="border border-white/10 bg-white/[0.018] p-4">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] uppercase tracking-[0.14em]">{String(label)}</span>
                    <Icon size={15} />
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">{String(value)}</div>
                  <div className="mt-1 text-[11px] text-zinc-600">{String(sub)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-h-[calc(100vh-156px)] xl:grid-cols-[340px_1fr]">
            <div className="border-r border-white/10 bg-[#0a0910]">
              <div className="border-b border-white/10 p-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-3 text-zinc-600" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search domains..." className="w-full border border-white/10 bg-white/[0.025] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-zinc-700 focus:border-violet-400/50" />
                </div>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {filtered.map((domain) => (
                  <button key={domain.name} onClick={() => selectDomain(domain)} className={`block w-full p-4 text-left hover:bg-white/[0.025] ${selected.name === domain.name ? 'bg-violet-500/[0.06] shadow-[inset_2px_0_0_#a78bfa]' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-sm font-semibold">{domain.name}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-600">{domain.registrar}</div>
                      </div>
                      <StatusBadge status={domain.status} />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-600">
                      <span>{domain.dns} DNS records</span>
                      <span>{domain.ssl === 'live' ? 'SSL live' : 'SSL pending'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="border-b border-white/10 bg-[#0d0b12] px-5 pt-5 lg:px-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-mono text-xl font-semibold">{selected.name}</h2>
                      <StatusBadge status={selected.status} />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">Centralized registration, DNS, nameserver and hosting routing.</p>
                  </div>
                  <button className="flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:border-violet-400/40 hover:text-white">
                    <MoreHorizontal size={14} /> Actions <ChevronDown size={13} />
                  </button>
                </div>

                <nav className="mt-6 flex gap-1 overflow-x-auto">
                  {(['overview', 'dns', 'nameservers', 'settings'] as const).map((item) => (
                    <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${tab === item ? 'border-violet-400 text-violet-200' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}>
                      {item === 'nameservers' ? 'Nameservers' : item}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-5 lg:p-7">
                {tab === 'overview' && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {[
                        ['Registrar', selected.registrar, 'Registration provider'],
                        ['Expiration', selected.expires, selected.autoRenew ? 'Auto-renew enabled' : 'Auto-renew disabled'],
                        ['Routing target', selected.target, 'Velclaw service'],
                      ].map(([label, value, sub]) => (
                        <div key={String(label)} className="border border-white/10 bg-white/[0.018] p-4">
                          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">{String(label)}</div>
                          <div className="mt-2 text-sm font-semibold text-zinc-200">{String(value)}</div>
                          <div className="mt-1 text-[11px] text-zinc-600">{String(sub)}</div>
                        </div>
                      ))}
                    </div>

                    {selected.status === 'attention' && (
                      <div className="flex gap-3 border border-red-400/20 bg-red-400/[0.05] p-4">
                        <CircleAlert size={17} className="mt-0.5 shrink-0 text-red-300" />
                        <div>
                          <div className="text-sm font-semibold text-red-200">Registrar sync required</div>
                          <div className="mt-1 text-xs leading-5 text-zinc-500">Connect the registrar account for this domain so Velclaw can reconcile expiration, nameserver and DNS state.</div>
                          <button onClick={() => setNotice('Registrar connection flow queued')} className="mt-3 border border-red-300/20 px-3 py-2 text-xs text-red-200 hover:bg-red-400/10">Connect registrar</button>
                        </div>
                      </div>
                    )}

                    <div className="border border-white/10">
                      <div className="flex items-center justify-between border-b border-white/10 p-4">
                        <div>
                          <div className="text-sm font-semibold">DNS health</div>
                          <div className="mt-1 text-[11px] text-zinc-600">Authoritative routing and edge status</div>
                        </div>
                        <span className="flex items-center gap-2 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-current" /> Operational</span>
                      </div>
                      <div className="grid divide-y divide-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {[
                          ['Authoritative DNS', 'Velclaw DNS'],
                          ['Nameservers', selected.nameservers[0].includes('Pending') ? 'Not configured' : '2 active'],
                          ['SSL', selected.ssl === 'live' ? 'Live' : 'Pending'],
                        ].map(([label, value]) => (
                          <div key={String(label)} className="p-4">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">{String(label)}</div>
                            <div className="mt-2 text-sm font-medium">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'dns' && (
                  <div className="border border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                      <div><div className="text-sm font-semibold">DNS records</div><div className="mt-1 text-[11px] text-zinc-600">Manage A, AAAA, CNAME, MX, TXT and other records.</div></div>
                      <button onClick={() => setNotice('DNS record editor opened')} className="flex items-center gap-2 bg-violet-500 px-3 py-2 text-xs font-bold"><Plus size={13} /> Add record</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left text-xs">
                        <thead className="border-b border-white/10 bg-white/[0.018] text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                          <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">TTL</th><th className="px-4 py-3" /></tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                          {dnsRecords.map(([type, name, value, ttl]) => (
                            <tr key={`${type}-${name}`} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-3 font-mono text-violet-300">{type}</td><td className="px-4 py-3 font-mono text-zinc-400">{name}</td><td className="px-4 py-3 font-mono text-zinc-300">{value}</td><td className="px-4 py-3 text-zinc-600">{ttl}</td><td className="px-4 py-3 text-right"><button onClick={() => setNotice(`Editing ${type} ${name}`)}><Settings2 size={14} className="text-zinc-600 hover:text-zinc-200" /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === 'nameservers' && (
                  <div className="space-y-5">
                    <div className="border border-violet-400/20 bg-violet-500/[0.04] p-5">
                      <div className="flex gap-3">
                        <Server size={18} className="mt-0.5 text-violet-300" />
                        <div><div className="text-sm font-semibold">Authoritative nameservers</div><div className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">Point the registrar for <span className="font-mono text-zinc-300">{selected.name}</span> at these nameservers. Velclaw then becomes the single control point for DNS records.</div></div>
                      </div>
                    </div>
                    {selected.nameservers.map((ns, index) => (
                      <div key={`${ns}-${index}`} className="flex items-center justify-between gap-3 border border-white/10 bg-white/[0.018] p-4">
                        <div><div className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">NS {index + 1}</div><div className="mt-1 font-mono text-sm">{ns}</div></div>
                        <button onClick={() => copyNameserver(ns)} className="border border-white/10 p-2 text-zinc-500 hover:text-white" title="Copy"><Copy size={14} /></button>
                      </div>
                    ))}
                    <div className="border border-white/10 p-4">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">Delegation check</div>
                      <div className="mt-3 flex items-center gap-2 text-sm"><Check size={15} className="text-emerald-300" /> DNS delegation will be verified after registrar sync.</div>
                    </div>
                  </div>
                )}

                {tab === 'settings' && (
                  <div className="space-y-4">
                    {[
                      ['Auto-renew', selected.autoRenew ? 'Enabled' : 'Disabled', 'Keep registration renewal state synchronized with the registrar.'],
                      ['SSL automation', selected.ssl === 'live' ? 'Enabled' : 'Waiting', 'Issue and renew certificates after DNS is verified.'],
                      ['Hosting target', selected.target, 'Where the root domain and subdomains route by default.'],
                    ].map(([label, value, sub]) => (
                      <div key={String(label)} className="flex flex-wrap items-center justify-between gap-4 border border-white/10 p-4">
                        <div><div className="text-sm font-semibold">{String(label)}</div><div className="mt-1 text-[11px] text-zinc-600">{String(sub)}</div></div>
                        <button className="flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-zinc-300">{String(value)} <ChevronDown size={13} /></button>
                      </div>
                    ))}
                    <div className="border border-red-400/15 bg-red-400/[0.03] p-4">
                      <div className="text-sm font-semibold text-red-200">Danger zone</div>
                      <div className="mt-1 text-xs text-zinc-600">Remove this domain from the Velclaw control plane without changing registrar ownership.</div>
                      <button className="mt-3 flex items-center gap-2 border border-red-400/20 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10"><Trash2 size={13} /> Remove domain</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-white/10 bg-[#0d0b12] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div><div className="text-sm font-semibold">Add domain</div><div className="mt-1 text-xs text-zinc-600">Register a domain you already own with the Velclaw control plane.</div></div>
              <button onClick={() => setShowAdd(false)} className="text-zinc-600 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5">
              <label className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">Domain</label>
              <div className="mt-2 flex">
                <div className="grid w-10 place-items-center border border-r-0 border-white/10 bg-white/[0.03] text-zinc-600"><Globe2 size={14} /></div>
                <input autoFocus value={newDomain} onChange={(e) => setNewDomain(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDomain()} placeholder="example.com" className="min-w-0 flex-1 border border-white/10 bg-white/[0.02] px-3 py-3 font-mono text-sm outline-none focus:border-violet-400/50" />
              </div>
              <div className="mt-4 grid gap-2 text-[11px] text-zinc-600 sm:grid-cols-2">
                <div className="border border-white/10 p-3">1. Add the domain here</div>
                <div className="border border-white/10 p-3">2. Connect your registrar</div>
                <div className="border border-white/10 p-3">3. Set Velclaw nameservers</div>
                <div className="border border-white/10 p-3">4. Verify DNS + SSL</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-4">
              <button onClick={() => setShowAdd(false)} className="border border-white/10 px-4 py-2 text-xs text-zinc-400">Cancel</button>
              <button onClick={addDomain} disabled={!newDomain.includes('.')} className="bg-violet-500 px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">Add domain</button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 border border-violet-400/30 bg-[#15111e] px-4 py-3 text-xs text-violet-100 shadow-2xl">
          <Check size={14} className="text-violet-300" /> {notice}
        </div>
      )}
    </main>
  )
}
