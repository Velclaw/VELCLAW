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

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidModelName(value: string) {
  return /^[A-Za-z0-9._:-]+$/.test(value)
}

function getOpenAIAgentModel(explicitModel?: string) {
  const model =
    cleanText(explicitModel, 120) ||
    cleanText(process.env.OPENAI_AGENTS_MODEL, 120) ||
    'gpt-4.1-mini'

  if (!model || !isValidModelName(model)) {
    throw new Error('OPENAI_AGENTS_MODEL is missing or invalid. Use a supported model name.')
  }

  return model
}
