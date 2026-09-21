import 'server-only'

const LINEAR_GRAPHQL_URL = 'https://api.linear.app/graphql'
const LINEAR_TOKEN_URL = 'https://api.linear.app/oauth/token'
const LINEAR_AUTHORIZE_URL = 'https://linear.app/oauth/authorize'

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

export function getLinearOAuthConfig() {
  return {
    clientId: required('LINEAR_CLIENT_ID'),
    clientSecret: required('LINEAR_CLIENT_SECRET'),
    redirectUri: required('LINEAR_REDIRECT_URI'),
  }
}

export function getLinearAuthorizeUrl(input: {
  state: string
  codeChallenge: string
  scope?: string
}) {
  const config = getLinearOAuthConfig()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: input.scope || 'read,write',
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: 'S256',
  })
  return `${LINEAR_AUTHORIZE_URL}?${params.toString()}`
}

export async function exchangeLinearCode(code: string, codeVerifier: string) {
  const config = getLinearOAuthConfig()
  const body = new URLSearchParams({
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
  })

  const response = await fetch(LINEAR_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`Linear OAuth token exchange failed (${response.status})`)
  return (await response.json()) as {
    access_token: string
    refresh_token?: string
    expires_in?: number
    scope?: string
    token_type?: string
  }
}

export async function refreshLinearToken(refreshToken: string) {
  const config = getLinearOAuthConfig()
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
  })

  const response = await fetch(LINEAR_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`Linear OAuth refresh failed (${response.status})`)
  return (await response.json()) as {
    access_token: string
    refresh_token?: string
    expires_in?: number
    scope?: string
  }
}

export async function linearGraphQL<T>(accessToken: string, query: string, variables?: Record<string, unknown>) {
  const response = await fetch(LINEAR_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  const payload = (await response.json()) as { data?: T; errors?: Array<{ message: string }> }
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.map((error) => error.message).join('; ') || `Linear API failed (${response.status})`)
  }
  return payload.data as T
}

export async function getLinearViewer(accessToken: string) {
  return linearGraphQL<{ viewer: { id: string; name: string; email: string } }>(
    accessToken,
    `query Viewer { viewer { id name email } }`,
  )
}

export async function getLinearWorkspace(accessToken: string) {
  return linearGraphQL<{
    viewer: { id: string; name: string; email: string }
    teams: { nodes: Array<{ id: string; name: string; key: string }> }
  }>(
    accessToken,
    `query Workspace { viewer { id name email } teams(first: 50) { nodes { id name key } } }`,
  )
}

export async function getLinearIssues(accessToken: string, teamId?: string) {
  return linearGraphQL<{
    issues: {
      nodes: Array<{
        id: string
        identifier: string
        title: string
        description: string | null
        priority: number
        url: string
        state: { name: string }
        team: { id: string; name: string; key: string }
      }>
    }
  }>(
    accessToken,
    `query Issues($filter: IssueFilter) { issues(first: 50, filter: $filter, orderBy: updatedAt) { nodes { id identifier title description priority url state { name } team { id name key } } } }`,
    teamId ? { filter: { team: { id: { eq: teamId } } } } : {},
  )
}

export async function createLinearIssue(
  accessToken: string,
  input: { teamId: string; title: string; description?: string },
) {
  return linearGraphQL<{
    issueCreate: { success: boolean; issue?: { id: string; identifier: string; title: string; url: string } }
  }>(
    accessToken,
    `mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier title url } } }`,
    { input },
  )
}

export async function updateLinearIssue(
  accessToken: string,
  input: { id: string; title?: string; description?: string },
) {
  return linearGraphQL<{
    issueUpdate: { success: boolean; issue?: { id: string; identifier: string; title: string; url: string } }
  }>(
    accessToken,
    `mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success issue { id identifier title url } } }`,
    { id: input.id, input: { title: input.title, description: input.description } },
  )
}
