import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const configPath = resolve(root, '.velclaw/project.json')
const opsWorkflowPath = resolve(root, '.github/workflows/ops-control-plane.yml')
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const opsWorkflow = readFileSync(opsWorkflowPath, 'utf8')

const expected = {
  owner: config.project.repository.owner,
  name: config.project.repository.name,
  branch: config.project.repository.defaultBranch,
}

if (expected.owner !== 'Velclaw' || expected.name !== 'VELCLAW' || expected.branch !== 'main') {
  throw new Error('Canonical repository identity is inconsistent.')
}

const levels = config.notifications?.levels ?? {}
for (const level of ['info', 'warning', 'error']) {
  if (levels[level] !== 'silent') {
    throw new Error('Notification policy drift detected.')
  }
}

for (const level of ['critical', 'security', 'production']) {
  if (levels[level] !== 'notify') {
    throw new Error('Notification policy drift detected.')
  }
}

if (config.notifications?.history !== true) {
  throw new Error('Notification history must remain enabled.')
}

if (config.notifications?.channels?.device !== false || config.notifications?.channels?.email !== false) {
  throw new Error('Device and email notification channels must remain disabled.')
}

if (opsWorkflow.includes('Velclaw Release Validation')) {
  throw new Error('Generic release-validation failures must not notify the external ops channel.')
}

for (const workflow of ['Security Baseline', 'Autoship Production Verification']) {
  if (!opsWorkflow.includes(workflow)) {
    throw new Error('Critical notification source is missing from ops policy.')
  }
}

console.log('Velclaw Control Plane reconciliation passed.')
console.log('Canonical repository identity verified.')
console.log('Error notifications are silent and history is retained.')
console.log('Critical, security, and production notifications are enabled by policy.')
