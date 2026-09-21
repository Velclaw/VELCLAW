import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromReq } from '@/lib/session/server'
import { findOAuthClient, createAuthorizationCode, normalizeScopes, validateRedirectUri } from '@/lib/velclaw/oauth'

function redirectError(uri: string, error: string, state?: string) {
  const url = new URL(uri)
  url.searchParams.set('error', error)
  if (state) url.searchParams.set('state', state)
  return NextResponse.redirect(url)
}

function oauthQuery(form: FormData, scopes: string) {
  const params = new URLSearchParams({
    client_id: String(form.get('client_id') || ''),
    redirect_uri: String(form.get('redirect_uri') || ''),
    response_type: 'code',
    scope: scopes,
    state: String(form.get('state') || ''),
    nonce: String(form.get('nonce') || ''),
  })
  const challenge = String(form.get('code_challenge') || '')
  const method = String(form.get('code_challenge_method') || '')
  if (challenge) params.set('code_challenge', challenge)
  if (method) params.set('code_challenge_method', method)
  return params
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
  const requestedScope = String(form.get('scope') || 'openid profile email')
  const scopes = normalizeScopes(requestedScope, client)
  if (!session) {
    const next = `/oauth?${oauthQuery(form, scopes.join(' ')).toString()}`
    return NextResponse.redirect(new URL(`/api/auth/signin/github?next=${encodeURIComponent(next)}`, req.url))
  }

  const codeChallenge = String(form.get('code_challenge') || '')
  const codeChallengeMethod = String(form.get('code_challenge_method') || '')
  if (codeChallenge && codeChallengeMethod !== 'S256') {
    return NextResponse.json({ error: 'invalid_request', error_description: 'Only S256 PKCE is supported' }, { status: 400 })
  }

  const code = await createAuthorizationCode({ userId: session.user.id, clientId, redirectUri, scopes, nonce: String(form.get('nonce') || '') || undefined, codeChallenge: codeChallenge || undefined, codeChallengeMethod: codeChallengeMethod || undefined })
  const callback = new URL(redirectUri)
  callback.searchParams.set('code', code)
  if (state) callback.searchParams.set('state', state)
  return NextResponse.redirect(callback)
}
