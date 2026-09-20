#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const config = JSON.parse(readFileSync(resolve(root, 'config/mcp.json'), 'utf8'))
const names = Object.keys(config.mcpServers ?? {})
const required = ['playwright', 'filesystem', 'postgres', 'github', 'context7', 'sequential-thinking-recall']
const missing = required.filter((name) => !names.includes(name))

if (missing.length) {
  console.error('MCP registry is missing required servers')
  process.exit(1)
}

console.log('MCP registry contains all required server entries')
