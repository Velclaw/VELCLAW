import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { McpPage } from '@/components/mcp-page'

export default async function VelclawMcpRoute() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')
  return <McpPage />
}
