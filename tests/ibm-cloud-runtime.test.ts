import assert from 'node:assert/strict'
import test from 'node:test'
import { createIbmCloudRuntimePlan } from '@/lib/velclaw/integrations/ibm-cloud-runtime'

test('IBM runtime targets the configured VPC and subnet', () => {
  const plan = createIbmCloudRuntimePlan({
    accessToken: 'token',
    config: {
      region: 'us-south', zone: 'us-south-1', instanceName: 'velclaw-runtime',
      imageId: 'image-id', profileName: 'bx2-2x8', vpcId: 'vpc-id', subnetId: 'subnet-id',
      sshKeyId: 'key-id', serviceUrl: 'https://us-south.iaas.cloud.ibm.com',
    },
  })
  const body = JSON.parse(plan.body)
  assert.equal(body.vpc.id, 'vpc-id')
  assert.equal(body.primary_network_interface.subnet.id, 'subnet-id')
  assert.equal(plan.headers.Authorization, 'Bearer token')
})

test('IBM runtime rejects insecure service URLs and missing credentials', () => {
  assert.throws(() => createIbmCloudRuntimePlan({ accessToken: '', config: {} as never }), /access token/)
  assert.throws(() => createIbmCloudRuntimePlan({ accessToken: 'token', config: {
    region: 'us-south', zone: 'us-south-1', instanceName: 'v', imageId: 'i', profileName: 'p',
    vpcId: 'vpc', subnetId: 's', sshKeyId: 'k', serviceUrl: 'http://example.com',
  } }), /HTTPS/)
})
