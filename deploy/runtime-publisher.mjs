import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const API = process.env.VELCLAW_DEPLOY_API || 'http://127.0.0.1:3000'
const POLL_MS = Number(process.env.VELCLAW_DEPLOY_POLL_MS || 3000)
const RUNTIME_NETWORK = process.env.VELCLAW_RUNTIME_NETWORK || 'velclaw-runtime'
const PUBLIC_DOMAIN = (process.env.VELCLAW_PUBLIC_DOMAIN || 'velclaw.cfd').trim().toLowerCase()

if (PUBLIC_DOMAIN !== 'velclaw.cfd') {
  throw new Error(`VELCLAW_PUBLIC_DOMAIN must be velclaw.cfd, received: ${PUBLIC_DOMAIN}`)
}

async function request(pathname, options = {}) {
  const response = await fetch(`${API}${pathname}`, options)
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
  return response.json()
}

async function run(cmd, args, cwd, logs, env = process.env) {
  logs.push(`$ ${cmd} ${args.join(' ')}`)
  const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.on('data', (chunk) => logs.push(chunk.toString().trimEnd()))
  child.stderr.on('data', (chunk) => logs.push(chunk.toString().trimEnd()))
  const code = await new Promise((resolve) => child.on('close', resolve))
  if (code !== 0) throw new Error(`${cmd} exited with code ${code}`)
}

function gitEnv() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_APP_TOKEN
  if (!token) return process.env
  return {
    ...process.env,
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.extraheader',
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: Bearer ${token}`,
  }
}

function productHostname(branchName) {
  const slug = branchName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'main'
  const available = 63 - 'velclaw-git-'.length - '-velclaw'.length
  const bounded = slug.slice(0, available).replace(/-+$/g, '') || 'main'
  return `velclaw-git-${bounded}-velclaw.${PUBLIC_DOMAIN}`
}

async function publish(job) {
  const logs = [...(job.logs || []), 'Velclaw runtime publisher started']
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), `velclaw-${job.id}-`))
  const image = `velclaw/${job.projectName}:${job.id}`
  const hostname = productHostname(job.branch)
  const container = `velclaw-${job.id}`
  try {
    await run('git', ['clone', '--depth', '1', '--branch', job.branch, job.repoUrl, workdir], process.cwd(), logs, gitEnv())
    await run('docker', ['build', '--label', `velclaw.deployment=${job.id}`, '--tag', image, workdir], process.cwd(), logs)
    await run('docker', ['network', 'inspect', RUNTIME_NETWORK], process.cwd(), logs).catch(async () => {
      await run('docker', ['network', 'create', '--driver', 'bridge', RUNTIME_NETWORK], process.cwd(), logs)
    })
    await run('docker', ['rm', '--force', container], process.cwd(), logs).catch(() => {})
    await run(
      'docker',
      [
        'run',
        '--detach',
        '--restart',
        'unless-stopped',
        '--network',
        RUNTIME_NETWORK,
        '--memory',
        '768m',
        '--cpus',
        '1.0',
        '--pids-limit',
        '256',
        '--security-opt',
        'no-new-privileges:true',
        '--label',
        `velclaw.deployment=${job.id}`,
        '--label',
        `velclaw.project=${job.projectName}`,
        '--label',
        'traefik.enable=true',
        '--label',
        `traefik.docker.network=${RUNTIME_NETWORK}`,
        '--label',
        `traefik.http.routers.${job.id}.rule=Host(\`${hostname}\`)`,
        '--label',
        `traefik.http.routers.${job.id}.entrypoints=websecure`,
        '--label',
        `traefik.http.routers.${job.id}.tls=true`,
        '--label',
        `traefik.http.routers.${job.id}.tls.certresolver=letsencrypt`,
        '--label',
        `traefik.http.services.${job.id}.loadbalancer.server.port=3000`,
        '--name',
        container,
        image,
      ],
      process.cwd(),
      logs,
    )
    await request(`/api/deployments/${job.id}/runtime`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.VELCLAW_DEPLOY_API_TOKEN || ''}` },
      body: JSON.stringify({ status: 'ready', url: `https://${hostname}`, logs }),
    })
  } catch (error) {
    logs.push(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
    await request(`/api/deployments/${job.id}/runtime`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.VELCLAW_DEPLOY_API_TOKEN || ''}` },
      body: JSON.stringify({ status: 'failed', logs, error: error instanceof Error ? error.message : String(error) }),
    }).catch(() => {})
  } finally {
    await fs.rm(workdir, { recursive: true, force: true })
  }
}

async function main() {
  console.log(`Velclaw runtime publisher listening on ${API}`)
  while (true) {
    try {
      const { deployment } = await request('/api/deployments/claim', {
        method: 'POST',
        headers: { authorization: `Bearer ${process.env.VELCLAW_DEPLOY_API_TOKEN || ''}` },
      })
      if (deployment) await publish(deployment)
    } catch (error) {
      console.error(`[publisher] ${error instanceof Error ? error.message : String(error)}`)
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
