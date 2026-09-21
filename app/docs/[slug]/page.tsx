import { notFound } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ALLOWED = new Set([
  'VELCLAW_CONTEXT',
  'VELCLAW_DEPLOY',
  'VELCLAW_PRODUCT_URLS',
  'VELCLAW_ECOSYSTEM',
  'VELCLAW_AUTONOMOUS_WORKFLOW',
  'VELCLAW_SELF_HOSTED',
  'VELCLAW_RENDER',
  'STORAGE_INVENTORY',
  'velclaw-operations',
])

export default async function DocsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!ALLOWED.has(slug)) notFound()

  let source = ''
  try {
    source = await readFile(path.join(process.cwd(), 'docs', slug + '.md'), 'utf8')
  } catch {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-zinc-200">
      <article className="mx-auto max-w-4xl">
        <a href="/docs" className="font-mono text-xs text-violet-400">← /docs</a>
        <div className="mt-8 space-y-4 font-mono text-sm leading-7">
          {source.split('\n').map((line, index) => {
            if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-semibold text-white">{line.slice(2)}</h1>
            if (line.startsWith('## ')) return <h2 key={index} className="mt-8 text-xl font-semibold text-white">{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={index} className="mt-6 text-lg font-semibold text-white">{line.slice(4)}</h3>
            if (!line.trim()) return <div key={index} className="h-2" />
            return <p key={index} className="text-zinc-300">{line}</p>
          })}
        </div>
      </article>
    </main>
  )
}
