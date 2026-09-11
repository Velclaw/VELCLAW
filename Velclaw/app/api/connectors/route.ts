import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { connectors } from '@/lib/db/schema'
import { getSessionFromReq } from '@/lib/session/server'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          data: [],
        },
        { status: 401 },
      )
    }

    const userConnectors = await db
      .select({
        id: connectors.id,
        userId: connectors.userId,
        name: connectors.name,
        description: connectors.description,
        type: connectors.type,
        baseUrl: connectors.baseUrl,
        oauthClientId: connectors.oauthClientId,
        command: connectors.command,
        status: connectors.status,
        createdAt: connectors.createdAt,
        updatedAt: connectors.updatedAt,
      })
      .from(connectors)
      .where(eq(connectors.userId, session.user.id))

    return NextResponse.json(
      {
        success: true,
        data: userConnectors,
      },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching connectors:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch connectors',
        data: [],
      },
      { status: 500 },
    )
  }
}
