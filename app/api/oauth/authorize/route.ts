import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromReq } from '@/lib/session/server'
import { findOAuthClient, createAuthorizationCode, normalizeScopes, validateRedirectUri } from '@/lib/velclaw/oauth'

function redirectError(uri: string, error: string, state?: string) {
  const url = new URL(uri)
  url.searchParams.set('error', error)
  if (state) url.searchParams.set('state', state)
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  const target = new URL('/oauth', req.url)
  req.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value))
  return NextResponse.redirect(target)
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const clientId = String(form.get('client_id') || '')
  const redirectUri = String(form.get('redirect_uri') || '')
  const decision = String(form.get('decision') || '')
  const state = String(form.get('state') || '')
  const client = findOAuthClient(clientId)

  if (!client || !validateRedirectUri(client, redirectUri)) {
    return NextResponse.json({ error: 'invalid_client' }, { status: 400 })
  }
  if (decision === 'deny') return redirectError(redirectUri, 'access_denied', state)

  const session = await getSessionFromReq(req)
  if (!session) {
    const next = `/oauth?${new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: String(form.get('scope') || 'openid profile email'), state, nonce: String(form.get('nonce') || '') }).toString()}`
    return NextResponse.redirect(new URL(`/api/auth/signin/github?next=${encodeURIComponent(next)}`, req.url))
  }

  const scopes = normalizeScopes(String(form.get('scope') || ''), client)
  const code = await createAuthorizationCode({ userId: session.user.id, clientId, redirectUri, scopes, nonce: String(form.get('nonce') || '') || undefined })
  const callback = new URL(redirectUri)
  callback.searchParams.set('code', code)
  if (state) callback.searchParams.set('state', state)
  return NextResponse.redirect(callback)
}
