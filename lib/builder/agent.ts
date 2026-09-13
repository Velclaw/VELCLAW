import 'server-only'

import { Agent, OpenAIProvider, Runner, tool } from '@openai/agents'
import { z } from 'zod'
import { getUserApiKey } from '@/lib/api-keys/user-keys'

export type BuilderWorkspaceFile = { path: string; content: string }

const SAFE_PATH = /^(?!\/)(?!.*\.\.)(?!.*(?:^|\/)(?:node_modules|\.git|\.next|dist|build|coverage)(?:\/|$))[A-Za-z0-9._/-]+$/
const changeSchema = z.object({
  path: z.string().min(1).max(240).regex(SAFE_PATH, 'unsafe workspace path'),
  content: z.string().max(300_000),
})

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function validateWorkspace(files: BuilderWorkspaceFile[]) {
  if (files.length > 150) throw new Error('workspace contains too many files')
  const totalBytes = files.reduce((sum, file) => sum + Buffer.byteLength(file.content, 'utf8'), 0)
  if (totalBytes > 2_000_000) throw new Error('workspace exceeds the 2 MB agent context limit')
  if (files.some((file) => !SAFE_PATH.test(file.path))) throw new Error('workspace contains an unsafe path')
}

function workspaceContext(files: BuilderWorkspaceFile[]) {
  return files.slice(0, 150).map((file) => `\n--- FILE: ${file.path} ---\n${file.content.slice(0, 80_000)}`).join('\n')
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
  validateWorkspace(input.files)

  const modelName = clean(input.model, 120) || process.env.OPENAI_AGENTS_MODEL || 'gpt-5.6-luna'
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

  let roleInstructions: string
  switch (input.role) {
    case 'coder':
      roleInstructions = 'You are the Velclaw Coder. Inspect the provided workspace, implement the requested feature, preserve existing conventions, and call apply_workspace_changes with complete file contents for every changed file. Never invent files you do not need.'
      break
    case 'reviewer':
      roleInstructions = 'You are the Velclaw Reviewer. Audit the workspace for correctness, security, maintainability, accessibility, and obvious runtime failures. Do not modify files. Return findings ordered by severity and concrete fixes.'
      break
    case 'tester':
      roleInstructions = 'You are the Velclaw Tester. Review package scripts and source for test/build/type-check risks. Do not claim tests were executed. Return a verification plan plus likely failures and exact commands the browser runtime should run.'
      break
    case 'deployer':
      roleInstructions = 'You are the Velclaw Deployer. Inspect the workspace and explain deployment readiness, required build/start commands, exposed port assumptions, configuration risks, and the exact handoff to Velclaw Hosting. Do not claim deployment occurred.'
      break
  }

  const roleLabel = `${input.role.charAt(0).toUpperCase()}${input.role.slice(1)}`

  try {
    const agent = new Agent({
      name: `Velclaw ${roleLabel} Agent`,
      model: modelName,
      instructions: `${roleInstructions}\n\nThe browser workspace is the source of truth. Never expose secrets from environment variables.\n\nWORKSPACE:${context}`,
      tools: input.role === 'coder' ? [applyWorkspaceChanges] : [],
    })
    const runner = new Runner({ modelProvider: provider })
    const result = await runner.run(agent, prompt, {
      maxTurns: input.role === 'coder' ? 10 : 6,
      ...(input.role === 'coder' ? { modelSettings: { toolChoice: 'required' as const } } : {}),
    })

    const output = result.finalOutput ?? ''
    return { role: input.role, model: modelName, output, changes: collectedChanges }
  } finally {
    await provider.close().catch(() => undefined)
  }
}

export async function runBuilderWorkflow(input: { prompt: string; files: BuilderWorkspaceFile[]; model?: string }) {
  let workspace = input.files.map((file) => ({ ...file }))
  validateWorkspace(workspace)
  const steps: Array<{ role: 'coder' | 'tester' | 'reviewer' | 'deployer'; output: string }> = []

  const coder = await runBuilderAgent({ role: 'coder', prompt: `Implement this request completely: ${input.prompt}`, files: workspace, ...(input.model ? { model: input.model } : {}) })
  steps.push({ role: 'coder', output: coder.output })
  if (coder.changes.length) {
    const map = new Map(workspace.map((file) => [file.path, file.content]))
    for (const change of coder.changes) map.set(change.path, change.content)
    workspace = Array.from(map, ([path, content]) => ({ path, content }))
  }

  const tester = await runBuilderAgent({
    role: 'tester',
    prompt: `Verify the implementation for this request: ${input.prompt}. Produce exact browser-terminal commands for install, type-check, test and build. Do not claim execution.`,
    files: workspace,
    ...(input.model ? { model: input.model } : {}),
  })
  steps.push({ role: 'tester', output: tester.output })

  const reviewer = await runBuilderAgent({
    role: 'reviewer',
    prompt: `Review the implementation for this request: ${input.prompt}. Focus on correctness, security, accessibility, runtime failures and deployment readiness.`,
    files: workspace,
    ...(input.model ? { model: input.model } : {}),
  })
  steps.push({ role: 'reviewer', output: reviewer.output })

  const deployer = await runBuilderAgent({
    role: 'deployer',
    prompt: `Prepare this implementation for Velclaw Hosting for the request: ${input.prompt}. Identify required build/start configuration and any blocker before publishing. Do not claim deployment.`,
    files: workspace,
    ...(input.model ? { model: input.model } : {}),
  })
  steps.push({ role: 'deployer', output: deployer.output })

  return {
    model: clean(input.model, 120) || process.env.OPENAI_AGENTS_MODEL || 'gpt-5.6-luna',
    output: steps.map((step) => `[${step.role}]\n${step.output}`).join('\n\n'),
    changes: workspace.filter((file) => !input.files.some((original) => original.path === file.path && original.content === file.content)),
    steps,
  }
}
