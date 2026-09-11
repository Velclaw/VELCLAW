import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createDeployment } from '@/lib/deploy/store'

const WEBHOOK_SECRET_ENV = 'GITHUB_WEBHOOK_SECRET'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
  const received = signature.slice('sha256='.length)
  if (!/^[a-f0-9]{64}$/i.test(received)) return false
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'))
}

export async function POST(request: NextRequest) {
  const secret = process.env[WEBHOOK_SECRET_ENV]
  if (!secret) {
    console.error(`[GitHub webhook] ${WEBHOOK_SECRET_ENV} is not configured`)
    return NextResponse.json({ error: 'Webhook endpoint is not configured' }, { status: 503 })
  }

  const signature = request.headers.get('x-hub-signature-256')
  const deliveryId = request.headers.get('x-github-delivery')
  const event = request.headers.get('x-github-event')
  if (!signature) return NextResponse.json({ error: 'Missing X-Hub-Signature-256' }, { status: 401 })

  const payload = await request.text()
  if (!verifySignature(payload, signature, secret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  let body: any
  try {
    body = payload ? JSON.parse(payload) : {}
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  console.info('[GitHub webhook] verified delivery', { deliveryId, event })

  if (event === 'ping') {
    return NextResponse.json({ ok: true, verified: true, event: 'ping', deliveryId })
  }

  // Push events for Velclaw-owned repositories become deployment jobs only after
  // signature verification. The queue is provider-neutral and can be consumed by
  // the self-hosted build worker.
  if (event === 'push' && body?.repository?.html_url && body?.ref) {
    const repoUrl = String(body.repository.html_url)
    const branch = String(body.ref).replace(/^refs\/heads\//, '')
    const projectName = String(body.repository.name || 'velclaw-app')
    const commitSha = typeof body.after === 'string' ? body.after : null

    try {
      await createDeployment({ projectName, repoUrl, branch, commitSha })
    } catch (error) {
      console.error('[GitHub webhook] failed to enqueue deployment', error)
      return NextResponse.json({ error: 'Deployment queue unavailable' }, { status: 503 })
    }
  }

  return NextResponse.json({ ok: true, verified: true, event, deliveryId }, { status: 202 })
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'github-webhook' })
}
