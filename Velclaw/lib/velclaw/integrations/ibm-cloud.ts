export type IbmCloudConfig = {
  iamTokenUrl: string
  apiKeyEnv: string
  serviceUrl?: string
}

export type IbmCloudRequest = {
  serviceUrl: string
  path: string
  method?: string
  accessToken: string
  body?: string
}

export type IbmCloudRequestPlan = {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}

export const IBM_CLOUD_CONFIG: IbmCloudConfig = {
  iamTokenUrl: 'https://iam.cloud.ibm.com/identity/token',
  apiKeyEnv: 'IBM_CLOUD_API_KEY',
}

/**
 * Returns provider configuration without exposing or reading credentials.
 * Credentials must be injected by the deployment secret store.
 */
export function getIbmCloudConfig(serviceUrl?: string): IbmCloudConfig {
  return {
    ...IBM_CLOUD_CONFIG,
    serviceUrl,
  }
}

/**
 * Builds an authenticated IBM Cloud API request descriptor.
 * The access token is supplied by the runtime; this adapter does not persist it.
 */
export function createIbmCloudRequestPlan(request: IbmCloudRequest): IbmCloudRequestPlan {
  const base = new URL(request.serviceUrl)
  const method = request.method?.toUpperCase() ?? 'GET'

  if (!/^https?:$/.test(base.protocol)) {
    throw new Error('IBM Cloud serviceUrl must use HTTP(S)')
  }

  if (!/^[A-Z]+$/.test(method)) {
    throw new Error('Invalid HTTP method')
  }

  if (!request.accessToken.trim()) {
    throw new Error('IBM Cloud access token is required')
  }

  // Preserve a serviceUrl path prefix such as /gateway/api/ while still
  // accepting request paths with or without a leading slash.
  if (!base.pathname.endsWith('/')) base.pathname += '/'
  const path = request.path.replace(/^\/+/, '')
  const url = new URL(path, base)

  return {
    url: url.toString(),
    method,
    headers: {
      Authorization: `Bearer ${request.accessToken}`,
      Accept: 'application/json',
      ...(request.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(request.body !== undefined ? { body: request.body } : {}),
  }
}
