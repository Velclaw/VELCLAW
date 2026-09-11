import { Sandbox } from '@vercel/sandbox'
import { runInProject, runCommandInSandbox } from '../commands'
import { AgentExecutionResult } from '../types'
import { redactSensitiveInfo } from '@/lib/utils/logging'
import { TaskLogger } from '@/lib/utils/task-logger'

const DEFAULT_MODEL = 'codellama'

function validateModel(model: string): boolean {
  return /^[A-Za-z0-9._:/-]+$/.test(model)
}

export async function executeOllamaInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger: TaskLogger,
  selectedModel?: string,
): Promise<AgentExecutionResult> {
  const model = selectedModel?.trim() || DEFAULT_MODEL

  if (!instruction.trim()) {
    return { success: false, error: 'Instruction is required', cliName: 'ollama', changesDetected: false }
  }

  if (!validateModel(model)) {
    return { success: false, error: 'Invalid Ollama model', cliName: 'ollama', changesDetected: false }
  }

  try {
    await logger.info(`Starting Ollama agent with model ${model}...`)

    const installed = await runCommandInSandbox(sandbox, 'which', ['ollama'])
    if (!installed.success) {
      const error = 'Ollama CLI is not installed in the sandbox'
      await logger.error(error)
      return { success: false, error, cliName: 'ollama', changesDetected: false }
    }

    const version = await runCommandInSandbox(sandbox, 'ollama', ['--version'])
    if (!version.success) {
      const error = 'Ollama CLI is unavailable in the sandbox'
      await logger.error(error)
      return { success: false, error, cliName: 'ollama', changesDetected: false }
    }

    const modelCheck = await runCommandInSandbox(sandbox, 'ollama', ['show', model])
    if (!modelCheck.success) {
      const error = `Ollama model '${model}' is not available in the sandbox`
      await logger.error(error)
      return { success: false, error, cliName: 'ollama', changesDetected: false }
    }

    await logger.command(`ollama run ${model} [instruction redacted]`)
    const result = await runInProject(sandbox, 'ollama', ['run', model, instruction])

    const output = redactSensitiveInfo(result.output?.trim() || '')
    const errorOutput = redactSensitiveInfo(result.error?.trim() || '')

    if (output) await logger.info(output)
    if (errorOutput) await logger.error(errorOutput)

    const status = await runInProject(sandbox, 'git', ['status', '--porcelain'])
    const changesDetected = Boolean(status.success && status.output?.trim())

    if (!result.success) {
      const error = `Ollama execution failed${result.exitCode !== undefined ? ` (exit code ${result.exitCode})` : ''}: ${errorOutput || 'unknown error'}`
      await logger.error(error)
      return {
        success: false,
        error,
        agentResponse: output,
        cliName: 'ollama',
        changesDetected,
      }
    }

    await logger.success(`Ollama completed successfully${changesDetected ? ' (changes detected)' : ''}`)
    return {
      success: true,
      output: output || 'Ollama completed the task',
      agentResponse: output || 'Ollama completed the task',
      cliName: 'ollama',
      changesDetected,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to execute Ollama in sandbox'
    await logger.error(message)
    return { success: false, error: message, cliName: 'ollama', changesDetected: false }
  }
}
