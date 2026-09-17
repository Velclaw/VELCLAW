import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getSessionFromReq } from '@/lib/session/server'
import { db } from '@/lib/db/client'
import { generateApiToken } from '@/lib/api-tokens'

export const runtime = 'nodejs'

async function requireUser(req: NextRequest) {
  const session = await getSessionFromReq(req)
  if (!session?.user?.id) return null
  return session.user.id
}

export async function GET(req: NextRequest) {
  const userId = await requireUser(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await db.execute(sql`
      SELECT id, name, token_prefix, created_at, last_used_at, revoked_at
      FROM developer_api_keys
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `)

    return NextResponse.json({ success: true, apiKeys: result })
  } catch (error) {
    console.error('Error fetching developer API keys:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await requireUser(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = (await req.json().catch(() => ({}))) as { name?: string }
    const name = body.name?.trim().slice(0, 80) || 'Default key'
    const { token, tokenHash, tokenPrefix } = generateApiToken()
    const id = nanoid()

    await db.execute(sql`
      INSERT INTO developer_api_keys (id, user_id, name, token_hash, token_prefix)
      VALUES (${id}, ${userId}, ${name}, ${tokenHash}, ${tokenPrefix})
    `)

    return NextResponse.json(
      {
        success: true,
        apiKey: {
          id,
          name,
          token,
          tokenPrefix,
          createdAt: new Date().toISOString(),
        },
        warning: 'Copy this token now. The full secret is shown only once.',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating developer API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await requireUser(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Key id is required' }, { status: 400 })

    const result = await db.execute(sql`
      UPDATE developer_api_keys
      SET revoked_at = NOW()
      WHERE id = ${id} AND user_id = ${userId} AND revoked_at IS NULL
      RETURNING id
    `)

    if (result.length === 0) {
      return NextResponse.json({ error: 'API key not found or already revoked' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking developer API key:', error)
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 })
  }
}
