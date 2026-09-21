import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { VelclawPluginsPage } from '@/components/velclaw-plugins-page'

export default async function VelclawPluginsRoute() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')
  return <VelclawPluginsPage />
}
