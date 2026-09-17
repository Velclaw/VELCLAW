import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { VelclawDeployPage } from '@/components/velclaw-deploy-page'

export const metadata = {
  title: 'Velclaw Deploy',
  description: 'Velclaw deployment control plane for release preparation and deployment evidence.',
}

export default async function VelclawDeployRoute() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')
  return <VelclawDeployPage />
}
