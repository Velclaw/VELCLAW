import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'package.json',
  'pnpm-lock.yaml',
  'next.config.ts',
  'Dockerfile',
  'deploy/docker-compose.selfhosted.yml',
  'deploy/publisher.Dockerfile',
  'deploy/runtime-publisher.mjs',
  'deploy/traefik.yml',
  'app',
  'components',
  'server',
]

const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)))
if (missing.length) {
  console.error(`Runtime validation failed. Missing: ${missing.join(', ')}`)
  process.exit(1)
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const scripts = pkg.scripts ?? {}
for (const name of ['build', 'type-check']) {
  if (!scripts[name]) {
    console.error(`Runtime validation failed. Missing package script: ${name}`)
    process.exit(1)
  }
}

if (fs.existsSync(path.join(root, 'vercel.json'))) {
  console.error('Runtime validation failed: legacy Vercel deployment configuration is not part of Velclaw self-hosted runtime.')
  process.exit(1)
}

const config = fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8')
if (/output\s*:\s*['"]export['"]/.test(config)) {
  console.error('Runtime validation failed: Next.js static export is incompatible with Velclaw server/API routes.')
  process.exit(1)
}

const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf8')
for (const requiredToken of ['FROM node:22-', 'pnpm install --frozen-lockfile', 'pnpm build', 'EXPOSE 3000', 'CMD ["pnpm", "start"]']) {
  if (!dockerfile.includes(requiredToken)) {
    console.error(`Runtime validation failed: Dockerfile is missing required contract: ${requiredToken}`)
    process.exit(1)
  }
}

const compose = fs.readFileSync(path.join(root, 'deploy/docker-compose.selfhosted.yml'), 'utf8')
for (const requiredToken of ['velclaw-control-plane:', 'velclaw-publisher:', 'velclaw-proxy:', 'build:', 'velclaw-runtime']) {
  if (!compose.includes(requiredToken)) {
    console.error(`Runtime validation failed: self-hosted compose is missing required contract: ${requiredToken}`)
    process.exit(1)
  }
}

const publisher = fs.readFileSync(path.join(root, 'deploy/runtime-publisher.mjs'), 'utf8')
if (!publisher.includes('VELCLAW_PUBLIC_DOMAIN') || !publisher.includes('traefik.http.routers.')) {
  console.error('Runtime validation failed: runtime publisher is missing first-party domain or Traefik routing contract.')
  process.exit(1)
}

console.log('Runtime validation passed: Velclaw Docker + publisher + Traefik self-hosted deployment configuration is compatible with server/API routes.')
