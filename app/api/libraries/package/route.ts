import { NextRequest, NextResponse } from 'next/server'

const NPM_REGISTRY = 'https://registry.npmjs.org'
const PACKAGE_NAME = /^(?:@[^/\s]+\/)?[a-zA-Z0-9._~-]+$/
const VERSION = /^[0-9A-Za-z*^~<>=.|+\-\s]+$/

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim() || ''
  const version = request.nextUrl.searchParams.get('version')?.trim() || ''

  if (!PACKAGE_NAME.test(name)) {
    return NextResponse.json({ error: 'Invalid package name' }, { status: 400 })
  }
  if (version && !VERSION.test(version)) {
    return NextResponse.json({ error: 'Invalid package version' }, { status: 400 })
  }

  const encodedName = name.startsWith('@') ? name.replace('/', '%2F') : encodeURIComponent(name)
  const url = `${NPM_REGISTRY}/${encodedName}${version ? `/${encodeURIComponent(version)}` : ''}`

  try {
    const response = await fetch(url, { headers: { accept: 'application/json' }, next: { revalidate: 60 } })
    if (!response.ok) return NextResponse.json({ error: 'Package not found' }, { status: response.status === 404 ? 404 : 502 })

    const data = await response.json()
    return NextResponse.json({
      name: data.name,
      version: data.version,
      description: data.description || '',
      license: data.license || null,
      repository: typeof data.repository === 'object' ? data.repository?.url || null : data.repository || null,
      homepage: data.homepage || null,
      dist: data.dist ? { tarball: data.dist.tarball, integrity: data.dist.integrity || null } : null,
      versions: data.versions ? Object.keys(data.versions).slice(-50).reverse() : [],
    })
  } catch (error) {
    console.error('Library metadata lookup failed:', error)
    return NextResponse.json({ error: 'Library metadata lookup failed' }, { status: 500 })
  }
}
