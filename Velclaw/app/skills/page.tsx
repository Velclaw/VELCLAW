import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { VelclawSkillsPage } from '@/components/velclaw-skills-page'

export const metadata = {
  title: 'Velclaw Skills',
  description: 'Velclaw reusable agent skills, capability bindings and execution boundaries.',
}

export default async function VelclawSkillsRoute() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')
  return <VelclawSkillsPage />
}
