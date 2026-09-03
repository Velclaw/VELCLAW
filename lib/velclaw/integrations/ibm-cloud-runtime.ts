export type IbmCloudRuntimeConfig = {
  region: string
  zone: string
  instanceName: string
  imageId: string
  profileName: string
  vpcId: string
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

/** Builds a deterministic IBM Cloud VPC VSI request. Secrets are supplied at runtime. */
export function createIbmCloudRuntimePlan(
  request: IbmCloudRuntimeRequest,
): IbmCloudRuntimePlan {
  if (!request.accessToken.trim()) throw new Error('IBM Cloud access token is required')

  const c = request.config
  for (const [name, value] of Object.entries(c)) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required`)
  }

  const base = new URL(c.serviceUrl)
  if (base.protocol !== 'https:') throw new Error('IBM Cloud serviceUrl must use HTTPS')

  const body = JSON.stringify({
    name: c.instanceName,
    profile: { name: c.profileName },
    zone: { name: c.zone },
    image: { id: c.imageId },
    vpc: { id: c.vpcId },
    primary_network_interface: {
      subnet: { id: c.subnetId },
      ...(c.securityGroupId ? { security_groups: [{ id: c.securityGroupId }] } : {}),
    },
    keys: [{ id: c.sshKeyId }],
    user_data: '#cloud-config\n' + 'runcmd:\n  - echo velclaw-bootstrap-ready > /var/lib/velclaw-bootstrap\n',
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
