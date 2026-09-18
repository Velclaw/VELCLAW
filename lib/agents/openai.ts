import 'server-only'

import { Agent, OpenAIProvider, Runner } from '@openai/agents'
import { getUserApiKey } from '@/lib/api-keys/user-keys'

type AgentMode = 'single' | 'multi'

type AgentRunInput = {
  message: string
  model?: string
  instructions?: string
  mode?: AgentMode
  maxConcurrentSubagents?: number
}

type OpenAIAgentsSessionInput = Omit<AgentRunInput, 'mode'> & {
  multiAgent?: boolean
  environment?: 'none' | 'openai_hosted'
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function getOpenAIAgentModel(explicitModel?: string) {
  const model = cleanText(explicitModel, 120) || cleanText(process.env.OPENAI_AGENTS_MODEL, 120) || 'gpt-4.1-mini'
  if (!/^[A-Za-z0-9._:-]+$/.test(model)) throw new Error('OPENAI_AGENTS_MODEL is missing or invalid.')
  return model
}

export async function runOpenAIAgent(input: AgentRunInput) {
  const message = cleanText(input.message, 20_000)
  if (!message) throw new Error('message is required')

  const apiKey = await getUserApiKey('openai')
  if (!apiKey) throw new Error('OPENAI_API_KEY is required')

  const provider = new OpenAIProvider({ apiKey })
  const agent = new Agent({
    name: 'Velclaw Assistant',
    instructions: cleanText(input.instructions, 12_000) || 'You are a helpful software development assistant.',
    model: getOpenAIAgentModel(input.model),
    modelProvider: provider,
  } as never)
  const result = await Runner.run(agent, message)

  return {
    output: result.finalOutput,
    mode: input.mode === 'multi' ? 'multi' : 'single',
  }
}

export async function createOpenAIAgentsSession(input: OpenAIAgentsSessionInput) {
  const result = await runOpenAIAgent({
    message: input.message,
    model: input.model,
    instructions: input.instructions,
    mode: input.multiAgent ? 'multi' : 'single',
    maxConcurrentSubagents: input.maxConcurrentSubagents,
  })

  return {
    environment: input.environment || 'openai_hosted',
    ...result,
  }
}
