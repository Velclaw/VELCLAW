import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'

const env = process.env
const writeResult = (status, reviewClean = false) => {
  writeFileSync(
    env.VELCLAW_RESULT_FILE || '/tmp/velclaw-autofix-result.json',
    JSON.stringify({ status, reviewClean }, null, 2),
  )
}

const run = (command, args, options = {}) => {
  try {
    return {
      ok: true,
      output: execFileSync(command, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        ...options,
      }),
    }
  } catch (error) {
    return {
      ok: false,
      output: `${error.stdout ?? ''}\n${error.stderr ?? ''}`.trim(),
      error,
    }
  }
}

const check = (name, command, args) => {
  const result = run(command, args)
  console.log(`::group::${name}`)
  console.log(result.output.slice(-12000))
  console.log('::endgroup::')
  return result
}

const checks = [
  ['type-check', 'pnpm', ['type-check']],
  ['lint', 'pnpm', ['lint']],
  ['test', 'pnpm', ['test']],
  ['build', 'pnpm', ['build']],
]

const failures = []
for (const [name, command, args] of checks) {
  const result = check(name, command, args)
  if (!result.ok) failures.push({ name, output: result.output })
}

if (!failures.length) {
  writeResult('clean', true)
  console.log('VELCLAW_AUTOFIX_STATUS=clean')
  process.exit(0)
}

if (env.GITHUB_HEAD_REPO && env.GITHUB_REPOSITORY && env.GITHUB_HEAD_REPO !== env.GITHUB_REPOSITORY) {
  writeResult('blocked-fork', false)
  console.log('VELCLAW_AUTOFIX_STATUS=blocked-fork')
  console.log('Auto-fix is disabled for fork pull requests.')
  process.exit(0)
}

if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required for the auto-fix layer')

const diff = run('git', ['diff', '--no-ext-diff', `${env.GITHUB_BASE_REF}...HEAD`]).output.slice(-30000)
const failureText = failures.map((failure) => `### ${failure.name}\n${failure.output.slice(-9000)}`).join('\n\n')
const reviewText =
  env.VELCLAW_REVIEW_FILE && existsSync(env.VELCLAW_REVIEW_FILE)
    ? readFileSync(env.VELCLAW_REVIEW_FILE, 'utf8').slice(-16000)
    : 'No machine-readable review findings were captured.'

const prompt = `You are the Velclaw Auto-Fix layer. Produce the smallest safe source-code fix for the failing CI checks below.

Rules:
- Return ONLY a unified git diff in a fenced diff block.
- Modify only source or test files under app/, components/, lib/, server/, scripts/, tests/.
- Never modify .github/, package.json, lockfiles, env files, credentials, deployment configuration, Dockerfiles, or generated assets.
- Do not add dependencies.
- Preserve existing architecture and public contracts.
- Fix the root cause, not the symptom.
- If no safe patch can be produced, return an empty diff.

Review findings:
${reviewText}

Failures:
${failureText}

Current PR diff:
${diff}`

const response = await fetch('https://models.github.ai/inference/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  },
  body: JSON.stringify({
    model: env.VELCLAW_AUTOFIX_MODEL || 'openai/gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  }),
})

if (!response.ok) {
  throw new Error(`GitHub Models request failed: ${response.status} ${await response.text()}`)
}

const payload = await response.json()
const content = payload?.choices?.[0]?.message?.content || ''
const match = content.match(/```diff\s*([\s\S]*?)```/i)
const patch = (match ? match[1] : content).trim()

if (!patch) {
  writeResult('no-safe-patch', false)
  console.log('VELCLAW_AUTOFIX_STATUS=no-safe-patch')
  process.exit(0)
}

const protectedPath = patch.split('\n').some(
  (line) =>
    line.startsWith('diff --git a/') &&
    /^(?:\.github\/|package\.json$|pnpm-lock\.yaml$|package-lock\.json$|yarn\.lock$|Dockerfile$|.*\.env(?:$|\/))/.test(
      line.slice('diff --git a/'.length),
    ),
)

if (protectedPath) throw new Error('Auto-fix patch attempted to modify a protected path')

const patchFile = '/tmp/velclaw-autofix.patch'
writeFileSync(patchFile, patch)

const dryRun = run('git', ['apply', '--check', '--whitespace=fix', patchFile])
if (!dryRun.ok) throw new Error(`Generated patch failed validation:\n${dryRun.output}`)

const apply = run('git', ['apply', '--whitespace=fix', patchFile])
if (!apply.ok) throw new Error(`Generated patch could not be applied:\n${apply.output}`)

const postFailures = []
for (const [name, command, args] of checks) {
  const result = check(`post-fix ${name}`, command, args)
  if (!result.ok) postFailures.push({ name, output: result.output })
}

if (postFailures.length) {
  run('git', ['reset', '--hard', 'HEAD'])
  run('git', ['clean', '-fd'])
  writeResult('failed-validation', false)
  console.log('VELCLAW_AUTOFIX_STATUS=failed-validation')
  process.exit(1)
}

const finalDiff = run('git', ['diff', '--no-ext-diff']).output.slice(-30000)
const reviewResponse = await fetch('https://models.github.ai/inference/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: env.VELCLAW_AUTOFIX_MODEL || 'openai/gpt-4o-mini',
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `You are the Velclaw post-fix reviewer. Decide whether the proposed patch fully addresses the reported review findings without introducing a new correctness or security issue. Return ONLY JSON: {"clean":true|false,"reason":"..."}.

Review findings:
${reviewText}

Proposed patch:
${finalDiff}`,
      },
    ],
  }),
})

if (!reviewResponse.ok) {
  throw new Error(`Post-fix review failed: ${reviewResponse.status} ${await reviewResponse.text()}`)
}

const reviewPayload = await reviewResponse.json()
const reviewContent = reviewPayload?.choices?.[0]?.message?.content || ''
let postFixReview = { clean: false, reason: 'No structured post-fix review returned' }
try {
  postFixReview = JSON.parse(reviewContent)
} catch {}

if (postFixReview.clean !== true) {
  run('git', ['reset', '--hard', 'HEAD'])
  run('git', ['clean', '-fd'])
  writeResult('review-blocked', false)
  console.log(`Post-fix review blocked approval: ${postFixReview.reason}`)
  process.exit(1)
}

run('git', ['config', 'user.name', 'velclaw-autofix[bot]'])
run('git', ['config', 'user.email', 'velclaw-autofix[bot]@users.noreply.github.com'])
run('git', ['add', 'app', 'components', 'lib', 'server', 'scripts', 'tests'])

const commit = run('git', ['commit', '-m', 'fix: apply Velclaw auto-fix'])
if (!commit.ok) throw new Error(`Auto-fix commit failed:\n${commit.output}`)

const push = run('git', ['push', 'origin', `HEAD:${env.GITHUB_HEAD_REF}`])
if (!push.ok) throw new Error(`Auto-fix push failed:\n${push.output}`)

writeResult('fixed', true)
console.log('VELCLAW_AUTOFIX_STATUS=fixed')
try {
  unlinkSync(patchFile)
} catch {}
