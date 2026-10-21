import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test, { type TestContext } from 'node:test'
import { compileFunction } from 'node:vm'
import { NextRequest, NextResponse } from 'next/server'
import ts from 'typescript'

const observedAt = '2026-10-21T12:00:00.000Z'
const token = 'synthetic-connected-account-token'
const cacheControl = 'private, no-store, max-age=0'

const routeFiles = {
  inventory: '../app/api/control-center/repositories/route.ts',
  status: '../app/api/control-center/repositories/status/route.ts',
} as const

// Execute the actual handlers with isolated imports. This avoids loading the
// session/database stack and needs no global module hooks or experimental flags.
const routeModules = Object.fromEntries(
  Object.entries(routeFiles).map(([name, path]) => {
    const file = new URL(path, import.meta.url)
    const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
      fileName: file.pathname,
    })
    return [name, compileFunction(outputText, ['require', 'exports'], { filename: file.pathname })]
  }),
)

function repository(overrides = {}) {
  return {
    id: 42,
    name: 'workspace',
    full_name: 'example/workspace',
    owner: { login: 'example', type: 'Organization' },
    html_url: 'https://github.com/example/workspace',
    visibility: 'private',
    private: true,
    archived: false,
    default_branch: 'release',
    language: 'TypeScript',
    pushed_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
    ...overrides,
  }
}

function workflow(overrides = {}) {
  return {
    status: 'completed',
    conclusion: 'success',
    head_sha: 'synthetic-head-sha',
    html_url: 'https://github.com/example/workspace/actions/runs/10',
    updated_at: '2026-10-21T11:00:00Z',
    ...overrides,
  }
}

function deployment(id = 1) {
  return {
    id,
    environment: `preview-${id}`,
    ref: 'release',
    sha: `synthetic-deployment-sha-${id}`,
    created_at: '2026-10-20T12:00:00Z',
  }
}

function setup(t: TestContext, route: keyof typeof routeFiles) {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(observedAt) })
  const getServerSession = t.mock.fn(async (): Promise<unknown> => ({ user: { id: 'synthetic-user' } }))
  const getUserGitHubToken = t.mock.fn(async (): Promise<string | null> => token)
  const repos = {
    listForAuthenticatedUser: t.mock.fn(),
    get: t.mock.fn(async () => ({ data: repository() })),
    listDeployments: t.mock.fn(async (): Promise<{ data: unknown[] }> => ({ data: [] })),
    listDeploymentStatuses: t.mock.fn(async (): Promise<{ data: unknown[] }> => ({ data: [] })),
  }
  const actions = {
    listWorkflowRunsForRepo: t.mock.fn(
      async (): Promise<{ data: { workflow_runs: unknown[] } }> => ({
        data: { workflow_runs: [] },
      }),
    ),
  }
  const paginate = t.mock.fn(async (): Promise<unknown[]> => [])
  const octokit = t.mock.fn(function () {
    return { rest: { repos, actions }, paginate }
  })
  const imports: Record<string, unknown> = {
    'next/server': { NextRequest, NextResponse },
    '@octokit/rest': { Octokit: octokit },
    '@/lib/session/get-server-session': { getServerSession },
    '@/lib/github/user-token': { getUserGitHubToken },
  }
  const exports = {} as { GET: (request: NextRequest) => Promise<Response> }
  routeModules[route]((name: string) => {
    assert.ok(Object.hasOwn(imports, name), `Unexpected route dependency: ${name}`)
    return imports[name]
  }, exports)

  async function get(query = '?owner=example&repo=workspace') {
    const request = new NextRequest(
      `https://workspace.example.test/api/control-center/repositories${route === 'status' ? '/status' : ''}${query}`,
    )
    const response = await exports.GET(request)
    assert.equal(response.headers.get('cache-control'), cacheControl)
    assert.match(response.headers.get('content-type') ?? '', /application\/json/)
    const text = await response.text()
    assert.ok(!text.includes(token), 'Responses must never expose the connected account token')
    return { status: response.status, body: JSON.parse(text), request }
  }

  return { get, getServerSession, getUserGitHubToken, octokit, paginate, repos, actions }
}

function provenance() {
  return { source: 'GitHub REST API', observed_at: observedAt, last_checked_at: observedAt }
}

function expectedCi(overrides = {}) {
  return {
    state: 'no-runs',
    status: 'no-runs',
    conclusion: null,
    head_sha: null,
    url: null,
    updated_at: null,
    source: 'github:actions',
    observed_at: observedAt,
    ...overrides,
  }
}

function expectedDeployment(id: number, overrides = {}) {
  return {
    ...deployment(id),
    updated_at: deployment(id).created_at,
    state: 'pending',
    environment_url: null,
    source: 'github:deployment-status',
    observed_at: observedAt,
    ...overrides,
  }
}

for (const route of ['inventory', 'status'] as const) {
  for (const [label, session] of [
    ['missing session', null],
    ['missing user', {}],
    ['missing user ID', { user: {} }],
    ['empty user ID', { user: { id: '' } }],
  ] as const) {
    test(`${route} rejects a ${label} before requesting credentials or GitHub data`, async (t) => {
      const fixture = setup(t, route)
      fixture.getServerSession.mock.mockImplementation(async () => session)
      const result = await fixture.get()
      assert.equal(result.status, 401)
      assert.deepEqual(result.body, { error: 'Unauthorized' })
      assert.equal(fixture.getUserGitHubToken.mock.callCount(), 0)
      assert.equal(fixture.octokit.mock.callCount(), 0)
    })
  }

  test(`${route} reports a disconnected GitHub account without making upstream requests`, async (t) => {
    const fixture = setup(t, route)
    fixture.getUserGitHubToken.mock.mockImplementation(async () => null)
    const result = await fixture.get()
    assert.equal(result.status, 409)
    assert.deepEqual(result.body, { error: 'GitHub account is not connected', code: 'GITHUB_NOT_CONNECTED' })
    assert.equal(fixture.octokit.mock.callCount(), 0)
    assert.deepEqual(fixture.getUserGitHubToken.mock.calls[0].arguments, route === 'status' ? [result.request] : [])
  })
}

test('inventory requests every accessible repository through Octokit pagination and projects safe metadata', async (t) => {
  const fixture = setup(t, 'inventory')
  const privateRepository = {
    ...repository(),
    permissions: { admin: true },
    clone_url: 'https://credential.example.test/repository',
    token,
  }
  const archivedRepository = repository({
    id: 43,
    name: 'archive',
    full_name: 'member/archive',
    owner: { login: 'member', type: 'User' },
    visibility: undefined,
    private: false,
    archived: true,
    language: null,
    pushed_at: null,
  })
  fixture.paginate.mock.mockImplementation(async () => [privateRepository, archivedRepository])
  const result = await fixture.get()
  assert.equal(result.status, 200)
  assert.deepEqual(fixture.octokit.mock.calls[0].arguments, [{ auth: token }])
  assert.deepEqual(fixture.getUserGitHubToken.mock.calls[0].arguments, [])
  assert.deepEqual(fixture.paginate.mock.calls[0].arguments, [
    fixture.repos.listForAuthenticatedUser,
    { per_page: 100, sort: 'updated', direction: 'desc', affiliation: 'owner,collaborator,organization_member' },
  ])
  assert.deepEqual(result.body, {
    ...provenance(),
    scope: 'repositories accessible to the authenticated GitHub user',
    complete: true,
    count: 2,
    repositories: [
      {
        id: 42,
        name: 'workspace',
        full_name: 'example/workspace',
        owner: 'example',
        owner_type: 'Organization',
        url: privateRepository.html_url,
        visibility: 'private',
        private: true,
        archived: false,
        default_branch: 'release',
        language: 'TypeScript',
        pushed_at: privateRepository.pushed_at,
        updated_at: privateRepository.updated_at,
        source: 'github:user-repositories',
        observed_at: observedAt,
      },
      {
        id: 43,
        name: 'archive',
        full_name: 'member/archive',
        owner: 'member',
        owner_type: 'User',
        url: archivedRepository.html_url,
        visibility: 'public',
        private: false,
        archived: true,
        default_branch: 'release',
        language: null,
        pushed_at: null,
        updated_at: archivedRepository.updated_at,
        source: 'github:user-repositories',
        observed_at: observedAt,
      },
    ],
  })
})

test('inventory reports an empty completed inventory without inserting seed repositories', async (t) => {
  const fixture = setup(t, 'inventory')
  const result = await fixture.get()
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, {
    ...provenance(),
    scope: 'repositories accessible to the authenticated GitHub user',
    complete: true,
    count: 0,
    repositories: [],
  })
})

for (const [visibility, isPrivate, expected] of [
  [undefined, true, 'private'],
  [undefined, false, 'public'],
  [null, true, 'private'],
  [null, false, 'public'],
  ['internal', true, 'internal'],
] as const) {
  test(`inventory maps visibility ${visibility} and private=${isPrivate} to ${expected}`, async (t) => {
    const fixture = setup(t, 'inventory')
    fixture.paginate.mock.mockImplementation(async () => [repository({ visibility, private: isPrivate })])
    const result = await fixture.get()
    assert.equal(result.status, 200)
    assert.equal(result.body.repositories[0].visibility, expected)
  })
}

test('inventory preserves all paginated results beyond the first 100 repositories', async (t) => {
  const fixture = setup(t, 'inventory')
  const repositories = Array.from({ length: 101 }, (_, index) => repository({ id: index + 1 }))
  fixture.paginate.mock.mockImplementation(async () => repositories)
  const result = await fixture.get()
  assert.equal(result.status, 200)
  assert.equal(result.body.count, 101)
  assert.equal(result.body.complete, true)
  assert.deepEqual(
    result.body.repositories.map((item: { id: number }) => item.id),
    repositories.map((item) => item.id),
  )
})

for (const route of ['inventory', 'status'] as const) {
  for (const [label, error, expectedStatus, code] of [
    ['access denied', { status: 403, message: token }, 502, 'GITHUB_ACCESS_DENIED_OR_RATE_LIMITED'],
    ['string rate-limit status', { status: '403', message: token }, 502, 'GITHUB_ACCESS_DENIED_OR_RATE_LIMITED'],
    ['not found', { status: 404, message: token }, route === 'status' ? 404 : 502, null],
    ['invalid upstream credentials', { status: 401, message: token }, 502, null],
    ['upstream server error', { status: 500, message: token }, 502, null],
    ['network failure', new Error(token), 502, null],
    ['null rejection', null, 502, null],
    ['string rejection', token, 502, null],
  ] as const) {
    test(`${route} handles ${label} with a generic error and private cache headers`, async (t) => {
      const fixture = setup(t, route)
      const failingMethod = route === 'inventory' ? fixture.paginate : fixture.repos.get
      failingMethod.mock.mockImplementation(async () => {
        throw error
      })
      const result = await fixture.get()
      assert.equal(result.status, expectedStatus)
      assert.deepEqual(result.body, {
        ...provenance(),
        error:
          route === 'inventory'
            ? 'Unable to synchronize repositories from GitHub'
            : 'Unable to read CI/deployment status from GitHub',
        code: code ?? (route === 'inventory' ? 'GITHUB_SYNC_FAILED' : 'GITHUB_STATUS_LOOKUP_FAILED'),
      })
      assert.equal(fixture.actions.listWorkflowRunsForRepo.mock.callCount(), 0)
      assert.equal(fixture.repos.listDeployments.mock.callCount(), 0)
      assert.equal(fixture.repos.listDeploymentStatuses.mock.callCount(), 0)
    })
  }
}

for (const [label, query] of [
  ['missing parameters', ''],
  ['missing owner', '?repo=workspace'],
  ['missing repo', '?owner=example'],
  ['empty owner', '?owner=&repo=workspace'],
  ['empty repo', '?owner=example&repo='],
  ['blank owner', '?owner=%20%20&repo=workspace'],
  ['blank repo', '?owner=example&repo=%20%20'],
  ['owner slash', '?owner=example%2Fother&repo=workspace'],
  ['repo slash', '?owner=example&repo=workspace%2Fother'],
  ['encoded newline', '?owner=example%0Aother&repo=workspace'],
  ['embedded whitespace', '?owner=example&repo=work%20space'],
  ['non-ASCII characters', '?owner=ex%C3%A4mple&repo=workspace'],
  ['query injection', '?owner=example&repo=workspace%26admin%3Dtrue'],
  ['owner exceeding 100 characters', `?owner=${'a'.repeat(101)}&repo=workspace`],
  ['repo exceeding 100 characters', `?owner=example&repo=${'b'.repeat(101)}`],
] as const) {
  test(`status rejects ${label} without constructing a GitHub client`, async (t) => {
    const fixture = setup(t, 'status')
    const result = await fixture.get(query)
    assert.equal(result.status, 400)
    assert.deepEqual(result.body, { error: 'Valid owner and repo query parameters are required' })
    assert.equal(fixture.octokit.mock.callCount(), 0)
  })
}

test('status checks authentication and connection before validating query parameters', async (t) => {
  const fixture = setup(t, 'status')
  fixture.getServerSession.mock.mockImplementation(async () => null)
  assert.equal((await fixture.get('')).status, 401)
  fixture.getServerSession.mock.mockImplementation(async () => ({ user: { id: 'synthetic-user' } }))
  fixture.getUserGitHubToken.mock.mockImplementation(async () => null)
  assert.equal((await fixture.get('')).status, 409)
  assert.equal(fixture.octokit.mock.callCount(), 0)
})

for (const [owner, repo] of [
  ['a', 'b'],
  ['A-z_0.9', 'Repo.Name-1_2'],
  ['a'.repeat(100), 'b'.repeat(100)],
] as const) {
  test(`status accepts valid owner/repo lengths ${owner.length}/${repo.length} and trims surrounding spaces`, async (t) => {
    const fixture = setup(t, 'status')
    const query = new URLSearchParams({ owner: ` ${owner} `, repo: ` ${repo} ` })
    const result = await fixture.get(`?${query}`)
    assert.equal(result.status, 200)
    assert.deepEqual(fixture.repos.get.mock.calls[0].arguments, [{ owner, repo }])
    assert.deepEqual(fixture.actions.listWorkflowRunsForRepo.mock.calls[0].arguments, [
      { owner, repo, branch: 'release', per_page: 1 },
    ])
    assert.deepEqual(fixture.repos.listDeployments.mock.calls[0].arguments, [{ owner, repo, per_page: 5 }])
  })
}

test('status returns repository provenance and explicitly distinguishes no runs from unavailable data', async (t) => {
  const fixture = setup(t, 'status')
  const result = await fixture.get()
  assert.equal(result.status, 200)
  assert.deepEqual(fixture.octokit.mock.calls[0].arguments, [{ auth: token }])
  assert.deepEqual(fixture.getUserGitHubToken.mock.calls[0].arguments, [result.request])
  assert.deepEqual(result.body, {
    ...provenance(),
    repository: 'example/workspace',
    default_branch: 'release',
    ci: expectedCi(),
    deployments: { state: 'available', items: [], source: 'github:deployments', observed_at: observedAt },
  })
  assert.equal(fixture.repos.listDeploymentStatuses.mock.callCount(), 0)
})

for (const [status, conclusion, state] of [
  ['completed', 'success', 'success'],
  ['completed', 'failure', 'failure'],
  ['completed', 'cancelled', 'cancelled'],
  ['completed', 'timed_out', 'timed_out'],
  ['in_progress', null, 'in_progress'],
  ['queued', null, 'queued'],
] as const) {
  test(`status maps the latest workflow ${status}/${conclusion} to ${state}`, async (t) => {
    const fixture = setup(t, 'status')
    const latest = workflow({ status, conclusion })
    fixture.actions.listWorkflowRunsForRepo.mock.mockImplementation(async () => ({
      data: { workflow_runs: [latest, workflow({ conclusion: 'stale-result' })] },
    }))
    const result = await fixture.get()
    assert.equal(result.status, 200)
    assert.deepEqual(
      result.body.ci,
      expectedCi({
        state,
        status,
        conclusion,
        head_sha: latest.head_sha,
        url: latest.html_url,
        updated_at: latest.updated_at,
      }),
    )
  })
}

test('status uses null metadata when an upstream workflow omits optional values', async (t) => {
  const fixture = setup(t, 'status')
  fixture.actions.listWorkflowRunsForRepo.mock.mockImplementation(async () => ({ data: { workflow_runs: [{}] } }))
  const result = await fixture.get()
  assert.equal(result.status, 200)
  assert.deepEqual(result.body.ci, expectedCi())
})

for (const [actionsFail, deploymentsFail] of [
  [true, false],
  [false, true],
  [true, true],
] as const) {
  test(`status preserves partial results when actionsFail=${actionsFail} and deploymentsFail=${deploymentsFail}`, async (t) => {
    const fixture = setup(t, 'status')
    fixture.actions.listWorkflowRunsForRepo.mock.mockImplementation(async () => {
      if (actionsFail) throw new Error(token)
      return { data: { workflow_runs: [workflow()] } }
    })
    fixture.repos.listDeployments.mock.mockImplementation(async () => {
      if (deploymentsFail) throw new Error(token)
      return { data: [deployment()] }
    })
    const result = await fixture.get()
    assert.equal(result.status, 200)
    assert.deepEqual(
      result.body.ci,
      actionsFail
        ? expectedCi({ state: 'unavailable', status: 'unavailable' })
        : expectedCi({
            state: 'success',
            status: 'completed',
            conclusion: 'success',
            head_sha: workflow().head_sha,
            url: workflow().html_url,
            updated_at: workflow().updated_at,
          }),
    )
    assert.deepEqual(result.body.deployments, {
      state: deploymentsFail ? 'unavailable' : 'available',
      items: deploymentsFail ? [] : [expectedDeployment(1)],
      source: 'github:deployments',
      observed_at: observedAt,
    })
    assert.equal(fixture.actions.listWorkflowRunsForRepo.mock.callCount(), 1)
    assert.equal(fixture.repos.listDeployments.mock.callCount(), 1)
    assert.equal(fixture.repos.listDeploymentStatuses.mock.callCount(), deploymentsFail ? 0 : 1)
  })
}

test('status uses the latest deployment status and preserves deployment order through independent failures', async (t) => {
  const fixture = setup(t, 'status')
  const deployments = [deployment(1), deployment(2), deployment(3)]
  fixture.repos.listDeployments.mock.mockImplementation(async () => ({ data: deployments }))
  fixture.repos.listDeploymentStatuses.mock.mockImplementationOnce(
    async () => ({
      data: [
        {
          state: 'success',
          updated_at: '2026-10-21T11:30:00Z',
          environment_url: 'https://preview.example.test',
          token,
        },
        { state: 'failure', updated_at: '2026-10-20T12:00:00Z', environment_url: 'https://stale.example.test' },
      ],
    }),
    0,
  )
  fixture.repos.listDeploymentStatuses.mock.mockImplementationOnce(async () => {
    throw new Error(token)
  }, 1)
  const result = await fixture.get()
  assert.equal(result.status, 200)
  assert.deepEqual(
    fixture.repos.listDeploymentStatuses.mock.calls.map((call) => call.arguments),
    deployments.map(({ id }) => [{ owner: 'example', repo: 'workspace', deployment_id: id, per_page: 1 }]),
  )
  assert.deepEqual(result.body.deployments, {
    state: 'available',
    items: [
      expectedDeployment(1, {
        state: 'success',
        updated_at: '2026-10-21T11:30:00Z',
        environment_url: 'https://preview.example.test',
      }),
      expectedDeployment(2, { state: 'unknown' }),
      expectedDeployment(3),
    ],
    source: 'github:deployments',
    observed_at: observedAt,
  })
})

test('status keeps a deployment state when its optional timestamp and environment URL are absent', async (t) => {
  const fixture = setup(t, 'status')
  fixture.repos.listDeployments.mock.mockImplementation(async () => ({ data: [deployment()] }))
  fixture.repos.listDeploymentStatuses.mock.mockImplementation(async () => ({
    data: [{ state: 'failure', updated_at: null }],
  }))
  const result = await fixture.get()
  assert.equal(result.status, 200)
  assert.deepEqual(result.body.deployments.items, [expectedDeployment(1, { state: 'failure' })])
})
