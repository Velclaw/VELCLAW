import { NextRequest, NextResponse } from 'next/server'
import { getOctokit } from '@/lib/github/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const { owner, repo } = await params
    const ref = request.nextUrl.searchParams.get('ref') || undefined
    const octokit = await getOctokit()

    if (!octokit.auth) {
      return NextResponse.json({ success: false, error: 'GitHub authentication required' }, { status: 401 })
    }

    const response = await octokit.rest.repos.listCommits({ owner, repo, per_page: 50, ...(ref ? { sha: ref } : {}) })
    return NextResponse.json({
      success: true,
      commits: response.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name ?? null,
        date: commit.commit.author?.date ?? null,
        url: commit.html_url,
      })),
    })
  } catch (error) {
    console.error('Velclaw Code commits error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load commit history' }, { status: 500 })
  }
}
