import { NextRequest, NextResponse } from 'next/server'

const NPM_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search'
const MAX_QUERY_LENGTH = 120

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  const size = Math.min(Math.max(Number(request.nextUrl.searchParams.get('size') || 20), 1), 50)

  if (!query) return NextResponse.json({ packages: [] })
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Search query is too long' }, { status: 400 })
  }

  try {
    const url = new URL(NPM_SEARCH_URL)
    url.searchParams.set('text', query)
    url.searchParams.set('size', String(size))

    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'npm registry search failed' }, { status: 502 })
    }

    const data = await response.json()
    const packages = Array.isArray(data.objects)
      ? data.objects.map((entry: any) => ({
          name: entry.package?.name,
          version: entry.package?.version,
          description: entry.package?.description || '',
          keywords: entry.package?.keywords || [],
          license: entry.package?.license || null,
          repository: entry.package?.links?.repository || null,
          npm: entry.package?.links?.npm || `https://www.npmjs.com/package/${encodeURIComponent(entry.package?.name || '')}`,
        })).filter((entry: { name?: string }) => Boolean(entry.name))
      : []

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Library search failed:', error)
    return NextResponse.json({ error: 'Library search failed' }, { status: 500 })
  }
}
