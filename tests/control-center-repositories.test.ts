import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test, { type TestContext } from 'node:test'
import { NextRequest } from 'next/server'

const routeRequire = createRequire(import.meta.url)
const cacheControl = 'private, no-store, max-age=0'
const token = 'synthetic-connected-user-token'
const repositoryFixture = {
  id: 101,
  name: 'workspace',
  full_name: 'example/workspace',
  owner: { login: 'example', type: 'Organization' },
  html_url: 'https://github.com/example/workspace',
  visibility: 'private' as string | null | undefined,
  private: true,
  archived: false,
  default_branch: 'release',
  language: 'TypeScript' as string | null,
  pushed_at: '2026-10-19T10:00:00Z' as string | null,
  updated_at: '2026-10-20T11:00:00Z',
}
const workflowFixture = {
  id: 201,
  status: 'completed',
  conclusion: 'success' as string | null,
  head_sha: 'abc123',
  html_url: 'https://github.com/example/workspace/actions/runs/201',
  updated_at: '2026-10-20T12:00:00Z',
}
const deploymentFixture = {
  id: 301,
  environment: 'production',
  ref: 'release',
  sha: 'abc123',
  created_at: '2026-10-20T12:00:00Z',
}
const deploymentStatusFixture = {
  state: 'success' as string | null | undefined,
  updated_at: '2026-10-20T12:01:00Z' as string | null | undefined,
  environment_url: 'https://workspace.example.test' as string | null | undefined,
}

function statusRequest(parameters: Record<string, string> = { owner: 'example', repo: 'workspace' }) {
  const url = new URL('https://example.test/api/control-center/repositories/status')
  url.search = new URLSearchParams(parameters).toString()
  return new NextRequest(url)
}

function createHarness(t: TestContext) {
  const getServerSession = t.mock.fn(async (): Promise<unknown> => ({ user: { id: 'synthetic-user' } }))
  const getUserGitHubToken = t.mock.fn(async (_request?: NextRequest): Promise<string | null> => token)
  const listForAuthenticatedUser = t.mock.fn()
  const paginate = t.mock.fn(
    async (_method: unknown, _parameters: unknown): Promise<(typeof repositoryFixture)[]> => [],
  )
  const get = t.mock.fn(async (_parameters: unknown) => ({ data: repositoryFixture }))
  const listWorkflowRunsForRepo = t.mock.fn(async (_parameters: unknown) => ({
    data: { workflow_runs: [] as (typeof workflowFixture)[] },
  }))
  const listDeployments = t.mock.fn(async (_parameters: unknown) => ({ data: [] as (typeof deploymentFixture)[] }))
  const listDeploymentStatuses = t.mock.fn(async (_parameters: unknown) => ({
    data: [] as (typeof deploymentStatusFixture)[],
  }))
  const client = {
    paginate,
    rest: {
      repos: { listForAuthenticatedUser, get, listDeployments, listDeploymentStatuses },
      actions: { listWorkflowRunsForRepo },
    },
  }
  const constructOctokit = t.mock.fn((_options: { auth: string }) => client)
  class Octokit {
    constructor(options: { auth: string }) {
      return constructOctokit(options)
    }
  }

  // Load the real handlers through tsx, replacing only their external boundaries.
  // Restore the cache synchronously so no session, database, or GitHub state leaks
  // between tests; NextRequest and NextResponse remain real framework objects.
  const dependencies = new Map([
    [routeRequire.resolve('../lib/session/get-server-session'), { getServerSession }],
    [routeRequire.resolve('../lib/github/user-token'), { getUserGitHubToken }],
    [routeRequire.resolve('@octokit/rest'), { Octokit }],
  ])
  const inventoryPath = routeRequire.resolve('../app/api/control-center/repositories/route')
  const statusPath = routeRequire.resolve('../app/api/control-center/repositories/status/route')
  const previous = new Map(
    [...dependencies.keys(), inventoryPath, statusPath].map((id) => [id, routeRequire.cache[id]]),
  )
  let routes
  try {
    for (const [id, exports] of dependencies) {
      routeRequire.cache[id] = { id, filename: id, loaded: true, exports } as NodeModule
    }
    delete routeRequire.cache[inventoryPath]
    delete routeRequire.cache[statusPath]
    routes = {
      inventory: routeRequire(inventoryPath) as typeof import('../app/api/control-center/repositories/route'),
      status: routeRequire(statusPath) as typeof import('../app/api/control-center/repositories/status/route'),
    }
  } finally {
    for (const [id, cached] of previous) {
      if (cached) routeRequire.cache[id] = cached
      else delete routeRequire.cache[id]
    }
  }

  return {
    ...routes,
    getServerSession,
    getUserGitHubToken,
    constructOctokit,
    listForAuthenticatedUser,
    paginate,
    get,
    listWorkflowRunsForRepo,
    listDeployments,
    listDeploymentStatuses,
  }
}

function assertResponse(response: Response, status = 200) {
  assert.equal(response.status, status)
  assert.equal(response.headers.get('Cache-Control'), cacheControl)
  assert.match(response.headers.get('Content-Type') ?? '', /application\/json/)
}

function assertObservedAt(value: string, before: number, after: number) {
  assert.equal(new Date(value).toISOString(), value)
  assert.ok(Date.parse(value) >= before && Date.parse(value) <= after)
}

for (const endpoint of ['inventory', 'status'] as const) {
  for (const [label, session] of [
    ['missing session', undefined],
    ['null session', null],
    ['missing user', {}],
    ['missing user ID', { user: {} }],
    ['empty user ID', { user: { id: '' } }],
  ] as const) {
    test(`${endpoint} rejects a ${label} before looking up credentials`, async (t) => {
      const harness = createHarness(t)
      harness.getServerSession.mock.mockImplementation(async () => session)

      const response = await harness[endpoint].GET(statusRequest())

      assertResponse(response, 401)
      assert.deepEqual(await response.json(), { error: 'Unauthorized' })
      assert.equal(harness.getServerSession.mock.callCount(), 1)
      assert.equal(harness.getUserGitHubToken.mock.callCount(), 0)
      assert.equal(harness.constructOctokit.mock.callCount(), 0)
    })
  }

  for (const missingToken of [null, '']) {
    test(`${endpoint} rejects a disconnected GitHub account with a ${missingToken === null ? 'null' : 'blank'} token`, async (t) => {
      const harness = createHarness(t)
      harness.getUserGitHubToken.mock.mockImplementation(async () => missingToken)

      const response = await harness[endpoint].GET(statusRequest())

      assertResponse(response, 409)
      assert.deepEqual(await response.json(), {
        error: 'GitHub account is not connected',
        code: 'GITHUB_NOT_CONNECTED',
      })
      assert.equal(harness.getUserGitHubToken.mock.callCount(), 1)
      assert.equal(harness.constructOctokit.mock.callCount(), 0)
    })
  }
}

test('inventory paginates with the connected user token and returns only public response fields', async (t) => {
  const harness = createHarness(t)
  const repositories = [
    { ...repositoryFixture, access_token: token, permissions: { admin: true } },
    {
      ...repositoryFixture,
      id: 102,
      name: 'archived-project',
      full_name: 'another-user/archived-project',
      owner: { login: 'another-user', type: 'User' },
      html_url: 'https://github.com/another-user/archived-project',
      visibility: 'public',
      private: false,
      archived: true,
      default_branch: 'trunk',
      language: null,
      pushed_at: null,
    },
  ]
  harness.paginate.mock.mockImplementation(async () => repositories)
  const before = Date.now()

  const response = await harness.inventory.GET()
  const after = Date.now()
  const body = await response.json()

  assertResponse(response)
  assert.deepEqual(harness.constructOctokit.mock.calls[0].arguments, [{ auth: token }])
  assert.equal(harness.constructOctokit.mock.callCount(), 1)
  assert.deepEqual(harness.getUserGitHubToken.mock.calls[0].arguments, [])
  assert.equal(harness.paginate.mock.callCount(), 1)
  assert.deepEqual(harness.paginate.mock.calls[0].arguments, [
    harness.listForAuthenticatedUser,
    { per_page: 100, sort: 'updated', direction: 'desc', affiliation: 'owner,collaborator,organization_member' },
  ])
  assertObservedAt(body.observed_at, before, after)
  assert.deepEqual(body, {
    source: 'GitHub REST API',
    scope: 'repositories accessible to the authenticated GitHub user',
    observed_at: body.observed_at,
    last_checked_at: body.observed_at,
    complete: true,
    count: 2,
    repositories: [
      {
        id: 101,
        name: 'workspace',
        full_name: 'example/workspace',
        owner: 'example',
        owner_type: 'Organization',
        url: repositoryFixture.html_url,
        visibility: 'private',
        private: true,
        archived: false,
        default_branch: 'release',
        language: 'TypeScript',
        pushed_at: repositoryFixture.pushed_at,
        updated_at: repositoryFixture.updated_at,
        source: 'github:user-repositories',
        observed_at: body.observed_at,
      },
      {
        id: 102,
        name: 'archived-project',
        full_name: 'another-user/archived-project',
        owner: 'another-user',
        owner_type: 'User',
        url: repositories[1].html_url,
        visibility: 'public',
        private: false,
        archived: true,
        default_branch: 'trunk',
        language: null,
        pushed_at: null,
        updated_at: repositoryFixture.updated_at,
        source: 'github:user-repositories',
        observed_at: body.observed_at,
      },
    ],
  })
  assert.ok(!JSON.stringify(body).includes(token))
})

for (const [visibility, isPrivate, expected] of [
  [undefined, true, 'private'],
  [null, false, 'public'],
  ['internal', true, 'internal'],
] as const) {
  test(`inventory resolves visibility ${String(visibility)} with private=${isPrivate}`, async (t) => {
    const harness = createHarness(t)
    harness.paginate.mock.mockImplementation(async () => [{ ...repositoryFixture, visibility, private: isPrivate }])

    const response = await harness.inventory.GET()

    assertResponse(response)
    const body = await response.json()
    assert.equal(body.repositories[0].visibility, expected)
  })
}

for (const count of [0, 101]) {
  test(`inventory returns all ${count} paginated repositories without truncation or synthetic records`, async (t) => {
    const harness = createHarness(t)
    const repositories = Array.from({ length: count }, (_, id) => ({ ...repositoryFixture, id }))
    harness.paginate.mock.mockImplementation(async () => repositories)

    const response = await harness.inventory.GET()
    const body = await response.json()

    assertResponse(response)
    assert.equal(body.complete, true)
    assert.equal(body.count, count)
    assert.deepEqual(
      body.repositories.map((repository: { id: number }) => repository.id),
      repositories.map(({ id }) => id),
    )
  })
}

for (const [label, error, denied] of [
  ['access denied or rate limited', { status: 403, message: token }, true],
  ['string access-denied status', { status: '403', message: token }, true],
  ['expired credentials', { status: 401, message: token }, false],
  ['missing upstream resource', { status: 404, message: token }, false],
  ['upstream failure', { status: 500, message: token }, false],
  ['network error', new Error(token), false],
  ['null rejection', null, false],
  ['string rejection', token, false],
] as const) {
  test(`inventory sanitizes ${label} and never reports a complete sync`, async (t) => {
    const harness = createHarness(t)
    harness.paginate.mock.mockImplementation(async () => {
      throw error
    })
    const before = Date.now()

    const response = await harness.inventory.GET()
    const after = Date.now()
    const body = await response.json()

    assertResponse(response, 502)
    assertObservedAt(body.observed_at, before, after)
    assert.deepEqual(body, {
      error: 'Unable to synchronize repositories from GitHub',
      code: denied
        ? 'GITHUB_ACCESS_DENIED_OR_RATE_LIMITED'
        : error && typeof error === 'object' && 'status' in error && Number(error.status) === 401
          ? 'GITHUB_TOKEN_INVALID'
          : 'GITHUB_SYNC_FAILED',
      source: 'GitHub REST API',
      observed_at: body.observed_at,
      last_checked_at: body.observed_at,
    })
    assert.ok(!JSON.stringify(body).includes(token))
  })
}

for (const [label, parameters] of [
  ['missing both parameters', {}],
  ['missing owner', { repo: 'workspace' }],
  ['missing repo', { owner: 'example' }],
  ['empty owner', { owner: '', repo: 'workspace' }],
  ['blank repo', { owner: 'example', repo: ' \t ' }],
  ['embedded whitespace', { owner: 'example user', repo: 'workspace' }],
  ['owner path separator', { owner: 'example/other', repo: 'workspace' }],
  ['repo path separator', { owner: 'example', repo: '../other' }],
  ['URL delimiter', { owner: 'example', repo: 'workspace?ref=main' }],
  ['encoded path separator', { owner: 'example', repo: '%2Fother' }],
  ['non-ASCII name', { owner: 'example', repo: 'répo' }],
  ['owner above length limit', { owner: 'x'.repeat(101), repo: 'workspace' }],
  ['repo above length limit', { owner: 'example', repo: 'x'.repeat(101) }],
] as [string, Record<string, string>][]) {
  test(`status rejects ${label} without calling GitHub`, async (t) => {
    const harness = createHarness(t)

    const response = await harness.status.GET(statusRequest(parameters))

    assertResponse(response, 400)
    assert.deepEqual(await response.json(), { error: 'Valid owner and repo query parameters are required' })
    assert.equal(harness.constructOctokit.mock.callCount(), 0)
    assert.equal(harness.get.mock.callCount(), 0)
  })
}

for (const name of ['a', 'A_repo-1.2', 'x'.repeat(100)]) {
  test(`status accepts a valid ${name.length}-character name and trims surrounding whitespace`, async (t) => {
    const harness = createHarness(t)
    const request = statusRequest({ owner: ` ${name}\t`, repo: `\n${name} ` })

    const response = await harness.status.GET(request)

    assertResponse(response)
    assert.deepEqual(harness.get.mock.calls[0].arguments, [{ owner: name, repo: name }])
    assert.deepEqual(harness.getUserGitHubToken.mock.calls[0].arguments, [request])
  })
}

test('status uses the default branch, latest workflow and deployment status with consistent provenance', async (t) => {
  const harness = createHarness(t)
  const deployments = Array.from({ length: 5 }, (_, index) => ({ ...deploymentFixture, id: 301 + index }))
  harness.listWorkflowRunsForRepo.mock.mockImplementation(async () => ({
    data: { workflow_runs: [workflowFixture, { ...workflowFixture, conclusion: 'failure' }] },
  }))
  harness.listDeployments.mock.mockImplementation(async () => ({ data: deployments }))
  harness.listDeploymentStatuses.mock.mockImplementation(async () => ({
    data: [deploymentStatusFixture, { ...deploymentStatusFixture, state: 'failure' }],
  }))
  const before = Date.now()

  const response = await harness.status.GET(statusRequest())
  const after = Date.now()
  const body = await response.json()

  assertResponse(response)
  assertObservedAt(body.observed_at, before, after)
  assert.equal(harness.constructOctokit.mock.callCount(), 1)
  assert.deepEqual(harness.constructOctokit.mock.calls[0].arguments, [{ auth: token }])
  assert.equal(harness.get.mock.callCount(), 1)
  assert.deepEqual(harness.get.mock.calls[0].arguments, [{ owner: 'example', repo: 'workspace' }])
  assert.equal(harness.listWorkflowRunsForRepo.mock.callCount(), 1)
  assert.deepEqual(harness.listWorkflowRunsForRepo.mock.calls[0].arguments, [
    { owner: 'example', repo: 'workspace', branch: 'release', per_page: 1 },
  ])
  assert.equal(harness.listDeployments.mock.callCount(), 1)
  assert.deepEqual(harness.listDeployments.mock.calls[0].arguments, [
    { owner: 'example', repo: 'workspace', per_page: 5 },
  ])
  assert.deepEqual(
    harness.listDeploymentStatuses.mock.calls.map(({ arguments: args }) => args),
    deployments.map(({ id }) => [{ owner: 'example', repo: 'workspace', deployment_id: id, per_page: 1 }]),
  )
  assert.deepEqual(body, {
    repository: 'example/workspace',
    default_branch: 'release',
    source: 'GitHub REST API',
    observed_at: body.observed_at,
    last_checked_at: body.observed_at,
    ci: {
      state: 'success',
      status: 'completed',
      conclusion: 'success',
      head_sha: 'abc123',
      url: workflowFixture.html_url,
      updated_at: workflowFixture.updated_at,
      source: 'github:actions',
      observed_at: body.observed_at,
    },
    deployments: {
      state: 'available',
      items: deployments.map((deployment) => ({
        ...deployment,
        updated_at: deploymentStatusFixture.updated_at,
        state: 'success',
        environment_url: deploymentStatusFixture.environment_url,
        source: 'github:deployment-status',
        observed_at: body.observed_at,
      })),
      source: 'github:deployments',
      observed_at: body.observed_at,
    },
  })
  assert.ok(!JSON.stringify(body).includes(token))
})

test('status distinguishes no workflow runs and no deployments from unavailable data', async (t) => {
  const harness = createHarness(t)

  const response = await harness.status.GET(statusRequest())
  const body = await response.json()

  assertResponse(response)
  assert.deepEqual(body.ci, {
    state: 'no-runs',
    status: 'no-runs',
    conclusion: null,
    head_sha: null,
    url: null,
    updated_at: null,
    source: 'github:actions',
    observed_at: body.observed_at,
  })
  assert.deepEqual(body.deployments, {
    state: 'available',
    items: [],
    source: 'github:deployments',
    observed_at: body.observed_at,
  })
  assert.equal(harness.listDeploymentStatuses.mock.callCount(), 0)
})

for (const [status, conclusion, expected] of [
  ['queued', null, 'queued'],
  ['in_progress', null, 'in_progress'],
  ['completed', 'failure', 'failure'],
  ['completed', 'cancelled', 'cancelled'],
  ['completed', 'neutral', 'neutral'],
  ['completed', 'skipped', 'skipped'],
] as const) {
  test(`status reports ${status}/${conclusion} without assuming CI success`, async (t) => {
    const harness = createHarness(t)
    harness.listWorkflowRunsForRepo.mock.mockImplementation(async () => ({
      data: { workflow_runs: [{ ...workflowFixture, status, conclusion }] },
    }))

    const response = await harness.status.GET(statusRequest())
    const body = await response.json()

    assertResponse(response)
    assert.equal(body.ci.state, expected)
    assert.equal(body.ci.status, status)
    assert.equal(body.ci.conclusion, conclusion)
    assert.equal(body.ci.head_sha, workflowFixture.head_sha)
    assert.equal(body.ci.url, workflowFixture.html_url)
  })
}

for (const [actionsFail, deploymentsFail] of [
  [true, false],
  [false, true],
  [true, true],
]) {
  test(`status preserves available results when Actions fails=${actionsFail} and deployments fail=${deploymentsFail}`, async (t) => {
    const harness = createHarness(t)
    harness.listWorkflowRunsForRepo.mock.mockImplementation(async () => {
      if (actionsFail) throw new Error(token)
      return { data: { workflow_runs: [workflowFixture] } }
    })
    harness.listDeployments.mock.mockImplementation(async () => {
      if (deploymentsFail) throw new Error(token)
      return { data: [deploymentFixture] }
    })
    harness.listDeploymentStatuses.mock.mockImplementation(async () => ({ data: [deploymentStatusFixture] }))

    const response = await harness.status.GET(statusRequest())
    const body = await response.json()

    assertResponse(response)
    assert.deepEqual(body.ci, {
      state: actionsFail ? 'unavailable' : 'success',
      status: actionsFail ? 'unavailable' : 'completed',
      conclusion: actionsFail ? null : 'success',
      head_sha: actionsFail ? null : workflowFixture.head_sha,
      url: actionsFail ? null : workflowFixture.html_url,
      updated_at: actionsFail ? null : workflowFixture.updated_at,
      source: 'github:actions',
      observed_at: body.observed_at,
    })
    assert.equal(body.deployments.state, deploymentsFail ? 'unavailable' : 'available')
    assert.equal(body.deployments.items.length, deploymentsFail ? 0 : 1)
    assert.equal(harness.listDeploymentStatuses.mock.callCount(), deploymentsFail ? 0 : 1)
    if (!deploymentsFail) assert.equal(body.deployments.items[0].state, 'success')
    assert.ok(!JSON.stringify(body).includes(token))
  })
}

test('status isolates a failed deployment-status lookup and retains the other deployments in order', async (t) => {
  const harness = createHarness(t)
  const deployments = [deploymentFixture, { ...deploymentFixture, id: 302, environment: 'preview' }]
  harness.listDeployments.mock.mockImplementation(async () => ({ data: deployments }))
  harness.listDeploymentStatuses.mock.mockImplementation(async (parameters) => {
    if ((parameters as { deployment_id: number }).deployment_id === 301) throw new Error(token)
    return { data: [deploymentStatusFixture] }
  })

  const response = await harness.status.GET(statusRequest())
  const body = await response.json()

  assertResponse(response)
  assert.equal(body.deployments.state, 'available')
  assert.deepEqual(body.deployments.items, [
    {
      ...deployments[0],
      updated_at: deployments[0].created_at,
      state: 'unknown',
      environment_url: null,
      source: 'github:deployment-status',
      observed_at: body.observed_at,
    },
    {
      ...deployments[1],
      updated_at: deploymentStatusFixture.updated_at,
      state: 'success',
      environment_url: deploymentStatusFixture.environment_url,
      source: 'github:deployment-status',
      observed_at: body.observed_at,
    },
  ])
  assert.ok(!JSON.stringify(body).includes(token))
})

for (const [label, statuses] of [
  ['no deployment statuses', []],
  ['null status fields', [{ state: null, updated_at: null, environment_url: null }]],
  ['missing status fields', [{ state: undefined, updated_at: undefined, environment_url: undefined }]],
] as const) {
  test(`status uses pending and the deployment creation time for ${label}`, async (t) => {
    const harness = createHarness(t)
    harness.listDeployments.mock.mockImplementation(async () => ({ data: [deploymentFixture] }))
    harness.listDeploymentStatuses.mock.mockImplementation(async () => ({ data: [...statuses] }))

    const response = await harness.status.GET(statusRequest())
    const body = await response.json()

    assertResponse(response)
    assert.deepEqual(body.deployments.items, [
      {
        ...deploymentFixture,
        updated_at: deploymentFixture.created_at,
        state: 'pending',
        environment_url: null,
        source: 'github:deployment-status',
        observed_at: body.observed_at,
      },
    ])
  })
}

for (const [label, error, expectedStatus, expectedCode] of [
  ['repository not found', { status: 404, message: token }, 404, 'GITHUB_STATUS_LOOKUP_FAILED'],
  ['string not-found status', { status: '404', message: token }, 404, 'GITHUB_STATUS_LOOKUP_FAILED'],
  ['access denied or rate limited', { status: 403, message: token }, 502, 'GITHUB_ACCESS_DENIED_OR_RATE_LIMITED'],
  ['string access-denied status', { status: '403', message: token }, 502, 'GITHUB_ACCESS_DENIED_OR_RATE_LIMITED'],
  ['expired credentials', { status: 401, message: token }, 502, 'GITHUB_STATUS_LOOKUP_FAILED'],
  ['upstream failure', { status: 500, message: token }, 502, 'GITHUB_STATUS_LOOKUP_FAILED'],
  ['network error', new Error(token), 502, 'GITHUB_STATUS_LOOKUP_FAILED'],
  ['null rejection', null, 502, 'GITHUB_STATUS_LOOKUP_FAILED'],
  ['string rejection', token, 502, 'GITHUB_STATUS_LOOKUP_FAILED'],
] as const) {
  test(`status sanitizes ${label} and stops before requesting Actions or deployments`, async (t) => {
    const harness = createHarness(t)
    harness.get.mock.mockImplementation(async () => {
      throw error
    })
    const before = Date.now()

    const response = await harness.status.GET(statusRequest())
    const after = Date.now()
    const body = await response.json()

    assertResponse(response, expectedStatus)
    assertObservedAt(body.observed_at, before, after)
    assert.deepEqual(body, {
      error: 'Unable to read CI/deployment status from GitHub',
      code: expectedCode,
      source: 'GitHub REST API',
      observed_at: body.observed_at,
      last_checked_at: body.observed_at,
    })
    assert.equal(harness.listWorkflowRunsForRepo.mock.callCount(), 0)
    assert.equal(harness.listDeployments.mock.callCount(), 0)
    assert.equal(harness.listDeploymentStatuses.mock.callCount(), 0)
    assert.ok(!JSON.stringify(body).includes(token))
  })
}
