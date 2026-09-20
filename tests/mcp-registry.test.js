const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { loadMcpRegistry, getMcpStatus } = require('../server/mcp-registry');

const config = path.join(__dirname, '..', 'config', 'mcp.json');

const env = {
  POSTGRES_URL: 'postgres://example',
  GITHUB_MCP_PAT: 'github-token',
  CONTEXT7_API_KEY: 'context7-key',
  RECALL_PRIVATE_KEY: 'recall-key',
  RECALL_NETWORK: 'testnet',
  RECALL_BUCKET_ALIAS: 'sequential-thinking-logs',
  RECALL_LOG_PREFIX: 'sequential-'
};

test('loads the MCP registry without exposing literal config placeholders', () => {
  const servers = loadMcpRegistry(config, env);
  assert.equal(servers.length, 6);
  assert.equal(servers.find(x => x.name === 'postgres').args[1], '--access-mode=restricted');
  assert.equal(servers.find(x => x.name === 'github').headers.Authorization, 'Bearer github-token');
  assert.equal(servers.find(x => x.name === 'sequential-thinking-recall').disabled, true);
});

test('reports disabled and credential configuration state', () => {
  const status = getMcpStatus(config, env);
  assert.equal(status.find(x => x.name === 'playwright').ready, true);
  assert.equal(status.find(x => x.name === 'sequential-thinking-recall').disabled, true);
  assert.equal(status.find(x => x.name === 'postgres').configured, true);
});
