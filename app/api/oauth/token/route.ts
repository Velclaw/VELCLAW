import { NextRequest, NextResponse } from 'next/server'
import { createAccessToken, findOAuthClient, verifyAuthorizationCode, verifyPkce } from '@/lib/velclaw/oauth'

function basicCredentials(req: NextRequest) {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Basic ')) return null
  try { const decoded = atob(header.slice(6)); const index = decoded.indexOf(':'); return index < 0 ? null : { clientId: decoded.slice(0, index), clientSecret: decoded.slice(index + 1) } } catch { return null }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await req.json() : Object.fromEntries((await req.formData()).entries())
  const code = String(body.code || ''), redirectUri = String(body.redirect_uri || '')
  const basic = basicCredentials(req)
  const clientId = String(body.client_id || basic?.clientId || ''), clientSecret = String(body.client_secret || basic?.clientSecret || '')
  const grantType = String(body.grant_type || 'authorization_code')
  if (grantType !== 'authorization_code' || !code || !clientId || !redirectUri) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  const client = findOAuthClient(clientId)
  if (!client || !client.redirectUris.includes(redirectUri)) return NextResponse.json({ error: 'invalid_client' }, { status: 401 })
  if (client.clientSecret && client.clientSecret !== clientSecret) return NextResponse.json({ error: 'invalid_client' }, { status: 401 })

  try {
    const payload = await verifyAuthorizationCode(code)
    if (payload.client_id !== clientId || payload.redirect_uri !== redirectUri || typeof payload.user_id !== 'string') throw new Error('code mismatch')
    if (typeof payload.code_challenge === 'string') {
      if (!verifyPkce(String(body.code_verifier || ''), payload.code_challenge, String(payload.code_challenge_method || ''))) throw new Error('pkce failed')
    }
    const scopes = typeof payload.scope === 'string' ? payload.scope.split(/\s+/).filter(Boolean) : []
    const accessToken = await createAccessToken({ userId: payload.user_id, clientId, scopes })
    return NextResponse.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 3600, scope: scopes.join(' ') })
  } catch { return NextResponse.json({ error: 'invalid_grant' }, { status: 400 }) }
}
