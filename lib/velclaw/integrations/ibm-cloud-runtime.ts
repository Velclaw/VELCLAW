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

const API_VERSION = '2025-01-21'
const CANONICAL_REPO = 'https://github.com/Velclaw/Velclaw.git'

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

  const userData = [
    '#cloud-config',
    'write_files:',
    '  - path: /usr/local/sbin/velclaw-bootstrap',
    '    permissions: "0755"',
    '    content: |',
    '      #!/usr/bin/env bash',
    '      set -euo pipefail',
    '      export DEBIAN_FRONTEND=noninteractive',
    '      apt-get update',
    '      apt-get install -y ca-certificates curl git',
    `      rm -rf /opt/velclaw`,
    `      git clone --depth 1 --branch main ${CANONICAL_REPO} /opt/velclaw`,
    '      exec /opt/velclaw/deploy/ibm-cloud/bootstrap.sh',
    'runcmd:',
    '  - /usr/local/sbin/velclaw-bootstrap',
    '',
  ].join('\n')

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
    user_data: userData,
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
