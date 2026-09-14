import Link from 'next/link'
import { getSessionFromCookie } from '@/lib/session/server'
import { SESSION_COOKIE_NAME } from '@/lib/session/constants'
import { findOAuthClient, normalizeScopes } from '@/lib/velclaw/oauth'
import { cookies } from 'next/headers'

export const metadata = { title: 'Velclaw OAuth' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function OAuthPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const clientId = first(params.client_id) || ''
  const redirectUri = first(params.redirect_uri) || ''
  const responseType = first(params.response_type) || 'code'
  const requestedScope = first(params.scope) || 'openid profile email'
  const state = first(params.state) || ''
  const nonce = first(params.nonce) || ''
  const codeChallenge = first(params.code_challenge) || ''
  const codeChallengeMethod = first(params.code_challenge_method) || ''

  const client = findOAuthClient(clientId)
  if (!client || responseType !== 'code' || !client.redirectUris.includes(redirectUri)) {
    return <OAuthError message="The OAuth application or redirect URI is not registered with Velclaw." />
  }

  const cookieStore = await cookies()
  const session = await getSessionFromCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  const scopes = normalizeScopes(requestedScope, client)

  const oauthParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
    nonce,
  })
  if (codeChallenge) oauthParams.set('code_challenge', codeChallenge)
  if (codeChallengeMethod) oauthParams.set('code_challenge_method', codeChallengeMethod)

  if (!session) {
    const next = `/oauth?${oauthParams.toString()}`
    const loginUrl = `/api/auth/signin/github?next=${encodeURIComponent(next)}`
    return (
      <main className="min-h-screen bg-[#050608] text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.045] p-8 shadow-2xl backdrop-blur-xl">
          <Brand />
          <p className="mt-8 text-sm text-white/50">SIGN IN TO CONTINUE</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Continue to {client.name}</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">Velclaw will securely authenticate your account before asking for permission.</p>
          <Link href={loginUrl} className="mt-7 flex h-12 items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90">Continue with Velclaw</Link>
          <p className="mt-5 text-center text-xs text-white/35">Protected by Velclaw Identity</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050608] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.045] p-8 shadow-2xl backdrop-blur-xl">
        <Brand />
        <div className="mt-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-lg font-bold">{client.name.slice(0, 1).toUpperCase()}</div>
          <div><p className="text-xs text-white/40">REQUESTING ACCESS</p><h1 className="text-xl font-semibold">{client.name}</h1></div>
        </div>
        <p className="mt-7 text-sm leading-6 text-white/60">This application wants access to your Velclaw account.</p>
        <div className="mt-5 space-y-2">
          {scopes.map((scope) => <div key={scope} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm"><span className="h-2 w-2 rounded-full bg-white" />{scope === 'openid' ? 'Verify your Velclaw identity' : scope === 'profile' ? 'View your basic profile' : scope === 'email' ? 'View your email address' : `Access ${scope}`}</div>)}
        </div>
        <form action="/api/oauth/authorize" method="POST" className="mt-7 space-y-3">
          <input type="hidden" name="client_id" value={clientId} /><input type="hidden" name="redirect_uri" value={redirectUri} /><input type="hidden" name="scope" value={scopes.join(' ')} /><input type="hidden" name="state" value={state} /><input type="hidden" name="nonce" value={nonce} /><input type="hidden" name="code_challenge" value={codeChallenge} /><input type="hidden" name="code_challenge_method" value={codeChallengeMethod} />
          <button name="decision" value="allow" className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90">Allow access</button>
          <button name="decision" value="deny" className="h-12 w-full rounded-xl border border-white/10 text-sm font-medium text-white/70 hover:bg-white/5">Cancel</button>
        </form>
        <p className="mt-6 text-center text-xs text-white/30">Signed in as {session.user.username}</p>
      </div>
    </main>
  )
}

function Brand() { return <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-black">V</div><div><div className="font-semibold tracking-tight">VELCLAW</div><div className="text-[10px] tracking-[.22em] text-white/35">IDENTITY</div></div></div> }
function OAuthError({ message }: { message: string }) { return <main className="min-h-screen bg-[#050608] text-white flex items-center justify-center px-5"><div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-400/[.04] p-8"><Brand /><h1 className="mt-8 text-xl font-semibold">OAuth request rejected</h1><p className="mt-3 text-sm leading-6 text-white/60">{message}</p><Link href="/auth/signin" className="mt-7 flex h-12 items-center justify-center rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90">Về trang đăng nhập Velclaw</Link></div></main> }
