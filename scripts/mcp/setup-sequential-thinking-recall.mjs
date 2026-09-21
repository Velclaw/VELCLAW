#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const target = resolve(root, 'mcp/sequential-thinking-recall')

if (!existsSync(target)) {
  execFileSync('git', ['clone', '--depth', '1', 'https://github.com/zskbot/sequential-thinking-recall.git', target], {
    cwd: root,
    stdio: 'inherit',
  })
}

execFileSync('npm', ['ci'], { cwd: target, stdio: 'inherit' })
execFileSync('npm', ['run', 'build'], { cwd: target, stdio: 'inherit' })

console.log('Sequential Thinking Recall MCP is ready')
