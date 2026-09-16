import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const configPath = resolve(root, '.velclaw/project.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const expected = {
  owner: config.project.repository.owner,
  name: config.project.repository.name,
  branch: config.project.repository.defaultBranch,
};

if (expected.owner !== 'Velclaw' || expected.name !== 'VELCLAW' || expected.branch !== 'main') {
  throw new Error('Canonical repository identity is inconsistent with Velclaw/VELCLAW main.');
}

const levels = config.notifications?.levels ?? {};
const requiredSilent = ['info', 'warning', 'error'];
for (const level of requiredSilent) {
  if (levels[level] !== 'silent') {
    throw new Error(`Notification policy drift detected for level: ${level}`);
  }
}

for (const level of ['critical', 'security', 'production']) {
  if (levels[level] !== 'notify') {
    throw new Error(`Notification policy drift detected for level: ${level}`);
  }
}

if (config.notifications?.history !== true) {
  throw new Error('Notification history must remain enabled.');
}

console.log('Velclaw Control Plane reconciliation passed.');
console.log(`Repository: ${expected.owner}/${expected.name}`);
console.log(`Default branch: ${expected.branch}`);
console.log('Error notifications: silent; history: retained.');
console.log('Critical/security/production notifications: enabled by policy.');
