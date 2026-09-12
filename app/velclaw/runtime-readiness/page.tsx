'use client'

import { useEffect, useMemo, useState } from 'react'

const COMPONENTS = [
  { id: 'kubernetes_api', name: 'Kubernetes API Server', boundary: 'External K3s/Kubernetes control plane', command: 'kubectl get nodes -o wide && kubectl get --raw=/livez', note: 'Requires a real kubeconfig and a successful authenticated API response.' },
  { id: 'postgresql', name: 'PostgreSQL', boundary: 'External database runtime', command: "pg_isready -h <DB_HOST> -p 5432 && psql \"$POSTGRES_URL\" -c 'SELECT version(), current_database();'", note: 'A manifest or DATABASE_URL string is not evidence of a live database.' },
  { id: 'github_credentials', name: 'GitHub credentials', boundary: 'GitHub API / repository access', command: 'gh auth status && curl -fsS -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user', note: 'Do not paste the token itself. Paste only the command output.' },
  { id: 'ghcr_registry', name: 'GHCR / OCI Registry', boundary: 'Container registry', command: 'docker login ghcr.io -u <user> --password-stdin && crane digest ghcr.io/velclaw/velclaw:main', note: 'Proves registry authentication and OCI artifact access.' },
  { id: 'k3s_wireguard', name: 'K3s + WireGuard', boundary: 'Cluster/node network', command: 'wg show wg0 && systemctl is-active k3s && kubectl get pods -A -o wide', note: 'Requires node-level evidence; Git cannot prove kernel interfaces or handshakes.' },
  { id: 'dns_cloudflare', name: 'DNS / Cloudflare', boundary: 'Authoritative DNS / edge', command: 'dig +short velclaw.cfd @1.1.1.1 && dig +short velclaw.cfd @8.8.8.8', note: 'Shows what public resolvers actually return.' },
  { id: 'tls_letsencrypt', name: "TLS / Let's Encrypt", boundary: 'Public HTTPS edge', command: 'openssl s_client -connect velclaw.cfd:443 -servername velclaw.cfd </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates -fingerprint -sha256', note: 'Validates the certificate actually served by the public endpoint.' },
] as const

type Evidence = { component: string; status: 'unverified' | 'verified'; evidenceHash: string | null; evidence: string | null; capturedAt: string | null; attestedBy: string | null }

export default function RuntimeReadinessPage() {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const response = await fetch('/api/infra/runtime-evidence', { cache: 'no-store' })
    if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || 'Unable to load evidence')
    setEvidence((await response.json()).components)
  }

  useEffect(() => { load().catch((e) => setError(e instanceof Error ? e.message : 'Unable to load evidence')) }, [])

  const verified = useMemo(() => evidence.filter((item) => item.status === 'verified').length, [evidence])

  const submit = async () => {
    if (!selected || !text.trim()) return
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/infra/runtime-evidence', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ component: selected, evidence: text }) })
      const body = await response.json().catch(() => null)
      if (!response.ok) throw new Error(body?.error || 'Failed to save evidence')
      setText(''); setSelected(null); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save evidence') }
    finally { setBusy(false) }
  }

  const revoke = async (component: string) => {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/infra/runtime-evidence', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ component }) })
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || 'Failed to revoke evidence')
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to revoke evidence') }
    finally { setBusy(false) }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Velclaw · SRE Evidence Gate</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Runtime Readiness & External Evidence</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Git describes desired state. This page records evidence produced by the real environment. Nothing becomes operationally verified merely because a YAML manifest exists.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-right">
              <div className="text-2xl font-semibold">{verified}/{COMPONENTS.length}</div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">evidence components verified</div>
            </div>
          </div>
        </header>

        {error && <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        <section className="grid gap-4 md:grid-cols-2">
          {COMPONENTS.map((item) => {
            const current = evidence.find((entry) => entry.component === item.id)
            const isVerified = current?.status === 'verified'
            return <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{item.name}</h2>
                  <p className="mt-1 text-xs text-zinc-500">{item.boundary}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isVerified ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>{isVerified ? 'VERIFIED · ATTESTED' : 'UNVERIFIED'}</span>
              </div>
              <p className="mt-4 text-sm text-zinc-400">{item.note}</p>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs leading-5 text-zinc-300">{item.command}</pre>
              {isVerified && current?.evidenceHash && <p className="mt-3 break-all font-mono text-[10px] text-zinc-600">SHA-256: {current.evidenceHash}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => { setSelected(item.id); setText(current?.evidence || '') }} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-900">{isVerified ? 'Replace evidence' : 'Submit evidence'}</button>
                {isVerified && <button disabled={busy} onClick={() => revoke(item.id)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400">Revoke</button>}
              </div>
            </article>
          })}
        </section>

        <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
          <h2 className="font-semibold">Trust boundary</h2>
          <div className="mt-3 grid gap-3 text-sm text-zinc-400 md:grid-cols-3">
            <div><strong className="text-zinc-200">Declared in Git</strong><p className="mt-1">YAML, Dockerfiles, workflows, Terraform, manifests and application code.</p></div>
            <div><strong className="text-zinc-200">Pending external provisioning</strong><p className="mt-1">Secrets, VM/node creation, DNS delegation, certificates, database and cluster access.</p></div>
            <div><strong className="text-zinc-200">Runtime evidence</strong><p className="mt-1">Operator-submitted output is hashed and stored as an auditable attestation. It is not silently treated as live proof by Git.</p></div>
          </div>
        </section>

        {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Submit runtime evidence</h2><button onClick={() => setSelected(null)} className="text-zinc-500">Close</button></div>
            <p className="mt-2 text-sm text-zinc-400">Paste command output only. Never paste passwords, API keys, kubeconfig contents, private keys, or bearer tokens.</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} maxLength={32768} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-zinc-200 outline-none focus:border-cyan-400/50" placeholder="Paste the live command output here..." />
            <div className="mt-4 flex justify-end gap-2"><button onClick={() => setSelected(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400">Cancel</button><button disabled={busy || !text.trim()} onClick={submit} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">{busy ? 'Saving…' : 'Hash & attest evidence'}</button></div>
          </div>
        </div>}
      </div>
    </main>
  )
}
