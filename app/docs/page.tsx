import Link from 'next/link'

const DOCS = [
  ['Project Context', '/docs/VELCLAW_CONTEXT'],
  ['Deploy', '/docs/VELCLAW_DEPLOY'],
  ['Product URLs', '/docs/VELCLAW_PRODUCT_URLS'],
  ['Ecosystem', '/docs/VELCLAW_ECOSYSTEM'],
  ['Autonomous Workflow', '/docs/VELCLAW_AUTONOMOUS_WORKFLOW'],
  ['Self Hosted', '/docs/VELCLAW_SELF_HOSTED'],
  ['Render', '/docs/VELCLAW_RENDER'],
  ['Storage Inventory', '/docs/STORAGE_INVENTORY'],
  ['Operations', '/docs/velclaw-operations'],
  ['Integration Contracts', '/docs/VELCLAW-INTEGRATION-CONTRACTS'],
  ['Project Registry', '/projects'],
] as const

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 font-mono text-sm text-violet-400">VELCLAW / DOCS</p>
        <h1 className="text-4xl font-semibold tracking-tight">Velclaw Documentation</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Tài liệu chính thức của Velclaw. Route first-party: https://velclaw.cfd/docs.
        </p>
        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          {DOCS.map(([title, href]) => (
            <Link key={href} href={href} className="border border-zinc-800 p-5 transition hover:border-violet-500 hover:bg-zinc-950">
              <span className="font-mono text-xs text-violet-400">DOC</span>
              <h2 className="mt-2 text-lg font-medium">{title}</h2>
              <p className="mt-1 font-mono text-xs text-zinc-500">{href}</p>
            </Link>
          ))}
        </section>
        <div className="mt-10 border border-zinc-800 p-5">
          <p className="font-mono text-xs text-zinc-500">CANONICAL DOMAIN</p>
          <p className="mt-2 font-mono text-sm text-violet-300">https://velclaw.cfd/docs</p>
        </div>
      </div>
    </main>
  )
}
