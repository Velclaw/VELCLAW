export type IbmCloudRuntimeConfig = {
  region: string
  zone: string
  instanceName: string
  imageId: string
  profileName: string
  subnetId: string
  securityGroupId?: string
  sshKeyId: string
  serviceUrl: string
}

export type IbmCloudRuntimeRequest = {
  config: IbmCloudRuntimeConfig
  accessToken: string
}

export type IbmCloudRuntimePlan = {
  method: 'POST'
  url: string
  headers: Record<string, string>
  body: string
}

/**
 * Builds an IBM Cloud VPC VSI provisioning request.
 * The runtime supplies the IAM access token; this module never persists it.
 * Actual provider execution remains outside the web process.
 */
export function createIbmCloudRuntimePlan(
  request: IbmCloudRuntimeRequest,
): IbmCloudRuntimePlan {
  if (!request.accessToken.trim()) throw new Error('IBM Cloud access token is required')

  const c = request.config
  for (const [name, value] of Object.entries(c)) {
    if (!value.trim()) throw new Error(`${name} is required`)
  }

  const base = new URL(c.serviceUrl)
  if (base.protocol !== 'https:') throw new Error('IBM Cloud serviceUrl must use HTTPS')

  const body = JSON.stringify({
    name: c.instanceName,
    profile: { name: c.profileName },
    zone: { name: c.zone },
    image: { id: c.imageId },
    vpc: { id: c.region },
    primary_network_interface: {
      subnet: { id: c.subnetId },
      ...(c.securityGroupId ? { security_groups: [{ id: c.securityGroupId }] } : {}),
    },
    keys: [{ id: c.sshKeyId }],
  })

  return {
    method: 'POST',
    url: new URL('/v1/instances?version=2025-01-01&generation=2', base).toString(),
    headers: {
      Authorization: `Bearer ${request.accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  }
}
