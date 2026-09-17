export type IbmCloudVpcConfig = {
  serviceUrl: string
  accessToken: string
  region: string
  zone: string
  vpcId: string
  subnetId: string
  sshKeyId: string
  imageId: string
  profileName: string
  instanceName: string
}

export type IbmCloudApiRequest = {
  method: 'GET' | 'POST'
  path: string
  body?: Record<string, unknown>
}

export type IbmCloudApiPlan = IbmCloudApiRequest & {
  url: string
  headers: Record<string, string>
}

export type IbmCloudInstanceSummary = {
  id?: string
  name?: string
  status?: string
  lifecycle_state?: string
}

const API_VERSION = '2025-01-21'

function requireValue(name: string, value: string) {
  if (!value.trim()) throw new Error(`${name} is required`)
}

function buildPlan(config: IbmCloudVpcConfig, request: IbmCloudApiRequest): IbmCloudApiPlan {
  requireValue('serviceUrl', config.serviceUrl)
  requireValue('accessToken', config.accessToken)
  const base = new URL(config.serviceUrl)
  if (base.protocol !== 'https:') throw new Error('IBM Cloud serviceUrl must use HTTPS')
  const url = new URL(request.path, base)
  url.searchParams.set('version', API_VERSION)
  url.searchParams.set('generation', '2')
  return {
    ...request,
    url: url.toString(),
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      Accept: 'application/json',
      ...(request.body ? { 'Content-Type': 'application/json' } : {}),
    },
  }
}

export function createIbmCloudVpcInstancePlan(config: IbmCloudVpcConfig): IbmCloudApiPlan {
  for (const [name, value] of Object.entries(config)) {
    if (name !== 'accessToken') requireValue(name, value)
  }
  requireValue('accessToken', config.accessToken)

  return buildPlan(config, {
    method: 'POST',
    path: '/v1/instances',
    body: {
      name: config.instanceName,
      profile: { name: config.profileName },
      zone: { name: config.zone },
      image: { id: config.imageId },
      vpc: { id: config.vpcId },
      primary_network_interface: { subnet: { id: config.subnetId } },
      keys: [{ id: config.sshKeyId }],
    },
  })
}

export function createIbmCloudInstanceListPlan(config: IbmCloudVpcConfig) {
  return buildPlan(config, { method: 'GET', path: '/v1/instances' })
}

export function findIbmCloudInstanceByName(
  instances: IbmCloudInstanceSummary[],
  instanceName: string,
): IbmCloudInstanceSummary | undefined {
  return instances.find((instance) => instance.name === instanceName)
}

export function createIbmCloudInstanceStatusPlan(config: IbmCloudVpcConfig, instanceId: string) {
  requireValue('instanceId', instanceId)
  return buildPlan(config, { method: 'GET', path: `/v1/instances/${encodeURIComponent(instanceId)}` })
}
