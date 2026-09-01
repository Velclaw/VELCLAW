import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { ApiKeysPage } from '@/components/api-keys-page'

export default async function ApiKeysRoute() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')
  return <ApiKeysPage />
}
