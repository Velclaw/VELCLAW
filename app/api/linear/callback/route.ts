import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from '@/lib/session/get-server-session'
import { db } from '@/lib/db/client'
import { connectors } from '@/lib/db/schema'
import { decrypt, encrypt } from '@/lib/crypto'
import { exchangeLinearCode, getLinearWorkspace } from '@/lib/linear/client'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const oauthError = request.nextUrl.searchParams.get('error')

  if (oauthError) return NextResponse.redirect(new URL('/builder?linear_error=oauth_denied', request.url))
  if (!session?.user?.id || !code || !state) return NextResponse.json({ error: 'Invalid Linear OAuth callback' }, { status: 400 })

  try {
    const stateData = JSON.parse(decrypt(state)) as { userId: string; verifier: string; issuedAt: number }
    if (stateData.userId !== session.user.id || Date.now() - stateData.issuedAt > 10 * 60 * 1000) {
      return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 400 })
    }

    const token = await exchangeLinearCode(code, stateData.verifier)
    const workspace = await getLinearWorkspace(token.access_token)
    const payload = JSON.stringify({
      accessToken: token.access_token,
      refreshToken: token.refresh_token || null,
      expiresAt: Date.now() + (token.expires_in || 86400) * 1000,
      scope: token.scope || 'read write',
      viewer: workspace.viewer,
      teams: workspace.teams.nodes,
    })

    const existing = await db.select({ id: connectors.id }).from(connectors).where(and(eq(connectors.userId, session.user.id), eq(connectors.name, 'linear'))).limit(1)
    const values = {
      description: 'Linear workspace connection for Velclaw IDE Build',
      type: 'remote' as const,
      baseUrl: 'https://api.linear.app/graphql',
      env: encrypt(payload),
      status: 'connected' as const,
      updatedAt: new Date(),
    }

    if (existing[0]) await db.update(connectors).set(values).where(eq(connectors.id, existing[0].id))
    else await db.insert(connectors).values({ id: nanoid(16), userId: session.user.id, name: 'linear', ...values })

    return NextResponse.redirect(new URL('/builder?linear=connected', request.url))
  } catch (error) {
    console.error('Linear OAuth callback failed', error)
    return NextResponse.redirect(new URL('/builder?linear_error=callback_failed', request.url))
  }
}
