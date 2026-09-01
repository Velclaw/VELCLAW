import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'package.json',
  'pnpm-lock.yaml',
  'next.config.ts',
  'vercel.json',
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

const config = fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8')
if (/output\s*:\s*['"]export['"]/.test(config)) {
  console.error('Runtime validation failed: Next.js static export is incompatible with Velclaw server/API routes.')
  process.exit(1)
}

console.log('Runtime validation passed: Next.js server deployment configuration is compatible with API routes.')
