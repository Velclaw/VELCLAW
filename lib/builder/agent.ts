import 'server-only'

import { Agent, OpenAIProvider, Runner, tool } from '@openai/agents'
import { z } from 'zod'
import { getUserApiKey } from '@/lib/api-keys/user-keys'

export type BuilderWorkspaceFile = { path: string; content: string }

const changeSchema = z.object({
  path: z.string().min(1).max(240),
  content: z.string().max(300_000),
})

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function workspaceContext(files: BuilderWorkspaceFile[]) {
  return files
    .slice(0, 150)
    .map((file) => `\n--- FILE: ${file.path} ---\n${file.content.slice(0, 80_000)}`)
    .join('\n')
}

export async function runBuilderAgent(input: {
  role: 'coder' | 'reviewer' | 'tester' | 'deployer'
  prompt: string
  files: BuilderWorkspaceFile[]
  model?: string
}) {
  const apiKey = await getUserApiKey('openai')
  if (!apiKey) throw new Error('OpenAI API key is not configured for this user')

  const prompt = clean(input.prompt, 12_000)
  if (!prompt) throw new Error('prompt is required')
  const model = clean(input.model, 120) || process.env.OPENAI_AGENTS_MODEL || 'gpt-5.6-luna'
  const context = workspaceContext(input.files)
  const provider = new OpenAIProvider({ apiKey, useResponses: true })
  const collectedChanges: BuilderWorkspaceFile[] = []

  const applyWorkspaceChanges = tool({
    name: 'apply_workspace_changes',
    description: 'Apply complete replacement contents for files in the current Velclaw Builder browser workspace. Use only for deliberate code changes requested by the user.',
    parameters: z.object({ changes: z.array(changeSchema).max(30) }),
    async execute({ changes: requested }) {
      for (const change of requested) collectedChanges.push(change)
      return `Accepted ${requested.length} workspace file changes. Return a concise summary of what was changed.`
    },
  })

  const roleInstructions = {
    coder:
      'You are the Velclaw Coder. Inspect the provided workspace, implement the requested feature, preserve existing conventions, and call apply_workspace_changes with complete file contents for every changed file. Never invent files you do not need.',
    reviewer:
      'You are the Velclaw Reviewer. Audit the workspace for correctness, security, maintainability, accessibility, and obvious runtime failures. Do not modify files. Return findings ordered by severity and concrete fixes.',
    tester:
      'You are the Velclaw Tester. Review package scripts and source for test/build/type-check risks. Do not claim tests were executed. Return a verification plan plus likely failures and exact commands the browser runtime should run.',
    deployer:
      'You are the Velclaw Deployer. Inspect the workspace and explain deployment readiness, required build/start commands, exposed port assumptions, and configuration risks. Do not claim deployment occurred.',
  }[input.role]

  try {
    const agent = new Agent({
      name: `Velclaw ${input.role[0].toUpperCase()}${input.role.slice(1)} Agent`,
      model,
      instructions: `${roleInstructions}\n\nThe browser workspace is the source of truth. Never expose secrets from environment variables.\n\nWORKSPACE:${context}`,
      tools: input.role === 'coder' ? [applyWorkspaceChanges] : [],
    })
    const runner = new Runner({ modelProvider: provider })
    const result = await runner.run(agent, prompt, {
      maxTurns: input.role === 'coder' ? 10 : 6,
      ...(input.role === 'coder' ? { modelSettings: { toolChoice: 'required' as const } } : {}),
    })

    return { role: input.role, model, output: result.finalOutput, changes: collectedChanges }
  } finally {
    await provider.close().catch(() => undefined)
  }
}
