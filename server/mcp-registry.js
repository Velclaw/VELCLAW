const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_CONFIG = path.join(ROOT, 'config', 'mcp.json');

function resolveEnv(value, env = process.env) {
  if (typeof value !== 'string') return value;
  return value.replace(/\\$\\{([A-Z0-9_]+)\\}/g, (_, key) => env[key] || '');
}

function loadMcpRegistry(configPath = DEFAULT_CONFIG, env = process.env) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const servers = config.mcpServers || {};

  return Object.entries(servers).map(([name, definition]) => ({
    name,
    type: definition.type || 'stdio',
    command: definition.command || null,
    args: (definition.args || []).map(value => resolveEnv(value, env)),
    env: Object.fromEntries(
      Object.entries(definition.env || {}).map(([key, value]) => [key, resolveEnv(value, env)])
    ),
    url: resolveEnv(definition.url || '', env) || null,
    headers: Object.fromEntries(
      Object.entries(definition.headers || {}).map(([key, value]) => [key, resolveEnv(value, env)])
    ),
    disabled: definition.disabled === true,
    ready: definition.disabled !== true && Boolean(
      definition.type === 'http'
        ? definition.url
        : definition.command
    )
  }));
}

function getMcpStatus(configPath = DEFAULT_CONFIG, env = process.env) {
  return loadMcpRegistry(configPath, env).map(server => ({
    name: server.name,
    type: server.type,
    disabled: server.disabled,
    ready: server.ready,
    configured: !server.disabled && Object.values(server.env).every(Boolean)
      && Object.values(server.headers).every(Boolean)
  }));
}

module.exports = { loadMcpRegistry, getMcpStatus };
