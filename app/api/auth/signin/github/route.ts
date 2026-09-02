import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { generateState } from 'arctic'
import { isRelativeUrl } from '@/lib/utils/is-relative-url'

const AUTH_COOKIE_OPTIONS = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 60 * 10,
  sameSite: 'lax' as const,
}

export async function GET(req: NextRequest): Promise<Response> {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const redirectUri = `${req.nextUrl.origin}/api/auth/github/callback`

  if (!clientId) {
    return NextResponse.redirect(new URL('/?error=github_not_configured', req.url))
  }

  const state = generateState()
  const redirectTo = isRelativeUrl(req.nextUrl.searchParams.get('next') ?? '/')
    ? (req.nextUrl.searchParams.get('next') ?? '/')
    : '/'

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,read:user,user:email',
    state,
  })

  // This endpoint is explicitly the SIGN-IN flow. Do not infer "connect"
  // from an existing/stale Vercel session cookie.
  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  )

  response.cookies.set('github_auth_mode', 'signin', AUTH_COOKIE_OPTIONS)
  response.cookies.set('github_auth_state', state, AUTH_COOKIE_OPTIONS)
  response.cookies.set('github_auth_redirect_to', redirectTo, AUTH_COOKIE_OPTIONS)

  // Remove stale OAuth-connect state so the callback cannot accidentally
  // select the old connect flow.
  response.cookies.delete('github_oauth_state')
  response.cookies.delete('github_oauth_redirect_to')
  response.cookies.delete('github_oauth_user_id')

  return response
}
