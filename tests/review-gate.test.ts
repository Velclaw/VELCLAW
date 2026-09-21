import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateReviewGate, type ReviewFinding } from '../lib/velclaw/review'

test('review gate passes when no critical/high findings exist', () => {
  const findings: ReviewFinding[] = [
    { severity: 'medium', message: 'Improve naming' },
    { severity: 'low', message: 'Optional cleanup' },
  ]

  const gate = evaluateReviewGate(findings)
  assert.equal(gate.passed, true)
  assert.deepEqual(gate.blockingFindings, [])
})

test('review gate blocks critical findings', () => {
  const finding: ReviewFinding = { severity: 'critical', message: 'Remote code execution risk', file: 'app/api/run.ts' }
  const gate = evaluateReviewGate([finding])

  assert.equal(gate.passed, false)
  assert.deepEqual(gate.blockingFindings, [finding])
})

test('review gate blocks high findings and preserves their order', () => {
  const findings: ReviewFinding[] = [
    { severity: 'info', message: 'Note' },
    { severity: 'high', message: 'Missing authorization', file: 'app/api/tasks/route.ts' },
    { severity: 'medium', message: 'Refactor later' },
    { severity: 'critical', message: 'Unsafe command execution', file: 'lib/sandbox.ts' },
  ]

  const gate = evaluateReviewGate(findings)
  assert.equal(gate.passed, false)
  assert.deepEqual(gate.blockingFindings, [findings[1], findings[3]])
})

test('review gate does not mutate findings', () => {
  const findings: ReviewFinding[] = [{ severity: 'high', message: 'Problem' }]
  const before = structuredClone(findings)

  evaluateReviewGate(findings)
  assert.deepEqual(findings, before)
})
