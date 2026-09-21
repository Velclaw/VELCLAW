import { NextResponse } from 'next/server'
import { ECOSYSTEM_LIFECYCLE, ECOSYSTEM_PROJECTS } from '@/lib/ecosystem/projects'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    schemaVersion: 1,
    canonicalDomain: 'velclaw.cfd',
    canonicalRepository: 'Velclaw/VELCLAW',
    projects: ECOSYSTEM_PROJECTS,
    lifecycle: ECOSYSTEM_LIFECYCLE,
  })
}
