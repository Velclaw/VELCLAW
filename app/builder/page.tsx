import { VelclawBrowserBuilder } from '@/components/velclaw-browser-builder'
import { UnifiedBuilderBar } from '@/components/unified-builder-bar'

export const metadata = {
  title: 'Velclaw Builder',
  description: 'Build, edit, run and preview applications directly in your browser.',
}

export default function VelclawBuilderPage() {
  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100">
      <UnifiedBuilderBar />
      <VelclawBrowserBuilder />
    </div>
  )
}
