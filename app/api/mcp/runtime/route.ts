import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getMcpRuntimeSummary } from '@/lib/mcp/registry'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = getMcpRuntimeSummary()

    return NextResponse.json({
      total: summary.total,
      ready: summary.ready,
      disabled: summary.disabled,
      missingEnv: summary.missingEnv,
      servers: summary.servers.map((server) => ({
        id: server.id,
        type: server.type,
        command: server.command,
        args: server.args,
        url: server.url,
        disabled: server.disabled,
        state: server.state,
        requiredEnv: server.requiredEnv,
        configuredEnv: server.configuredEnv,
      })),
    })
  } catch (error) {
    console.error('Failed to load MCP runtime registry:', error)
    return NextResponse.json({ error: 'Failed to load MCP runtime registry' }, { status: 500 })
  }
}
