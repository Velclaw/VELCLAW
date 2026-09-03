export type DigitalOceanInferenceRouterConfig = {
  accessKey: string
  routerName: string
  endpoint?: string
}

export type DigitalOceanInferenceMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type DigitalOceanInferenceResponse = {
  id?: string
  model?: string
  choices?: Array<{
    message?: {
      role?: string
      content?: string
    }
  }>
  [key: string]: unknown
}

const DEFAULT_ENDPOINT = 'https://inference.do-ai.run/v1/chat/completions'

function requireConfig(config: DigitalOceanInferenceRouterConfig) {
  if (!config.accessKey.trim()) throw new Error('DigitalOcean model access key is required')
  if (!config.routerName.trim()) throw new Error('DigitalOcean inference router name is required')
  const endpoint = config.endpoint || DEFAULT_ENDPOINT
  const url = new URL(endpoint)
  if (url.protocol !== 'https:' || url.hostname !== 'inference.do-ai.run') {
    throw new Error('DigitalOcean inference endpoint must use https://inference.do-ai.run')
  }
  return endpoint
}

export async function runDigitalOceanInference(
  config: DigitalOceanInferenceRouterConfig,
  messages: DigitalOceanInferenceMessage[],
  options: { affinity?: string; maxTokens?: number } = {},
): Promise<DigitalOceanInferenceResponse> {
  const endpoint = requireConfig(config)
  const headers = new Headers({
    authorization: `Bearer ${config.accessKey}`,
    'content-type': 'application/json',
  })
  if (options.affinity) headers.set('X-Model-Affinity', options.affinity)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: `router:${config.routerName}`,
      messages,
      stream: false,
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`DigitalOcean inference router request failed (${response.status}): ${detail.slice(0, 2000)}`)
  }

  return (await response.json()) as DigitalOceanInferenceResponse
}

export function createDigitalOceanInferenceRouterConfigFromEnv(): DigitalOceanInferenceRouterConfig {
  const accessKey = process.env.MODEL_ACCESS_KEY || ''
  const routerName = process.env.DO_INFERENCE_ROUTER || ''
  if (!accessKey || !routerName) {
    throw new Error('MODEL_ACCESS_KEY and DO_INFERENCE_ROUTER are required for DigitalOcean Inference Router')
  }
  return { accessKey, routerName }
}
