import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { DomainControlPlane } from '@/components/domain-control-plane'

export const metadata = {
  title: 'Domains | Velclaw',
  description: 'Central domain, DNS, nameserver and hosting control plane for Velclaw.',
}

export default async function DomainsPage() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')

  return <DomainControlPlane />
}
