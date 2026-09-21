import postgres from 'postgres'
import { createHash } from 'node:crypto'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 5 })

export const EVIDENCE_COMPONENTS = [
  'kubernetes_api',
  'postgresql',
  'github_credentials',
  'ghcr_registry',
  'k3s_wireguard',
  'dns_cloudflare',
  'tls_letsencrypt',
] as const

export type EvidenceComponent = (typeof EVIDENCE_COMPONENTS)[number]
export type EvidenceStatus = 'unverified' | 'verified'

export type RuntimeEvidence = {
  component: EvidenceComponent
  status: EvidenceStatus
  evidenceHash: string | null
  evidence: string | null
  capturedAt: string | null
  attestedBy: string | null
  source: 'operator_attestation' | null
}

let initialized = false

export async function ensureRuntimeEvidenceStore() {
  if (initialized) return
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL environment variable is required')
  await sql`
    CREATE TABLE IF NOT EXISTS velclaw_runtime_evidence (
      component text PRIMARY KEY,
      status text NOT NULL DEFAULT 'unverified',
      evidence_hash text,
      evidence_text text,
      captured_at timestamptz,
      attested_by text,
      source text,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  initialized = true
}

export async function listRuntimeEvidence(): Promise<RuntimeEvidence[]> {
  await ensureRuntimeEvidenceStore()
  const rows = await sql<RuntimeEvidence[]>`
    SELECT component, status, evidence_hash as "evidenceHash", evidence_text as evidence,
      captured_at as "capturedAt", attested_by as "attestedBy", source
    FROM velclaw_runtime_evidence
    ORDER BY component
  `
  const byComponent = new Map(rows.map((row) => [row.component, row]))
  return EVIDENCE_COMPONENTS.map((component) => byComponent.get(component) || {
    component,
    status: 'unverified',
    evidenceHash: null,
    evidence: null,
    capturedAt: null,
    attestedBy: null,
    source: null,
  })
}

export async function attestRuntimeEvidence(input: {
  component: EvidenceComponent
  evidence: string
  attestedBy: string
}) {
  await ensureRuntimeEvidenceStore()
  const evidence = input.evidence.trim()
  if (!evidence) throw new Error('Evidence output is required')
  if (evidence.length > 32768) throw new Error('Evidence output exceeds 32 KiB')
  const attestedBy = input.attestedBy.trim().slice(0, 320) || 'operator'
  const evidenceHash = createHash('sha256').update(evidence, 'utf8').digest('hex')
  const rows = await sql<RuntimeEvidence[]>`
    INSERT INTO velclaw_runtime_evidence
      (component, status, evidence_hash, evidence_text, captured_at, attested_by, source, updated_at)
    VALUES
      (${input.component}, 'verified', ${evidenceHash}, ${evidence}, now(), ${attestedBy}, 'operator_attestation', now())
    ON CONFLICT (component) DO UPDATE SET
      status = 'verified', evidence_hash = EXCLUDED.evidence_hash, evidence_text = EXCLUDED.evidence_text,
      captured_at = EXCLUDED.captured_at, attested_by = EXCLUDED.attested_by,
      source = 'operator_attestation', updated_at = now()
    RETURNING component, status, evidence_hash as "evidenceHash", evidence_text as evidence,
      captured_at as "capturedAt", attested_by as "attestedBy", source
  `
  return rows[0]
}

export async function revokeRuntimeEvidence(component: EvidenceComponent) {
  await ensureRuntimeEvidenceStore()
  await sql`
    UPDATE velclaw_runtime_evidence
    SET status = 'unverified', evidence_hash = NULL, evidence_text = NULL,
        captured_at = NULL, attested_by = NULL, source = NULL, updated_at = now()
    WHERE component = ${component}
  `
}
