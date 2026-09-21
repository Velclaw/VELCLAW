import 'server-only'

import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { connectors } from '@/lib/db/schema'
import { decrypt, encrypt } from '@/lib/crypto'
import { refreshLinearToken } from './client'
import { getServerSession } from '@/lib/session/get-server-session'

export type LinearConnection = {
  accessToken: string
  refreshToken: string | null
  expiresAt: number
  scope: string
  viewer: { id: string; name: string; email: string }
  teams: Array<{ id: string; name: string; key: string }>
}

export async function getUserLinearConnection(userId: string) {
  const [connection] = await db
    .select()
    .from(connectors)
    .where(and(eq(connectors.userId, userId), eq(connectors.name, 'linear'), eq(connectors.status, 'connected')))
    .limit(1)

  if (!connection?.env) return null
  const data = JSON.parse(decrypt(connection.env)) as LinearConnection

  if (data.expiresAt > Date.now() + 60_000) return data
  if (!data.refreshToken) return data

  const token = await refreshLinearToken(data.refreshToken)
  const refreshed: LinearConnection = {
    ...data,
    accessToken: token.access_token,
    refreshToken: token.refresh_token || data.refreshToken,
    expiresAt: Date.now() + (token.expires_in || 86400) * 1000,
    scope: token.scope || data.scope,
  }

  await db.update(connectors).set({ env: encrypt(JSON.stringify(refreshed)), updatedAt: new Date() }).where(eq(connectors.id, connection.id))
  return refreshed
}

export async function getCurrentUserLinearConnection() {
  const session = await getServerSession()
  if (!session?.user?.id) return null
  return getUserLinearConnection(session.user.id)
}
