import { SignJWT, jwtVerify } from 'jose'

const encoder = new TextEncoder()
const issuer = process.env.VELCLAW_OAUTH_ISSUER || 'https://auth.velclaw.cfd'
const secretValue = process.env.VELCLAW_OAUTH_SECRET

function secret() {
  if (!secretValue || secretValue.length < 32) {
    throw new Error('VELCLAW_OAUTH_SECRET must be set and contain at least 32 characters')
  }
  return encoder.encode(secretValue)
}

export type OAuthClient = {
  clientId: string
  clientSecret?: string
  name: string
  redirectUris: string[]
  scopes?: string[]
}

export function getOAuthClients(): OAuthClient[] {
  const raw = process.env.VELCLAW_OAUTH_CLIENTS_JSON
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((client): client is OAuthClient =>
      client && typeof client.clientId === 'string' && typeof client.name === 'string' && Array.isArray(client.redirectUris),
    )
  } catch {
    return []
  }
}

export function findOAuthClient(clientId: string) {
  return getOAuthClients().find((client) => client.clientId === clientId)
}

export function validateRedirectUri(client: OAuthClient, redirectUri: string) {
  return client.redirectUris.includes(redirectUri)
}

export function normalizeScopes(requested: string | null, client: OAuthClient) {
  const allowed = new Set(client.scopes ?? ['openid', 'profile', 'email'])
  const scopes = (requested || 'openid profile email').split(/\s+/).filter(Boolean)
  return [...new Set(scopes.filter((scope) => allowed.has(scope)))]
}

export async function createAuthorizationCode(input: {
  userId: string
  clientId: string
  redirectUri: string
  scopes: string[]
  nonce?: string
}) {
  return new SignJWT({
    typ: 'authorization_code',
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    user_id: input.userId,
    scope: input.scopes.join(' '),
    nonce: input.nonce,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime('2m')
    .sign(secret())
}

export async function verifyAuthorizationCode(code: string) {
  const { payload } = await jwtVerify(code, secret(), { issuer })
  if (payload.typ !== 'authorization_code') throw new Error('Invalid authorization code')
  return payload
}

export async function createAccessToken(input: {
  userId: string
  clientId: string
  scopes: string[]
}) {
  return new SignJWT({
    typ: 'access_token',
    client_id: input.clientId,
    scope: input.scopes.join(' '),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret())
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret(), { issuer })
  if (payload.typ !== 'access_token') throw new Error('Invalid access token')
  return payload
}

export function oauthMetadata() {
  return {
    issuer,
    authorization_endpoint: `${issuer}/api/oauth/authorize`,
    token_endpoint: `${issuer}/api/oauth/token`,
    userinfo_endpoint: `${issuer}/api/oauth/userinfo`,
    jwks_uri: `${issuer}/api/oauth/jwks`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    subject_types_supported: ['public'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
    code_challenge_methods_supported: ['S256'],
  }
}
