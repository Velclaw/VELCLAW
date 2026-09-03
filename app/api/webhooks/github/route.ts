import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_SECRET_ENV = 'GITHUB_WEBHOOK_SECRET'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature.startsWith('sha256=')) return false

  const expected = createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
  const received = signature.slice('sha256='.length)

  if (!/^[a-f0-9]{64}$/i.test(received)) return false

  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')

  return timingSafeEqual(expectedBuffer, receivedBuffer)
}

export async function POST(request: NextRequest) {
  const secret = process.env[WEBHOOK_SECRET_ENV]

  if (!secret) {
    console.error(`[GitHub webhook] ${WEBHOOK_SECRET_ENV} is not configured`)
    return NextResponse.json(
      { error: 'Webhook endpoint is not configured' },
      { status: 503 },
    )
  }

  const signature = request.headers.get('x-hub-signature-256')
  const deliveryId = request.headers.get('x-github-delivery')
  const event = request.headers.get('x-github-event')

  if (!signature) {
    return NextResponse.json({ error: 'Missing X-Hub-Signature-256' }, { status: 401 })
  }

  // Read the raw body before parsing. GitHub signs the exact request bytes.
  const payload = await request.text()

  if (!verifySignature(payload, signature, secret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  let body: unknown

  try {
    body = payload ? JSON.parse(payload) : {}
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  console.info('[GitHub webhook] verified delivery', {
    deliveryId,
    event,
  })

  // `ping` is GitHub's verification event sent when the webhook is created.
  // Other events are acknowledged here and can be dispatched to Velclaw's
  // task/event pipeline without weakening signature verification.
  if (event === 'ping') {
    return NextResponse.json(
      {
        ok: true,
        verified: true,
        event: 'ping',
        deliveryId,
      },
      { status: 200 },
    )
  }

  // Keep the verified payload available for the event-processing layer.
  // Do not echo the payload back to GitHub or expose secrets in the response.
  void body

  return NextResponse.json(
    {
      ok: true,
      verified: true,
      event,
      deliveryId,
    },
    { status: 202 },
  )
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'github-webhook',
  })
}
