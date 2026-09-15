import { SignJWT, jwtVerify } from 'jose'
import { createHash } from 'node:crypto'
import { VELCLAW_OAUTH_ISSUER as issuer } from '@/lib/velclaw/domain-config'

const encoder = new TextEncoder()
const secretValue = process.env.VELCLAW_OAUTH_SECRET

function secret() {
  if (!secretValue || secretValue.length < 32) throw new Error('VELCLAW_OAUTH_SECRET must contain at least 32 characters')
  return encoder.encode(secretValue)
}

export type OAuthClient = { clientId: string; clientSecret?: string; name: string; redirectUris: string[]; scopes?: string[] }

export function getOAuthClients(): OAuthClient[] {
  const raw = process.env.VELCLAW_OAUTH_CLIENTS_JSON
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((c): c is OAuthClient => c && typeof c.clientId === 'string' && typeof c.name === 'string' && Array.isArray(c.redirectUris))
  } catch { return [] }
}

export function findOAuthClient(clientId: string) { return getOAuthClients().find((client) => client.clientId === clientId) }
export function validateRedirectUri(client: OAuthClient, redirectUri: string) { return client.redirectUris.includes(redirectUri) }
export function normalizeScopes(requested: string | null, client: OAuthClient) {
  const allowed = new Set(client.scopes ?? ['openid', 'profile', 'email'])
  return [...new Set((requested || 'openid profile email').split(/\s+/).filter(Boolean).filter((s) => allowed.has(s)))]
}

export async function createAuthorizationCode(input: { userId: string; clientId: string; redirectUri: string; scopes: string[]; nonce?: string; codeChallenge?: string; codeChallengeMethod?: string }) {
  return new SignJWT({ typ: 'authorization_code', client_id: input.clientId, redirect_uri: input.redirectUri, user_id: input.userId, scope: input.scopes.join(' '), nonce: input.nonce, code_challenge: input.codeChallenge, code_challenge_method: input.codeChallengeMethod })
    .setProtectedHeader({ alg: 'HS256' }).setIssuer(issuer).setSubject(input.userId).setIssuedAt().setExpirationTime('2m').sign(secret())
}

export async function verifyAuthorizationCode(code: string) {
  const { payload } = await jwtVerify(code, secret(), { issuer })
  if (payload.typ !== 'authorization_code') throw new Error('Invalid authorization code')
  return payload
}

export function verifyPkce(codeVerifier: string, challenge: string, method: string) {
  if (method !== 'S256' || !codeVerifier || !challenge) return false
  return createHash('sha256').update(codeVerifier).digest('base64url') === challenge
}

export async function createAccessToken(input: { userId: string; clientId: string; scopes: string[] }) {
  return new SignJWT({ typ: 'access_token', client_id: input.clientId, scope: input.scopes.join(' ') }).setProtectedHeader({ alg: 'HS256' }).setIssuer(issuer).setSubject(input.userId).setIssuedAt().setExpirationTime('1h').sign(secret())
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret(), { issuer })
  if (payload.typ !== 'access_token') throw new Error('Invalid access token')
  return payload
}

export function oauthMetadata() {
  return { issuer, authorization_endpoint: `${issuer}/api/oauth/authorize`, token_endpoint: `${issuer}/api/oauth/token`, userinfo_endpoint: `${issuer}/api/oauth/userinfo`, response_types_supported: ['code'], grant_types_supported: ['authorization_code'], subject_types_supported: ['public'], scopes_supported: ['openid', 'profile', 'email'], token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'], code_challenge_methods_supported: ['S256'] }
}
