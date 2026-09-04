#!/usr/bin/env node

const [command, ...args] = process.argv.slice(2)
const base = process.env.VELCLAW_DEPLOY_API || 'https://velclaw.cfd'
const token = process.env.VELCLAW_DEPLOY_API_TOKEN || ''

async function api(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${response.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

function usage() {
  console.log(`Velclaw Deploy CLI\n\nCommands:\n  deploy <github-url> [branch]     Queue a deployment\n  list                            List recent deployments\n  inspect <id>                    Inspect a deployment\n  rollback <id>                   Roll back to the previous ready release\n\nEnvironment:\n  VELCLAW_DEPLOY_API              API base URL (default: https://velclaw.cfd)\n  VELCLAW_DEPLOY_API_TOKEN        API token for worker/admin operations`)
}

try {
  if (command === 'deploy') {
    const repoUrl = args[0]
    if (!repoUrl) throw new Error('Usage: deploy <github-url> [branch]')
    const result = await api('/api/deployments', { method: 'POST', body: JSON.stringify({ repoUrl, branch: args[1] || 'main', projectName: repoUrl.split('/').filter(Boolean).pop()?.replace(/\.git$/i, '') || 'velclaw-app' }) })
    console.log(JSON.stringify(result, null, 2))
  } else if (command === 'list') {
    console.log(JSON.stringify(await api('/api/deployments'), null, 2))
  } else if (command === 'inspect') {
    if (!args[0]) throw new Error('Usage: inspect <id>')
    console.log(JSON.stringify(await api(`/api/deployments/${encodeURIComponent(args[0])}`), null, 2))
  } else if (command === 'rollback') {
    if (!args[0]) throw new Error('Usage: rollback <id>')
    console.log(JSON.stringify(await api(`/api/deployments/${encodeURIComponent(args[0])}/rollback`, { method: 'POST', headers: { 'x-velclaw-admin-token': token } }), null, 2))
  } else {
    usage()
    process.exitCode = command ? 1 : 0
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
