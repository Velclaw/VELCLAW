import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createIbmCloudInstanceListPlan,
  createIbmCloudInstanceStatusPlan,
  createIbmCloudVpcInstancePlan,
  findIbmCloudInstanceByName,
} from '@/lib/velclaw/integrations/ibm-cloud-vpc'

const config = {
  serviceUrl: 'https://eu-de.iaas.cloud.ibm.com',
  accessToken: 'test-token',
  region: 'eu-de',
  zone: 'eu-de-2',
  vpcId: 'vpc-123',
  subnetId: 'subnet-123',
  sshKeyId: 'key-123',
  imageId: 'image-123',
  profileName: 'bx2-2x8',
  instanceName: 'velclaw-runtime',
}

test('IBM Cloud VSI plan uses the VPC id separately from region', () => {
  const plan = createIbmCloudVpcInstancePlan(config)
  const body = plan.body as Record<string, any>
  assert.equal(plan.method, 'POST')
  assert.equal(body.vpc.id, 'vpc-123')
  assert.equal(body.zone.name, 'eu-de-2')
  assert.equal(body.primary_network_interface.subnet.id, 'subnet-123')
  assert.match(plan.url, /\/v1\/instances\?version=/)
  assert.equal(plan.headers.Authorization, 'Bearer test-token')
})

test('IBM Cloud instance list plan supports orphan recovery by deterministic name', () => {
  const plan = createIbmCloudInstanceListPlan(config)
  assert.equal(plan.method, 'GET')
  assert.match(plan.url, /\/v1\/instances\?version=/)
  assert.equal(
    findIbmCloudInstanceByName(
      [
        { id: 'instance-123', name: 'other' },
        { id: 'instance-456', name: 'velclaw-runtime' },
      ],
      'velclaw-runtime',
    )?.id,
    'instance-456',
  )
})

test('IBM Cloud instance status plan encodes the instance id', () => {
  const plan = createIbmCloudInstanceStatusPlan(config, 'instance/123')
  assert.equal(plan.method, 'GET')
  assert.match(plan.url, /instances\/instance%2F123\?version=/)
})
