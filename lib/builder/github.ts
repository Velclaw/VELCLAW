import 'server-only'

import { getOctokit, parseGitHubUrl } from '@/lib/github/client'

export type BuilderFile = { path: string; content: string }

const MAX_FILES = 150
const MAX_FILE_BYTES = 300_000
const MAX_TOTAL_BYTES = 2_000_000
const BLOCKED = /(^|\/)(node_modules|\.git|\.next|dist|build|coverage)(\/|$)/

function assertPath(path: string) {
  if (!path || path.startsWith('/') || path.includes('..') || BLOCKED.test(path)) throw new Error(`Unsafe repository path: ${path}`)
}

export async function importGitHubWorkspace(repoUrl: string, branch = 'main') {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) throw new Error('Invalid GitHub repository URL')

  const octokit = await getOctokit()
  if (!octokit.auth) throw new Error('GitHub account is not connected')

  const ref = await octokit.rest.git.getRef({ owner: parsed.owner, repo: parsed.repo, ref: `heads/${branch}` })
  const commit = await octokit.rest.git.getCommit({ owner: parsed.owner, repo: parsed.repo, commit_sha: ref.data.object.sha })
  const tree = await octokit.rest.git.getTree({ owner: parsed.owner, repo: parsed.repo, tree_sha: commit.data.tree.sha, recursive: 'true' })

  const candidates = tree.data.tree.filter((entry) => entry.type === 'blob' && entry.path && !BLOCKED.test(entry.path))
  if (candidates.length > MAX_FILES) throw new Error(`Repository has too many source files (${candidates.length}). Limit is ${MAX_FILES}.`)

  const files: BuilderFile[] = []
  let totalBytes = 0
  for (const entry of candidates) {
    const path = entry.path!
    assertPath(path)
    const blob = await octokit.rest.git.getBlob({ owner: parsed.owner, repo: parsed.repo, file_sha: entry.sha! })
    if (blob.data.encoding !== 'base64' || typeof blob.data.content !== 'string') continue
    const content = Buffer.from(blob.data.content.replace(/\n/g, ''), 'base64').toString('utf8')
    const bytes = Buffer.byteLength(content)
    if (bytes > MAX_FILE_BYTES) continue
    totalBytes += bytes
    if (totalBytes > MAX_TOTAL_BYTES) throw new Error('Repository source exceeds the 2 MB browser workspace limit.')
    files.push({ path, content })
  }

  return { owner: parsed.owner, repo: parsed.repo, branch, commitSha: ref.data.object.sha, files }
}

export async function publishGitHubWorkspace(input: {
  repoUrl: string
  baseBranch: string
  branchName: string
  title: string
  body?: string
  files: BuilderFile[]
}) {
  const parsed = parseGitHubUrl(input.repoUrl)
  if (!parsed) throw new Error('Invalid GitHub repository URL')
  if (!/^[A-Za-z0-9._/-]{1,120}$/.test(input.baseBranch) || !/^[A-Za-z0-9._/-]{1,120}$/.test(input.branchName)) {
    throw new Error('Invalid Git branch name')
  }
  if (!input.files.length || input.files.length > MAX_FILES) throw new Error('Invalid workspace file count')

  const octokit = await getOctokit()
  if (!octokit.auth) throw new Error('GitHub account is not connected')

  const baseRef = await octokit.rest.git.getRef({ owner: parsed.owner, repo: parsed.repo, ref: `heads/${input.baseBranch}` })
  const baseSha = baseRef.data.object.sha
  const baseCommit = await octokit.rest.git.getCommit({ owner: parsed.owner, repo: parsed.repo, commit_sha: baseSha })

  const blobs = []
  let totalBytes = 0
  for (const file of input.files) {
    assertPath(file.path)
    const bytes = Buffer.byteLength(file.content, 'utf8')
    if (bytes > MAX_FILE_BYTES) throw new Error(`File is too large: ${file.path}`)
    totalBytes += bytes
    if (totalBytes > MAX_TOTAL_BYTES) throw new Error('Workspace exceeds the 2 MB publish limit.')
    const blob = await octokit.rest.git.createBlob({ owner: parsed.owner, repo: parsed.repo, content: Buffer.from(file.content, 'utf8').toString('base64'), encoding: 'base64' })
    blobs.push({ path: file.path, mode: '100644' as const, type: 'blob' as const, sha: blob.data.sha })
  }

  const tree = await octokit.rest.git.createTree({ owner: parsed.owner, repo: parsed.repo, base_tree: baseCommit.data.tree.sha, tree: blobs })
  const commit = await octokit.rest.git.createCommit({ owner: parsed.owner, repo: parsed.repo, message: input.title, tree: tree.data.sha, parents: [baseSha] })

  try {
    await octokit.rest.git.createRef({ owner: parsed.owner, repo: parsed.repo, ref: `refs/heads/${input.branchName}`, sha: commit.data.sha })
  } catch (error: unknown) {
    const status = error && typeof error === 'object' && 'status' in error ? (error as { status?: number }).status : undefined
    if (status === 422) throw new Error(`Branch already exists: ${input.branchName}`)
    throw error
  }

  const pr = await octokit.rest.pulls.create({
    owner: parsed.owner,
    repo: parsed.repo,
    title: input.title,
    body: input.body || 'Created by Velclaw Builder.',
    head: input.branchName,
    base: input.baseBranch,
  })

  return { branch: input.branchName, commitSha: commit.data.sha, prNumber: pr.data.number, prUrl: pr.data.html_url }
}
