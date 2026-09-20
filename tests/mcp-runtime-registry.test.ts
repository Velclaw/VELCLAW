import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

test('MCP runtime registry maps local and remote servers and reports missing env', async () => {
  const originalCwd = process.cwd()
  const originalPostgres = process.env.POSTGRES_URL
  const originalGithub = process.env.GITHUB_MCP_PAT

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'velclaw-mcp-'))
  fs.mkdirSync(path.join(temp, 'config'))
  fs.writeFileSync(
    path.join(temp, 'config', 'mcp.json'),
    JSON.stringify({
      mcpServers: {
        local: {
          command: 'npx',
          args: ['-y', 'example-mcp'],
        },
        remote: {
          type: 'http',
          url: 'https://example.test/mcp',
          headers: {
            Authorization: 'Bearer ${GITHUB_MCP_PAT}',
          },
        },
        disabled: {
          command: 'node',
          args: ['disabled.js'],
          disabled: true,
        },
      },
    }),
  )

  process.chdir(temp)
  delete process.env.POSTGRES_URL
  delete process.env.GITHUB_MCP_PAT

  try {
    const { getMcpRuntimeStatus, getMcpRuntimeSummary } = await import('../lib/mcp/registry')
    const status = getMcpRuntimeStatus()

    assert.equal(status.find((server) => server.id === 'local')?.state, 'ready')
    assert.equal(status.find((server) => server.id === 'remote')?.state, 'missing-env')
    assert.equal(status.find((server) => server.id === 'remote')?.requiredEnv[0], 'GITHUB_MCP_PAT')
    assert.equal(status.find((server) => server.id === 'disabled')?.state, 'disabled')

    const summary = getMcpRuntimeSummary()
    assert.equal(summary.total, 3)
    assert.equal(summary.ready, 1)
    assert.equal(summary.missingEnv, 1)
    assert.equal(summary.disabled, 1)
  } finally {
    process.chdir(originalCwd)
    if (originalPostgres === undefined) delete process.env.POSTGRES_URL
    else process.env.POSTGRES_URL = originalPostgres
    if (originalGithub === undefined) delete process.env.GITHUB_MCP_PAT
    else process.env.GITHUB_MCP_PAT = originalGithub
    fs.rmSync(temp, { recursive: true, force: true })
  }
})
