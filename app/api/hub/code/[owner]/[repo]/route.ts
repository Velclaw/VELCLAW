import { NextRequest, NextResponse } from 'next/server'
import { getOctokit } from '@/lib/github/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> },
) {
  try {
    const { owner, repo } = await params
    const octokit = await getOctokit()

    if (!octokit.auth) {
      return NextResponse.json({ success: false, error: 'GitHub authentication required' }, { status: 401 })
    }

    const [repository, branches, commits] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listBranches({ owner, repo, per_page: 30 }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 10 }),
    ])

    return NextResponse.json({
      success: true,
      repository: {
        id: repository.data.id,
        name: repository.data.name,
        fullName: repository.data.full_name,
        description: repository.data.description,
        private: repository.data.private,
        defaultBranch: repository.data.default_branch,
        htmlUrl: repository.data.html_url,
        updatedAt: repository.data.updated_at,
      },
      branches: branches.data.map((branch) => ({ name: branch.name, sha: branch.commit.sha })),
      commits: commits.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name ?? null,
        date: commit.commit.author?.date ?? null,
        url: commit.html_url,
      })),
    })
  } catch (error) {
    console.error('Velclaw Code repository error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load repository' }, { status: 500 })
  }
}
