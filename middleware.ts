import { NextRequest, NextResponse } from 'next/server'

const LEGACY_HOSTS = new Set(['velclaw.cfd', 'www.velclaw.cfd'])
const PRIMARY_ORIGIN = 'https://velclaw.site'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase().split(':')[0]

  if (!host || !LEGACY_HOSTS.has(host)) {
    return NextResponse.next()
  }

  const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, PRIMARY_ORIGIN)
  return NextResponse.redirect(destination, 301)
}

export const config = {
  matcher: '/:path*',
}
