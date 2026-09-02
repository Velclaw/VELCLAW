import test from 'node:test'
import assert from 'node:assert/strict'
import { VELCLAW_SKILLS, getVelclawSkill, isVelclawSkillAgent } from '../lib/velclaw/skills'

const requiredStages = ['task-executor', 'review-executor'] as const

test('Velclaw Skills registry is non-empty and uniquely identified', () => {
  assert.ok(VELCLAW_SKILLS.length > 0)
  const ids = VELCLAW_SKILLS.map((skill) => skill.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('every available skill has an execution boundary and no credentials', () => {
  for (const skill of VELCLAW_SKILLS.filter((item) => item.status === 'available')) {
    assert.match(skill.id, /^velclaw-/)
    assert.match(skill.version, /^\d+\.\d+\.\d+$/)
    assert.ok(skill.description.length > 0)
    assert.ok(skill.capabilities.length > 0)
    assert.ok(skill.agents.length > 0)
    assert.ok(requiredStages.includes(skill.executorBinding as (typeof requiredStages)[number]))
    assert.ok(skill.sandbox === 'isolated')
    assert.ok(skill.permissions.length > 0)
    assert.ok(!/(secret|token|password|api[_-]?key)/i.test(JSON.stringify(skill)))
  }
})

test('skill lookup and agent validation are deterministic', () => {
  assert.equal(getVelclawSkill('velclaw-task-planning')?.name, 'Velclaw Task Planning')
  assert.equal(getVelclawSkill('missing-skill'), undefined)
  assert.equal(isVelclawSkillAgent('codex'), true)
  assert.equal(isVelclawSkillAgent('unknown-agent'), false)
})
