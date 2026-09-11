import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const API = process.env.VELCLAW_DEPLOY_API || 'http://127.0.0.1:3000'
const POLL_MS = Number(process.env.VELCLAW_DEPLOY_POLL_MS || 3000)
const RUNTIME_NETWORK = process.env.VELCLAW_RUNTIME_NETWORK || 'velclaw-runtime'
const PUBLIC_DOMAIN = (process.env.VELCLAW_PUBLIC_DOMAIN || 'velclaw.cfd').trim().toLowerCase()
const PUBLIC_SCHEME = (process.env.VELCLAW_PUBLIC_SCHEME || 'https').trim().toLowerCase()
const TRAEFIK_ENTRYPOINT = (process.env.VELCLAW_TRAEFIK_ENTRYPOINT || (PUBLIC_SCHEME === 'http' ? 'web' : 'websecure')).trim()
const ENABLE_TLS = PUBLIC_SCHEME === 'https'
const DEPLOY_TOKEN = process.env.VELCLAW_DEPLOY_API_TOKEN || ''

if (!PUBLIC_DOMAIN || /[/:\s]/.test(PUBLIC_DOMAIN)) throw new Error(`Invalid VELCLAW_PUBLIC_DOMAIN: ${PUBLIC_DOMAIN}`)
if (!['http', 'https'].includes(PUBLIC_SCHEME)) throw new Error(`Invalid VELCLAW_PUBLIC_SCHEME: ${PUBLIC_SCHEME}`)
if (!DEPLOY_TOKEN) throw new Error('VELCLAW_DEPLOY_API_TOKEN is required')

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

async function runCapture(cmd, args, cwd, logs, env = process.env) {
  logs.push(`$ ${cmd} ${args.join(' ')}`)
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    child.stderr.on('data', (chunk) => logs.push(chunk.toString().trimEnd()))
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve({ stdout: stdout.trim() }) : reject(new Error(`${cmd} exited with code ${code}`)))
  })
}

function gitEnv() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_APP_TOKEN
  if (!token) return process.env
  return { ...process.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.extraheader', GIT_CONFIG_VALUE_0: `AUTHORIZATION: Bearer ${token}` }
}

function slug(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app'
}

function productHostname(job) {
  const project = slug(job.projectName)
  const suffix = String(job.id).replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase()
  const maxProjectLength = Math.max(1, 63 - suffix.length - 2)
  return `${project.slice(0, maxProjectLength).replace(/-+$/g, '')}-${suffix}.${PUBLIC_DOMAIN}`
}

function traefikLabels(job, hostname, port) {
  const router = `velclaw-${job.id.replace(/[^a-z0-9]/gi, '').slice(0, 48)}`
  const labels = [
    '--label', `velclaw.deployment=${job.id}`,
    '--label', `velclaw.project=${job.projectName}`,
    '--label', 'traefik.enable=true',
    '--label', `traefik.docker.network=${RUNTIME_NETWORK}`,
    '--label', `traefik.http.routers.${router}.rule=Host(\`${hostname}\`)`,
    '--label', `traefik.http.routers.${router}.entrypoints=${TRAEFIK_ENTRYPOINT}`,
    '--label', `traefik.http.services.${router}.loadbalancer.server.port=${port}`,
  ]
  if (ENABLE_TLS) labels.push('--label', `traefik.http.routers.${router}.tls=true`, '--label', `traefik.http.routers.${router}.tls.certresolver=letsencrypt`)
  return labels
}

async function ensureDockerfile(workdir, logs) {
  try {
    await fs.access(path.join(workdir, 'Dockerfile'))
    logs.push('Using repository Dockerfile')
    return
  } catch {}

  const packagePath = path.join(workdir, 'package.json')
  let pkg
  try {
    pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'))
  } catch {
    throw new Error('Repository has no Dockerfile and no valid package.json; automatic Node build is unavailable')
  }

  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  const scripts = pkg.scripts || {}
  const hasPnpmLock = await fs.access(path.join(workdir, 'pnpm-lock.yaml')).then(() => true).catch(() => false)
  const hasNpmLock = await fs.access(path.join(workdir, 'package-lock.json')).then(() => true).catch(() => false)
  const manager = hasPnpmLock ? 'pnpm' : 'npm'
  const install = manager === 'pnpm' ? 'corepack enable && pnpm install --frozen-lockfile' : hasNpmLock ? 'npm ci' : 'npm install'
  const build = scripts.build ? `${manager} run build` : ''
  const start = scripts.start ? `${manager} start` : ''
  const isStatic = Boolean(deps.vite || deps['react-scripts']) && !scripts.start

  if (!build) throw new Error('Repository has no build script and no Dockerfile')

  if (isStatic) {
    const lock = manager === 'pnpm' ? 'pnpm-lock.yaml' : hasNpmLock ? 'package-lock.json' : 'package.json'
    await fs.writeFile(path.join(workdir, 'velclaw-static-server.mjs'), `import { createServer } from 'node:http'\nimport { createReadStream, existsSync, statSync } from 'node:fs'\nimport { join, extname } from 'node:path'\nconst root = process.env.STATIC_ROOT || '/app/dist'\nconst types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' }\ncreateServer((req, res) => { const raw = decodeURIComponent((req.url || '/').split('?')[0]); const rel = raw === '/' ? '/index.html' : raw; const file = join(root, rel); const target = existsSync(file) && statSync(file).isFile() ? file : join(root, 'index.html'); if (!existsSync(target)) { res.statusCode = 404; res.end('Not found'); return } res.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream'); createReadStream(target).pipe(res) }).listen(Number(process.env.PORT || 3000), '0.0.0.0')\n`)
    await fs.writeFile(path.join(workdir, 'Dockerfile'), `FROM node:22-alpine\nWORKDIR /app\nCOPY package.json ${lock} ./\nRUN ${install}\nCOPY . .\nRUN ${build}\nCOPY velclaw-static-server.mjs ./velclaw-static-server.mjs\nENV PORT=3000\nEXPOSE 3000\nCMD ["node", "velclaw-static-server.mjs"]\n`)
    logs.push('Generated Dockerfile for static Node/Vite application')
    return
  }

  if (!start) throw new Error('Repository has no start script and no Dockerfile')
  const lock = manager === 'pnpm' ? 'pnpm-lock.yaml' : hasNpmLock ? 'package-lock.json' : 'package.json'
  await fs.writeFile(path.join(workdir, 'Dockerfile'), `FROM node:22-alpine\nWORKDIR /app\nCOPY package.json ${lock} ./\nRUN ${install}\nCOPY . .\nRUN ${build}\nENV NODE_ENV=production\nENV PORT=3000\nEXPOSE 3000\nCMD ["${manager}", "start"]\n`)
  logs.push(`Generated Dockerfile for Node application (${manager})`)
}

async function detectContainerPort(image, logs) {
  const result = await runCapture('docker', ['image', 'inspect', image, '--format', '{{json .Config.ExposedPorts}}'], process.cwd(), logs)
  if (result.stdout && result.stdout !== '<no value>') {
    try {
      const exposed = JSON.parse(result.stdout)
      const port = Object.keys(exposed || {}).map((value) => Number.parseInt(value.split('/')[0], 10)).find((value) => Number.isInteger(value) && value > 0 && value < 65536)
      if (port) return port
    } catch { logs.push('Could not parse Docker exposed-port metadata; using port 3000') }
  }
  return 3000
}

async function checkoutRequestedCommit(workdir, job, logs) {
  if (!job.commitSha) return
  if (!/^[0-9a-f]{40}$/i.test(job.commitSha)) throw new Error('Invalid commit SHA')
  await run('git', ['fetch', '--depth', '1', 'origin', job.commitSha], workdir, logs, gitEnv())
  await run('git', ['checkout', '--detach', job.commitSha], workdir, logs, gitEnv())
  logs.push(`Checked out requested commit ${job.commitSha}`)
}

async function publish(job) {
  const logs = [...(job.logs || []), 'Velclaw runtime publisher started']
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), `velclaw-${job.id}-`))
  const image = `velclaw/${slug(job.projectName)}:${job.id}`
  const hostname = productHostname(job)
  const container = `velclaw-${job.id}`
  try {
    await run('git', ['clone', '--depth', '1', '--branch', job.branch, job.repoUrl, workdir], process.cwd(), logs, gitEnv())
    await checkoutRequestedCommit(workdir, job, logs)
    await ensureDockerfile(workdir, logs)
    await run('docker', ['build', '--pull', '--label', `velclaw.deployment=${job.id}`, '--tag', image, workdir], process.cwd(), logs)
    const port = await detectContainerPort(image, logs)
    logs.push(`Detected application port: ${port}`)
    await run('docker', ['network', 'inspect', RUNTIME_NETWORK], process.cwd(), logs).catch(async () => {
      await run('docker', ['network', 'create', '--driver', 'bridge', RUNTIME_NETWORK], process.cwd(), logs)
    })
    await run('docker', ['rm', '--force', container], process.cwd(), logs).catch(() => {})
    await run('docker', ['run', '--detach', '--restart', 'unless-stopped', '--network', RUNTIME_NETWORK, '--memory', '768m', '--cpus', '1.0', '--pids-limit', '256', '--security-opt', 'no-new-privileges:true', ...traefikLabels(job, hostname, port), '--name', container, image], process.cwd(), logs)
    await request(`/api/deployments/${job.id}/runtime`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${DEPLOY_TOKEN}` }, body: JSON.stringify({ status: 'ready', url: `${PUBLIC_SCHEME}://${hostname}`, logs: logs.slice(-500) }) })
  } catch (error) {
    logs.push(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
    await request(`/api/deployments/${job.id}/runtime`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${DEPLOY_TOKEN}` }, body: JSON.stringify({ status: 'failed', logs: logs.slice(-500), error: error instanceof Error ? error.message : String(error) }) }).catch(() => {})
  } finally {
    await fs.rm(workdir, { recursive: true, force: true })
  }
}

async function main() {
  console.log(`Velclaw runtime publisher listening on ${API}; public runtime: ${PUBLIC_SCHEME}://${PUBLIC_DOMAIN}`)
  while (true) {
    try {
      const { deployment } = await request('/api/deployments/claim', { method: 'POST', headers: { authorization: `Bearer ${DEPLOY_TOKEN}` } })
      if (deployment) await publish(deployment)
    } catch (error) {
      console.error(`[publisher] ${error instanceof Error ? error.message : String(error)}`)
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
}

void main()