import { NextResponse } from 'next/server'
import { oauthMetadata } from '@/lib/velclaw/oauth'

export async function GET() {
  return NextResponse.json(oauthMetadata(), { headers: { 'Cache-Control': 'public, max-age=300' } })
}
