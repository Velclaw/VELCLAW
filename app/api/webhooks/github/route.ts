import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { claimGithubWebhookDelivery, createDeployment, getWebhookDeploymentConfig } from '@/lib/deploy/store'

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
  if (!secret) return NextResponse.json({ error: 'Webhook endpoint is not configured' }, { status: 503 })

  const signature = request.headers.get('x-hub-signature-256')
  const deliveryId = request.headers.get('x-github-delivery') || ''
  const event = request.headers.get('x-github-event') || 'unknown'
  if (!signature) return NextResponse.json({ error: 'Missing X-Hub-Signature-256' }, { status: 401 })

  const payload = await request.text()
  if (!verifySignature(payload, signature, secret)) return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })

  let body: unknown
  try {
    body = payload ? JSON.parse(payload) : {}
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  try {
    if (deliveryId && !(await claimGithubWebhookDelivery(deliveryId, event))) {
      return NextResponse.json({ ok: true, verified: true, duplicate: true, event, deliveryId })
    }

    if (event === 'ping') return NextResponse.json({ ok: true, verified: true, event, deliveryId })
    if (event !== 'push') return NextResponse.json({ ok: true, verified: true, ignored: event, deliveryId })

    const data = body as {
      deleted?: boolean
      ref?: string
      after?: string
      repository?: { clone_url?: string; html_url?: string; name?: string }
    }
    if (data.deleted || !data.ref?.startsWith('refs/heads/')) return NextResponse.json({ ok: true, verified: true, ignored: 'non-branch-push', deliveryId })

    const repoUrl = data.repository?.clone_url || data.repository?.html_url || ''
    const branch = data.ref.slice('refs/heads/'.length)
    const commitSha = data.after || ''
    if (!repoUrl || !branch || !commitSha || /^0+$/.test(commitSha)) return NextResponse.json({ ok: true, verified: true, ignored: 'invalid-push-payload', deliveryId })

    const config = await getWebhookDeploymentConfig(repoUrl, branch)
    if (!config) return NextResponse.json({ ok: true, verified: true, ignored: 'repository-not-configured', deliveryId })

    const deployment = await createDeployment({
      userId: config.deployment.userId,
      projectName: config.deployment.projectName,
      repoUrl: config.deployment.repoUrl,
      branch,
      commitSha,
      env: config.env,
      customDomain: config.deployment.customDomain,
    })
    return NextResponse.json({ ok: true, verified: true, event, deliveryId, deployment }, { status: 202 })
  } catch (error) {
    console.error('[GitHub webhook] deployment enqueue failed', error)
    return NextResponse.json({ error: 'Deployment queue unavailable' }, { status: 503 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'github-webhook' })
}
