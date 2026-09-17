import { VelclawBrowserBuilder } from '@/components/velclaw-browser-builder'
import { UnifiedBuilderBar } from '@/components/unified-builder-bar'
import { LinearIdePanel } from '@/components/linear-ide-panel'

export const metadata = {
  title: 'Velclaw Builder',
  description: 'Build, edit, run, preview and ship applications directly from the Velclaw IDE.',
}

export default function VelclawBuilderPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#07080b] text-zinc-100 lg:flex-row">
      <main className="min-w-0 flex-1">
        <UnifiedBuilderBar />
        <VelclawBrowserBuilder />
      </main>
      <LinearIdePanel />
    </div>
  )
}
