import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { VelclawHostingPage } from '@/components/velclaw-hosting-page'

export const metadata = {
  title: 'Velclaw Hosting',
  description: 'Self-hosted application hosting control plane for the Velclaw ecosystem.',
}

export default async function VelclawHostingRoute() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')
  return <VelclawHostingPage />
}
