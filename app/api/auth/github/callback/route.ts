import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users, accounts, tasks, connectors, keys } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { createGitHubSession, saveSession } from '@/lib/session/create-github'
import { encrypt } from '@/lib/crypto'

export async function GET(req: NextRequest): Promise<Response> {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const cookieStore = await cookies()

  const authMode = cookieStore.get('github_auth_mode')?.value ?? null
  const authState = cookieStore.get('github_auth_state')?.value ?? null
  const oauthState = cookieStore.get('github_oauth_state')?.value ?? null
  const authRedirectTo = cookieStore.get('github_auth_redirect_to')?.value ?? null
  const oauthRedirectTo = cookieStore.get('github_oauth_redirect_to')?.value ?? null
  const storedUserId = cookieStore.get('github_oauth_user_id')?.value ?? null

  // Prefer the explicit mode, but tolerate an older callback where the mode
  // cookie was lost while the state cookies survived. A connect flow must
  // still carry the existing user ID; otherwise treat it as sign-in.
  const isConnectFlow = authMode === 'connect' || (!authMode && !authState && !!oauthState && !!storedUserId)
  const isSignInFlow = !isConnectFlow && (authMode === 'signin' || !!authState)
  const storedState = isSignInFlow ? authState : oauthState
  const storedRedirectTo = isSignInFlow ? authRedirectTo : oauthRedirectTo

  if (
    code === null ||
    state === null ||
    storedState === null ||
    storedState !== state ||
    storedRedirectTo === null ||
    (!isSignInFlow && !storedUserId)
  ) {
    console.error('[GitHub Callback] Invalid OAuth state', {
      hasCode: !!code,
      hasState: !!state,
      hasAuthState: !!authState,
      hasOAuthState: !!oauthState,
      authMode,
      hasStoredUserId: !!storedUserId,
    })
    return new Response('Invalid OAuth state', { status: 400 })
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth not configured', { status: 500 })
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    })

    if (!tokenResponse.ok) {
      console.error('[GitHub Callback] Token exchange failed:', tokenResponse.status)
      return Response.redirect(new URL('/?error=github_token_exchange', req.url))
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string
      scope?: string
      error?: string
      error_description?: string
    }

    if (!tokenData.access_token) {
      console.error('[GitHub Callback] GitHub token error:', tokenData.error_description || tokenData.error || 'Unknown error')
      return Response.redirect(new URL('/?error=github_token', req.url))
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      console.error('[GitHub Callback] User lookup failed:', userResponse.status)
      return Response.redirect(new URL('/?error=github_user', req.url))
    }

    const githubUser = (await userResponse.json()) as { login: string; id: number }

    if (isSignInFlow) {
      const session = await createGitHubSession(tokenData.access_token, tokenData.scope)
      if (!session) {
        console.error('[GitHub Callback] Failed to create GitHub session')
        return Response.redirect(new URL('/?error=github_session', req.url))
      }

      const response = NextResponse.redirect(new URL(storedRedirectTo, req.nextUrl.origin))
      await saveSession(response, session)
      response.cookies.delete('github_auth_state')
      response.cookies.delete('github_auth_redirect_to')
      response.cookies.delete('github_auth_mode')
      response.cookies.delete('github_oauth_state')
      response.cookies.delete('github_oauth_redirect_to')
      response.cookies.delete('github_oauth_user_id')
      return response
    }

    const encryptedToken = encrypt(tokenData.access_token)
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.provider, 'github'), eq(accounts.externalUserId, `${githubUser.id}`)))
      .limit(1)

    if (existingAccount.length > 0) {
      const connectedUserId = existingAccount[0].userId
      if (connectedUserId !== storedUserId) {
        await db.update(tasks).set({ userId: storedUserId! }).where(eq(tasks.userId, connectedUserId))
        await db.update(connectors).set({ userId: storedUserId! }).where(eq(connectors.userId, connectedUserId))
        await db.update(accounts).set({ userId: storedUserId! }).where(eq(accounts.userId, connectedUserId))
        await db.update(keys).set({ userId: storedUserId! }).where(eq(keys.userId, connectedUserId))
        await db.delete(users).where(eq(users.id, connectedUserId))
      }
      await db
        .update(accounts)
        .set({
          userId: storedUserId!,
          accessToken: encryptedToken,
          scope: tokenData.scope,
          username: githubUser.login,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, existingAccount[0].id))
    } else {
      await db.insert(accounts).values({
        id: nanoid(),
        userId: storedUserId!,
        provider: 'github',
        externalUserId: `${githubUser.id}`,
        accessToken: encryptedToken,
        scope: tokenData.scope,
        username: githubUser.login,
      })
    }

    const response = NextResponse.redirect(new URL(storedRedirectTo, req.nextUrl.origin))
    response.cookies.delete('github_auth_state')
    response.cookies.delete('github_auth_redirect_to')
    response.cookies.delete('github_auth_mode')
    response.cookies.delete('github_oauth_state')
    response.cookies.delete('github_oauth_redirect_to')
    response.cookies.delete('github_oauth_user_id')
    return response
  } catch (error) {
    console.error('[GitHub Callback] OAuth callback error:', error)
    return Response.redirect(new URL('/?error=github_callback', req.url))
  }
}
