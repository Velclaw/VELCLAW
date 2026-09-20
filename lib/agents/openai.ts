import 'server-only'

import { Agent, OpenAIProvider, Runner } from '@openai/agents'
import { getUserApiKey } from '@/lib/api-keys/user-keys'

type AgentMode = 'single' | 'multi'

type AgentRunInput = {
  userId: string
  message: string
  model?: string
  instructions?: string
  mode?: AgentMode
  maxConcurrentSubagents?: number
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function getOpenAIAgentModel(explicitModel?: string) {
  return cleanText(explicitModel, 120) || process.env.OPENAI_AGENTS_MODEL || 'gpt-5.6-luna'
}

function getOpenAIMcpTools() {
  const serverUrl = cleanText(process.env.OPENAI_MCP_SERVER_URL, 2048)
  if (!serverUrl) return undefined

  const serverLabel = cleanText(process.env.OPENAI_MCP_SERVER_LABEL, 64) || 'velclaw'

  return [
    {
      type: 'mcp',
      server_label: serverLabel,
      transport: {
        type: 'http',
        server_url: serverUrl,
      },
    },
  ]
}

function getOpenAIVaultIds() {
  return (process.env.OPENAI_VAULT_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export async function runOpenAIAgent(input: AgentRunInput) {
  const apiKey = await getUserApiKey('openai')
  if (!apiKey) throw new Error('OpenAI API key is not configured for this user')

  const message = cleanText(input.message, 12000)
  if (!message) throw new Error('message is required')

  const model = getOpenAIAgentModel(input.model)
  const baseInstructions =
    cleanText(input.instructions, 6000) ||
    'You are Velclaw Agent. Be precise, inspect context before acting, use tools when provided, and clearly distinguish verified results from assumptions.'

  const provider = new OpenAIProvider({ apiKey, useResponses: true })

  try {
    const runner = new Runner({ modelProvider: provider })

    if (input.mode === 'multi') {
      const researchAgent = new Agent({
        name: 'Velclaw Research Agent',
        model,
        instructions: `${baseInstructions}\nYou are the research specialist. Focus on facts, evidence, dependencies, and unresolved questions.`,
      })
      const engineeringAgent = new Agent({
        name: 'Velclaw Engineering Agent',
        model,
        instructions: `${baseInstructions}\nYou are the engineering specialist. Focus on implementation, architecture, debugging, testing, and operational consequences.`,
      })
      const rootAgent = new Agent({
        name: 'Velclaw Orchestrator',
        model,
        instructions: `${baseInstructions}\nCoordinate the specialist agents and synthesize their findings into one actionable answer.`,
        handoffs: [researchAgent, engineeringAgent],
      })

      const result = await runner.run(rootAgent, message, { maxTurns: Math.min(Math.max(input.maxConcurrentSubagents || 3, 1), 8) * 4 })
      return { mode: 'multi' as const, model, output: result.finalOutput }
    }

    const agent = new Agent({ name: 'Velclaw Agent', model, instructions: baseInstructions })
    const result = await runner.run(agent, message, { maxTurns: 12 })
    return { mode: 'single' as const, model, output: result.finalOutput }
  } finally {
    await provider.close().catch(() => undefined)
  }
}

export async function createOpenAIAgentsSession(input: {
  userId: string
  message: string
  model?: string
  instructions?: string
  multiAgent?: boolean
  maxConcurrentSubagents?: number
  environment?: 'openai_hosted' | 'none'
}) {
  const apiKey = await getUserApiKey(input.userId)
  if (!apiKey) throw new Error('OpenAI API key is not configured for this user')

  const message = cleanText(input.message, 12000)
  if (!message) throw new Error('message is required')

  const model = getOpenAIAgentModel(input.model)
  const instructions =
    cleanText(input.instructions, 6000) ||
    'You are Velclaw Agent. Complete the requested task, verify your work, and report concrete results.'
  const maxConcurrentSubagents = Math.min(Math.max(input.maxConcurrentSubagents || 3, 1), 8)
  const tools = getOpenAIMcpTools()
  const vaultIds = getOpenAIVaultIds()

  const payload: Record<string, unknown> = {
    agent: {
      model,
      instructions,
      ...(tools ? { tools } : {}),
      ...(input.multiAgent
        ? { multi_agent: { enabled: true, max_concurrent_subagents: maxConcurrentSubagents } }
        : {}),
    },
    ...(vaultIds.length ? { vault_ids: vaultIds } : {}),
    environment: { type: input.environment || 'openai_hosted' },
    input: message,
  }

  const response = await fetch('https://api.openai.com/v1/agents/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'agents=v1',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const responseMessage =
      typeof data?.error?.message === 'string' ? data.error.message : `Agents API request failed (${response.status})`
    throw new Error(responseMessage)
  }

  return data
}
