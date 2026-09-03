import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createIbmCloudRuntimeIdempotencyKey,
  createIbmCloudRuntimeOrchestrationPlan,
  transitionIbmCloudRuntimeState,
} from '@/lib/velclaw/integrations/ibm-cloud-orchestration'

const config = {
  region: 'eu-de',
  zone: 'eu-de-2',
  instanceName: 'velclaw-runtime',
  imageId: 'image-123',
  profileName: 'bx2-2x8',
  vpcId: 'vpc-123',
  subnetId: 'subnet-123',
  sshKeyId: 'key-123',
  serviceUrl: 'https://eu-de.iaas.cloud.ibm.com',
}

test('IBM Cloud orchestration creates once when no runtime exists', () => {
  const plan = createIbmCloudRuntimeOrchestrationPlan({ config, accessToken: 'test-token' })
  assert.equal(plan.action, 'create')
  assert.equal(plan.state, 'provisioning')
  assert.equal(plan.idempotencyKey, createIbmCloudRuntimeIdempotencyKey(config))
})

test('IBM Cloud orchestration polls an existing provisioning runtime', () => {
  const plan = createIbmCloudRuntimeOrchestrationPlan({
    config,
    accessToken: 'test-token',
    existing: {
      idempotencyKey: createIbmCloudRuntimeIdempotencyKey(config),
      state: 'provisioning',
      instanceId: 'instance-123',
      instanceName: config.instanceName,
      updatedAt: '2026-09-03T00:00:00.000Z',
    },
  })
  assert.equal(plan.action, 'poll')
  assert.equal(plan.state, 'provisioning')
  assert.match(plan.request?.url ?? '', /\/v1\/instances\/instance-123\?version=/)
  assert.equal(plan.request?.headers.Authorization, 'Bearer test-token')
})

test('IBM Cloud orchestration is a no-op for ready runtime', () => {
  const plan = createIbmCloudRuntimeOrchestrationPlan({
    config,
    accessToken: 'test-token',
    existing: {
      idempotencyKey: createIbmCloudRuntimeIdempotencyKey(config),
      state: 'ready',
      instanceId: 'instance-123',
      instanceName: config.instanceName,
      updatedAt: '2026-09-03T00:00:00.000Z',
    },
  })
  assert.equal(plan.action, 'noop')
  assert.equal(plan.state, 'ready')
})

test('runtime state transition updates timestamp and rejects invalid ready rollback', () => {
  const record = {
    idempotencyKey: 'ibm-vpc:eu-de:eu-de-2:velclaw-runtime',
    state: 'provisioning' as const,
    instanceName: 'velclaw-runtime',
    updatedAt: '2026-09-03T00:00:00.000Z',
  }
  const ready = transitionIbmCloudRuntimeState(
    record,
    { state: 'ready', instanceId: 'instance-123', error: undefined },
    new Date('2026-09-03T01:00:00.000Z'),
  )
  assert.equal(ready.state, 'ready')
  assert.equal(ready.updatedAt, '2026-09-03T01:00:00.000Z')
  assert.throws(() =>
    transitionIbmCloudRuntimeState(ready, { state: 'provisioning', instanceId: 'instance-123', error: undefined }),
  )
})
