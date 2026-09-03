import assert from 'node:assert/strict'
import test from 'node:test'
import { createIbmCloudInstanceStatusPlan, createIbmCloudVpcInstancePlan } from '@/lib/velclaw/integrations/ibm-cloud-vpc'

test('IBM Cloud VSI plan uses the VPC id separately from region', () => {
  const plan = createIbmCloudVpcInstancePlan({
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
  })

  const body = JSON.parse(plan.body as string)
  assert.equal(plan.method, 'POST')
  assert.equal(body.vpc.id, 'vpc-123')
  assert.equal(body.zone.name, 'eu-de-2')
  assert.equal(body.primary_network_interface.subnet.id, 'subnet-123')
  assert.match(plan.url, /\/v1\/instances\?version=/)
  assert.equal(plan.headers.Authorization, 'Bearer test-token')
})

test('IBM Cloud instance status plan encodes the instance id', () => {
  const plan = createIbmCloudInstanceStatusPlan({
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
  }, 'instance/123')

  assert.equal(plan.method, 'GET')
  assert.match(plan.url, /instances\/instance%2F123\?version=/)
})
