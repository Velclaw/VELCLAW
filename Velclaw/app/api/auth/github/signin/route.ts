import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { isRelativeUrl } from '@/lib/utils/is-relative-url'
import { generateState } from 'arctic'

async function buildGitHubAuthorization(req: NextRequest): Promise<Response> {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const redirectUri = `${req.nextUrl.origin}/api/auth/github/callback`

  if (!clientId) {
    return Response.redirect(new URL('/?error=github_not_configured', req.url))
  }

  const state = generateState()
  const store = await cookies()
  const redirectTo = isRelativeUrl(req.nextUrl.searchParams.get('next') ?? '/')
    ? (req.nextUrl.searchParams.get('next') ?? '/')
    : '/'

  // This route is the GitHub SIGN-IN flow. Keep its cookie namespace
  // aligned with the callback so the callback can create the session.
  store.set('github_auth_mode', 'signin', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })
  store.set('github_auth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })
  store.set('github_auth_redirect_to', redirectTo, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,read:user,user:email',
    state,
  })

  return Response.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
}

export async function GET(req: NextRequest): Promise<Response> {
  return buildGitHubAuthorization(req)
}

export async function POST(req: NextRequest): Promise<Response> {
  const response = await buildGitHubAuthorization(req)
  if (response.status >= 300 && response.status < 400) {
    return Response.json({ url: response.headers.get('Location') })
  }
  return Response.json({ error: 'GitHub OAuth not configured' }, { status: 500 })
}
