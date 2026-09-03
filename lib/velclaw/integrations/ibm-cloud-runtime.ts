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

const API_VERSION = '2025-01-01'

/**
 * Builds a deterministic IBM Cloud VPC VSI request.
 * Credentials are supplied at runtime and never persisted in the plan body.
 */
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
    user_data:
      '#cloud-config\n' +
      'write_files:\n' +
      '  - path: /usr/local/sbin/velclaw-bootstrap-ready\n' +
      '    permissions: "0755"\n' +
      '    content: |\n' +
      '      #!/bin/sh\n' +
      '      touch /var/lib/velclaw-bootstrap-ready\n' +
      'runcmd:\n' +
      '  - /usr/local/sbin/velclaw-bootstrap-ready\n',
  })

  return {
    method: 'POST',
    url: new URL(`/v1/instances?version=${API_VERSION}&generation=2`, base).toString(),
    headers: {
      Authorization: `Bearer ${request.accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  }
}
