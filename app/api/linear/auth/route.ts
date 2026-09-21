import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getServerSession } from '@/lib/session/get-server-session'
import { encrypt } from '@/lib/crypto'
import { getLinearAuthorizeUrl } from '@/lib/linear/client'

function base64Url(buffer: Buffer) {
  return buffer.toString('base64url')
}

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const verifier = base64Url(crypto.randomBytes(32))
  const challenge = base64Url(crypto.createHash('sha256').update(verifier).digest())
  const state = encrypt(
    JSON.stringify({
      userId: session.user.id,
      verifier,
      nonce: crypto.randomBytes(16).toString('hex'),
      issuedAt: Date.now(),
    }),
  )

  const url = getLinearAuthorizeUrl({ state, codeChallenge: challenge, scope: 'read,write' })
  return NextResponse.redirect(url)
}
