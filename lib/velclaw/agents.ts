export type VelclawAgentId = 'claude' | 'codex' | 'copilot' | 'cursor' | 'gemini' | 'opencode' | 'ollama'

export type AgentRunRequest = {
  agent: VelclawAgentId
  prompt: string
  cwd?: string
  model?: string
}

export type AgentRunResult = {
  agent: VelclawAgentId
  accepted: boolean
  command: string[]
}

/**
 * Builds an execution request without invoking a process.
 * Actual execution must happen through the platform sandbox/runner.
 */
export function createAgentRunRequest(request: AgentRunRequest): AgentRunResult {
  if (!request.prompt.trim()) throw new Error('Prompt is required')

  if (request.agent === 'ollama') {
    const model = request.model?.trim() || 'codellama'
    if (!/^[A-Za-z0-9._:/-]+$/.test(model)) throw new Error('Invalid Ollama model')

    return {
      agent: request.agent,
      accepted: true,
      command: ['ollama', 'run', model, request.prompt],
    }
  }

  return {
    agent: request.agent,
    accepted: true,
    command: [],
  }
}
