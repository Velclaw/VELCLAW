import assert from 'node:assert/strict'
import test from 'node:test'
import { createIbmCloudRuntimePlan } from './ibm-cloud-runtime'

test('IBM runtime uses VPC id separately from region', () => {
  const plan = createIbmCloudRuntimePlan({
    accessToken: 'token',
    config: {
      region: 'us-south',
      zone: 'us-south-1',
      instanceName: 'velclaw-runtime',
      imageId: 'image-id',
      profileName: 'bx2-2x8',
      vpcId: 'vpc-id',
      subnetId: 'subnet-id',
      sshKeyId: 'key-id',
      serviceUrl: 'https://us-south.iaas.cloud.ibm.com',
    },
  })

  const body = JSON.parse(plan.body) as Record<string, unknown>
  assert.deepEqual(body.vpc, { id: 'vpc-id' })
  assert.deepEqual(body.zone, { name: 'us-south-1' })
  assert.equal(plan.method, 'POST')
})

test('IBM runtime rejects non-HTTPS service endpoints', () => {
  assert.throws(
    () =>
      createIbmCloudRuntimePlan({
        accessToken: 'token',
        config: {
          region: 'us-south', zone: 'us-south-1', instanceName: 'x', imageId: 'i',
          profileName: 'p', vpcId: 'v', subnetId: 's', sshKeyId: 'k', serviceUrl: 'http://example.com',
        },
      }),
    /HTTPS/,
  )
})
