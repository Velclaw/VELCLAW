import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/velclaw/oauth'
import { getUserById } from '@/lib/db/users'

export async function GET(req: NextRequest) {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
  try {
    const payload = await verifyAccessToken(header.slice(7))
    if (typeof payload.sub !== 'string') throw new Error('missing subject')
    const user = await getUserById(payload.sub)
    if (!user) return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
    const scopes = typeof payload.scope === 'string' ? payload.scope.split(/\s+/) : []
    const result: Record<string, unknown> = { sub: user.id }
    if (scopes.includes('profile')) {
      result.name = user.name || user.username
      result.preferred_username = user.username
      result.picture = user.avatarUrl
    }
    if (scopes.includes('email')) {
      result.email = user.email
      result.email_verified = Boolean(user.email)
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
  }
}
