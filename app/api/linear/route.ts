import { NextRequest, NextResponse } from 'next/server'
import { createLinearIssue, getLinearIssues } from '@/lib/linear/client'
import { getCurrentUserLinearConnection } from '@/lib/linear/user-connection'

export async function GET(request: NextRequest) {
  const connection = await getCurrentUserLinearConnection()
  if (!connection) return NextResponse.json({ connected: false, teams: [], issues: [] })

  try {
    const teamId = request.nextUrl.searchParams.get('teamId') || undefined
    const issues = await getLinearIssues(connection.accessToken, teamId)
    return NextResponse.json({ connected: true, viewer: connection.viewer, teams: connection.teams, issues: issues.issues.nodes })
  } catch (error) {
    console.error('Linear read failed', error)
    return NextResponse.json({ error: 'Failed to load Linear data' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const connection = await getCurrentUserLinearConnection()
  if (!connection) return NextResponse.json({ error: 'Linear is not connected' }, { status: 409 })

  try {
    const body = (await request.json()) as { teamId: string; title: string; description?: string }
    if (!body.teamId || !body.title?.trim()) return NextResponse.json({ error: 'teamId and title are required' }, { status: 400 })
    const result = await createLinearIssue(connection.accessToken, { teamId: body.teamId, title: body.title.trim(), description: body.description?.trim() })
    return NextResponse.json(result.issueCreate)
  } catch (error) {
    console.error('Linear issue creation failed', error)
    return NextResponse.json({ error: 'Failed to create Linear issue' }, { status: 502 })
  }
}
