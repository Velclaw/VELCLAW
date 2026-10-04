import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getObservabilitySummary, listObservabilityEvents, recordObservabilityEvent } from '@/lib/observability'
import { z } from 'zod'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const schema = z.object({
  service: z.string().min(1).max(100),
  level: z.enum(['info', 'warn', 'error']).default('info'),
  event: z.string().min(1).max(200),
  durationMs: z.number().int().min(0).max(86400000).nullable().optional(),
  traceId: z.string().max(200).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
})
export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [summary, events] = await Promise.all([getObservabilitySummary(), listObservabilityEvents(100)])
  return NextResponse.json({ summary, events })
}
export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(
    { event: await recordObservabilityEvent({ ...parsed.data, userId: session.user.id }) },
    { status: 201 },
  )
}
