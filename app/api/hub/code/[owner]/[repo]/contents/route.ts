import { NextRequest, NextResponse } from 'next/server'
import { getOctokit } from '@/lib/github/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> },
) {
  try {
    const { owner, repo } = await params
    const path = request.nextUrl.searchParams.get('path') || ''
    const ref = request.nextUrl.searchParams.get('ref') || undefined
    const octokit = await getOctokit()

    if (!octokit.auth) {
      return NextResponse.json({ success: false, error: 'GitHub authentication required' }, { status: 401 })
    }

    const response = await octokit.rest.repos.getContent({ owner, repo, path, ...(ref ? { ref } : {}) })
    const data = response.data

    if (Array.isArray(data)) {
      return NextResponse.json({
        success: true,
        type: 'directory',
        entries: data.map((entry) => ({
          name: entry.name,
          path: entry.path,
          type: entry.type,
          sha: entry.sha,
          size: entry.size ?? null,
        })),
      })
    }

    if (data.type !== 'file') {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported GitHub content type: ${data.type}`,
        },
        { status: 422 },
      )
    }

    return NextResponse.json({
      success: true,
      type: 'file',
      file: {
        name: data.name,
        path: data.path,
        sha: data.sha,
        size: data.size ?? null,
        url: data.html_url ?? null,
        content: data.content ?? null,
        encoding: data.encoding ?? null,
      },
    })
  } catch (error) {
    console.error('Velclaw Code contents error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load repository contents' }, { status: 500 })
  }
}
