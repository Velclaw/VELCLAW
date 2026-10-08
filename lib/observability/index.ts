import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
export type ObservabilityLevel = 'info' | 'warn' | 'error'
export type ObservabilityEvent = {
  id: string
  userId: string | null
  service: string
  level: ObservabilityLevel
  event: string
  durationMs: number | null
  traceId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}
const sql = postgres(process.env.POSTGRES_URL || '', { max: 5 })
let initialized = false
async function ensureStore() {
  if (initialized) return
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL environment variable is required')
  await sql`CREATE TABLE IF NOT EXISTS velclaw_observability_events(
    id text PRIMARY KEY,user_id text,service text NOT NULL,level text NOT NULL DEFAULT 'info',event text NOT NULL,
    duration_ms integer,trace_id text,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz NOT NULL DEFAULT now())`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_observability_created_idx ON velclaw_observability_events(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_observability_service_idx ON velclaw_observability_events(service,created_at DESC)`
  initialized = true
}
export async function recordObservabilityEvent(input: {
  userId?: string | null
  service: string
  level?: ObservabilityLevel
  event: string
  durationMs?: number | null
  traceId?: string | null
  metadata?: Record<string, unknown>
}) {
  await ensureStore()
  const r = await sql<
    ObservabilityEvent[]
  >`INSERT INTO velclaw_observability_events(id,user_id,service,level,event,duration_ms,trace_id,metadata)
    VALUES(${randomUUID()},${input.userId || null},${input.service},${input.level || 'info'},${input.event},${input.durationMs ?? null},${input.traceId || null},${JSON.stringify(input.metadata || {})}::jsonb)
    RETURNING id,user_id as "userId",service,level,event,duration_ms as "durationMs",trace_id as "traceId",metadata,created_at as "createdAt"`
  return r[0]
}
export async function getObservabilitySummary() {
  await ensureStore()
  const [totals, services] = await Promise.all([
    sql`SELECT count(*)::int as total,count(*) FILTER(WHERE level='error')::int as errors,count(*) FILTER(WHERE level='warn')::int as warnings,coalesce(round(avg(duration_ms))::int,0) as "avgDurationMs" FROM velclaw_observability_events WHERE created_at>now()-interval '24 hours'`,
    sql`SELECT service,count(*)::int as events,count(*) FILTER(WHERE level='error')::int as errors,coalesce(round(avg(duration_ms))::int,0) as "avgDurationMs" FROM velclaw_observability_events WHERE created_at>now()-interval '24 hours' GROUP BY service ORDER BY events DESC LIMIT 20`,
  ])
  return { window: '24h', totals: totals[0], services }
}
export async function listObservabilityEvents(limit = 100) {
  await ensureStore()
  return sql<
    ObservabilityEvent[]
  >`SELECT id,user_id as "userId",service,level,event,duration_ms as "durationMs",trace_id as "traceId",metadata,created_at as "createdAt" FROM velclaw_observability_events ORDER BY created_at DESC LIMIT ${Math.min(Math.max(limit, 1), 200)}`
}
