import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const workflow = readFileSync(new URL('../.github/workflows/velclaw-ci-startup-recovery.yml', import.meta.url), 'utf8')
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

// Follow the existing workflow contract tests without adding a YAML dependency.
// Restrict each assertion to its own block so another job cannot satisfy it.
function block(source: string, header: string) {
  const lines = source.split('\n')
  const start = lines.indexOf(header)
  assert.notEqual(start, -1, `Missing workflow block: ${header.trim()}`)
  const indentation = header.length - header.trimStart().length
  let end = start + 1
  while (end < lines.length && (!lines[end].trim() || lines[end].search(/\S/) > indentation)) end++
  return lines.slice(start + 1, end).join('\n')
}

const jobs = block(workflow, 'jobs:')
const quality = block(jobs, '  quality:')
const docker = block(jobs, '  docker:')

test('startup recovery runs for main pull requests and manual dispatch without path exclusions', () => {
  const events = block(workflow, 'on:')
  assert.match(events, /^  workflow_dispatch:\s*$/m)
  const pullRequest = block(events, '  pull_request:')
  assert.match(pullRequest, /^    branches:\n      - main\s*$/)
  assert.doesNotMatch(events, /pull_request_target|paths(?:-ignore)?:|branches-ignore:|types:/)
})

test('startup recovery has read-only repository access and cancels stale runs per ref', () => {
  assert.equal(block(workflow, 'permissions:').trim(), 'contents: read')
  assert.match(block(workflow, 'concurrency:'), /^  group: velclaw-ci-startup-recovery-\$\{\{ github\.ref \}\}$/m)
  assert.match(block(workflow, 'concurrency:'), /^  cancel-in-progress: true\s*$/m)
  assert.doesNotMatch(jobs, /^\s+permissions:/m)
})

test('both jobs use bounded Ubuntu runners and Docker depends on successful quality checks', () => {
  for (const job of [quality, docker]) {
    assert.match(job, /^    runs-on: ubuntu-22\.04$/m)
    assert.match(job, /^    timeout-minutes: 30$/m)
    assert.match(job, /^        uses: actions\/checkout@v4$/m)
    assert.doesNotMatch(job, /^\s+(?:if|continue-on-error|working-directory):/m)
  }
  assert.match(docker, /^    needs: quality$/m)
  assert.doesNotMatch(quality, /^    needs:/m)
})

test('quality installs the declared pnpm before configuring the Node 22 dependency cache', () => {
  const pnpm = block(quality, '      - name: Setup pnpm')
  assert.match(pnpm, /^        uses: pnpm\/action-setup@v4$/m)
  const version = pnpm.match(/^          version: (\S+)$/m)?.[1]
  assert.ok(version)
  assert.equal(`pnpm@${version}`, manifest.packageManager)
  assert.match(pnpm, /^          run_install: false$/m)

  const node = block(quality, '      - name: Setup Node.js')
  assert.match(node, /^        uses: actions\/setup-node@v4$/m)
  assert.match(node, /^          node-version: 22$/m)
  assert.match(node, /^          cache: pnpm$/m)
  const checkout = quality.indexOf('uses: actions/checkout@v4')
  const setupPnpm = quality.indexOf('uses: pnpm/action-setup@v4')
  const setupNode = quality.indexOf('uses: actions/setup-node@v4')
  const install = quality.indexOf('run: pnpm install ')
  assert.ok(checkout < setupPnpm && setupPnpm < setupNode && setupNode < install)
})

test('quality installs dependencies then runs every required gate before the production build', () => {
  const commands = [...quality.matchAll(/^        run: (.+)$/gm)].map((match) => match[1])
  assert.deepEqual(commands, [
    '|',
    'pnpm install --no-frozen-lockfile',
    'pnpm type-check',
    'pnpm lint',
    'pnpm format:check',
    'pnpm test',
    'pnpm build',
  ])
  for (const command of commands.slice(2)) {
    assert.equal(typeof manifest.scripts[command.slice('pnpm '.length)], 'string')
  }
  const diagnostics = block(quality, '      - name: Toolchain diagnostics')
  for (const command of ['set -eux', 'node --version', 'pnpm --version', 'uname -m', 'git --version']) {
    assert.ok(diagnostics.split('\n').some((line) => line.trim() === command))
  }
})

test('Docker builds the root image with a fresh base before inspecting its metadata', () => {
  const commands = [...docker.matchAll(/^        run: (.+)$/gm)].map((match) => match[1])
  assert.deepEqual(commands, ['docker version', 'docker build --pull --tag velclaw:ci .', '|'])
  assert.ok(docker.indexOf('uses: actions/checkout@v4') < docker.indexOf('run: docker version'))
})

const metadata = block(docker, '      - name: Verify image metadata')
assert.match(metadata, /^        run: \|$/m)
const metadataScript = block(metadata, '        run: |')
  .split('\n')
  .map((line) => line.slice(10))
  .join('\n')

function inspectMetadata(ports: string, user: string, failure = '') {
  // Execute the actual workflow shell with the Ubuntu runner's default bash -e
  // behavior. Only Docker is replaced; no daemon, image build, or temp script is needed.
  const result = spawnSync(
    'bash',
    [
      '--noprofile',
      '--norc',
      '-e',
      '-c',
      `docker() {
        if [ "$#" -ne 5 ] || [ "$1" != image ] || [ "$2" != inspect ] || [ "$3" != velclaw:ci ] || [ "$4" != --format ]; then
          return 64
        fi
        case "$5" in
          '{{.Config.ExposedPorts}}')
            printf 'ports\\n' >&2
            [ "$INSPECT_FAILURE" != ports ] || return 1
            printf '%s\\n' "$IMAGE_PORTS"
            ;;
          '{{.Config.User}}')
            printf 'user\\n' >&2
            [ "$INSPECT_FAILURE" != user ] || return 1
            printf '%s\\n' "$IMAGE_USER"
            ;;
          *) return 64 ;;
        esac
      }
      ${metadataScript}`,
    ],
    {
      env: { PATH: process.env.PATH, IMAGE_PORTS: ports, IMAGE_USER: user, INSPECT_FAILURE: failure },
      encoding: 'utf8',
      timeout: 5_000,
    },
  )
  assert.ifError(result.error)
  assert.equal(result.signal, null)
  return result
}

test('image verification accepts exactly TCP port 3000 and the velclaw user', () => {
  const result = inspectMetadata('map[3000/tcp:{}]', 'velclaw')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stderr, 'ports\nuser\n')
})

for (const [label, ports] of [
  ['no exposed ports', 'map[]'],
  ['missing metadata', ''],
  ['the wrong port', 'map[8080/tcp:{}]'],
  ['UDP instead of TCP', 'map[3000/udp:{}]'],
  ['an additional exposed port', 'map[3000/tcp:{} 8080/tcp:{}]'],
  ['trailing whitespace', 'map[3000/tcp:{}] '],
]) {
  test(`image verification rejects ${label} even when the user is valid`, () => {
    const result = inspectMetadata(ports, 'velclaw')
    assert.equal(result.status, 1)
    // Regression: without bash fail-fast, the successful user test masks a bad port.
    assert.equal(result.stderr, 'ports\n')
  })
}

for (const [label, user] of [
  ['implicit root', ''],
  ['explicit root', 'root'],
  ['numeric root', '0'],
  ['another unprivileged user', 'node'],
  ['a name with the expected prefix', 'velclaw-admin'],
  ['trailing whitespace', 'velclaw '],
]) {
  test(`image verification rejects ${label} with valid ports`, () => {
    const result = inspectMetadata('map[3000/tcp:{}]', user)
    assert.equal(result.status, 1)
    assert.equal(result.stderr, 'ports\nuser\n')
  })
}

for (const field of ['ports', 'user']) {
  test(`image verification fails closed when Docker cannot inspect ${field}`, () => {
    const result = inspectMetadata('map[3000/tcp:{}]', 'velclaw', field)
    assert.equal(result.status, 1)
    assert.equal(result.stderr, field === 'ports' ? 'ports\n' : 'ports\nuser\n')
  })
}
