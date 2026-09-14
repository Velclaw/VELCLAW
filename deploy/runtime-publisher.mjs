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
const BUILD_TIMEOUT_MS = Math.max(60_000, Number(process.env.VELCLAW_BUILD_TIMEOUT_MS || 900_000))
const SMOKE_TIMEOUT_MS = Math.max(5_000, Number(process.env.VELCLAW_SMOKE_TIMEOUT_MS || 30_000))
const SMOKE_RETRIES = Math.max(1, Number(process.env.VELCLAW_SMOKE_RETRIES || 10))
const SMOKE_DELAY_MS = Math.max(250, Number(process.env.VELCLAW_SMOKE_DELAY_MS || 1500))
const LOG_LIMIT = 500

if (!PUBLIC_DOMAIN || /[/:\s]/.test(PUBLIC_DOMAIN)) throw new Error(`Invalid VELCLAW_PUBLIC_DOMAIN: ${PUBLIC_DOMAIN}`)
if (!['http', 'https'].includes(PUBLIC_SCHEME)) throw new Error(`Invalid VELCLAW_PUBLIC_SCHEME: ${PUBLIC_SCHEME}`)
if (!DEPLOY_TOKEN) throw new Error('VELCLAW_DEPLOY_API_TOKEN is required')

async function request(pathname, options = {}) {
  const response = await fetch(`${API}${pathname}`, options)
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
  return response.json()
}

async function run(cmd, args, cwd, logs, env = process.env, timeoutMs = 0) {
  logs.push(`$ ${cmd} ${args.join(' ')}`)
  const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.on('data', (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) if (line) logs.push(line.slice(0, 16_000))
  })
  child.stderr.on('data', (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) if (line) logs.push(line.slice(0, 16_000))
  })
  let timer
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill('SIGKILL')
        reject(new Error(`${cmd} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }
  }).finally(() => clearTimeout(timer))
  if (code !== 0) throw new Error(`${cmd} exited with code ${code}`)
}

async function runCapture(cmd, args, cwd, logs, env = process.env) {
  logs.push(`$ ${cmd} ${args.join(' ')}`)
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    child.stderr.on('data', (chunk) => {
      for (const line of chunk.toString().split(/\r?\n/)) if (line) logs.push(line.slice(0, 16_000))
    })
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
  if (job.customDomain) return job.customDomain
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
  try { pkg = JSON.parse(await fs.readFile(packagePath, 'utf8')) } catch { throw new Error('Repository has no Dockerfile and no valid package.json; automatic Node build is unavailable') }
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

async function writeEnvFile(workdir, env) {
  const entries = Object.entries(env || {})
  if (entries.length === 0) return null
  if (entries.some(([key, value]) => !/^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(key) || typeof value !== 'string' || /[\r\n]/.test(value))) throw new Error('Invalid deployment environment variable')
  const file = path.join(workdir, '.velclaw.env')
  await fs.writeFile(file, entries.map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600 })
  return file
}

async function removePreviousProjectContainers(projectName, logs) {
  const result = await runCapture('docker', ['ps', '-aq', '--filter', `label=velclaw.project=${projectName}`], process.cwd(), logs)
  const ids = result.stdout.split(/\s+/).filter(Boolean)
  if (ids.length) await run('docker', ['rm', '--force', ...ids], process.cwd(), logs)
}

async function smokeCheck(url, logs) {
  logs.push(`Smoke check: ${url}`)
  let lastError = 'no response'
  for (let attempt = 1; attempt <= SMOKE_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), SMOKE_TIMEOUT_MS)
    try {
      const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: controller.signal, headers: { 'user-agent': 'Velclaw-Smoke/1.0' } })
      if (response.status >= 200 && response.status < 400) {
        logs.push(`Smoke check passed on attempt ${attempt}: HTTP ${response.status}`)
        return
      }
      lastError = `HTTP ${response.status}`
      logs.push(`Smoke attempt ${attempt}/${SMOKE_RETRIES}: ${lastError}`)
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      logs.push(`Smoke attempt ${attempt}/${SMOKE_RETRIES}: ${lastError}`)
    } finally {
      clearTimeout(timer)
    }
    if (attempt < SMOKE_RETRIES) await new Promise((resolve) => setTimeout(resolve, SMOKE_DELAY_MS))
  }
  throw new Error(`Smoke check failed after ${SMOKE_RETRIES} attempts: ${lastError}`)
}

async function publish(job) {
  const logs = [...(job.logs || []), 'Velclaw runtime publisher started']
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), `velclaw-${job.id}-`))
  const image = `velclaw/${slug(job.projectName)}:${job.id}`
  const hostname = productHostname(job)
  const url = `${PUBLIC_SCHEME}://${hostname}`
  const container = `velclaw-${job.id}`
  let envFile = null
  try {
    await run('git', ['clone', '--depth', '1', '--branch', job.branch, job.repoUrl, workdir], process.cwd(), logs, gitEnv(), BUILD_TIMEOUT_MS)
    await checkoutRequestedCommit(workdir, job, logs)
    await ensureDockerfile(workdir, logs)
    envFile = await writeEnvFile(workdir, job.env)
    await run('docker', ['build', '--pull', '--label', `velclaw.deployment=${job.id}`, '--tag', image, workdir], process.cwd(), logs, process.env, BUILD_TIMEOUT_MS)
    const port = await detectContainerPort(image, logs)
    logs.push(`Detected application port: ${port}`)
    await run('docker', ['network', 'inspect', RUNTIME_NETWORK], process.cwd(), logs).catch(async () => {
      await run('docker', ['network', 'create', '--driver', 'bridge', RUNTIME_NETWORK], process.cwd(), logs)
    })
    await removePreviousProjectContainers(job.projectName, logs)
    const envArgs = envFile ? ['--env-file', envFile] : []
    await run('docker', ['run', '--detach', '--restart', 'unless-stopped', '--network', RUNTIME_NETWORK, '--memory', '768m', '--cpus', '1.0', '--pids-limit', '256', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges:true', '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m', ...envArgs, ...traefikLabels(job, hostname, port), '--name', container, image], process.cwd(), logs)
    await smokeCheck(url, logs)
    logs.push('Smoke verification passed; marking release ready')
    await request(`/api/deployments/${job.id}/runtime`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${DEPLOY_TOKEN}` }, body: JSON.stringify({ status: 'ready', url, logs: logs.slice(-LOG_LIMIT) }) })
  } catch (error) {
    logs.push(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
    await request(`/api/deployments/${job.id}/runtime`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${DEPLOY_TOKEN}` }, body: JSON.stringify({ status: 'failed', logs: logs.slice(-LOG_LIMIT), error: error instanceof Error ? error.message : String(error) }) }).catch(() => {})
  } finally {
    if (envFile) await fs.rm(envFile, { force: true }).catch(() => {})
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
