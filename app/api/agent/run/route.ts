import { NextRequest, NextResponse, after } from 'next/server'
import { db } from '@/lib/db/client'
import { tasks, taskMessages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils/id'
import { createSandbox } from '@/lib/sandbox/creation'
import { executeAgentInSandbox, AgentType } from '@/lib/sandbox/agents'
import { pushChangesToBranch } from '@/lib/sandbox/git'
import { createTaskLogger } from '@/lib/utils/task-logger'
import { createFallbackBranchName } from '@/lib/utils/branch-name-generator'
import { createFallbackCommitMessage } from '@/lib/utils/commit-message-generator'
import { detectPortFromRepo } from '@/lib/sandbox/port-detection'

const allowedAgents = new Set<AgentType>(['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode'])

function authorized(req: NextRequest) {
  const expected = process.env.VELCLAW_AGENT_BRIDGE_TOKEN
  if (!expected) return false
  return req.headers.get('authorization') === `Bearer ${expected}`
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'cache-control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return json({ error: 'Unauthorized' }, 401)
  try {
    const body = await req.json()
    const prompt = typeof body.message === 'string' ? body.message.trim() : ''
    const repoUrl = typeof body.repoUrl === 'string' ? body.repoUrl.trim() : (process.env.AGENT_DEFAULT_REPO_URL || '').trim()
    if (!prompt) return json({ error: 'message is required' }, 400)
    if (!repoUrl) return json({ error: 'repoUrl is required for sandbox builds' }, 400)

    const taskId = generateId(12)
    const agent = allowedAgents.has(body.agent as AgentType) ? body.agent as AgentType : ((process.env.AGENT_DEFAULT_TYPE as AgentType) || 'claude')
    const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : undefined
    const maxDuration = Math.min(Math.max(Number(body.maxDuration) || 20, 1), 110)
    const branchName = createFallbackBranchName(taskId)
    const userId = process.env.VELCLAW_AGENT_USER_ID
    if (!userId) return json({ error: 'VELCLAW_AGENT_USER_ID is not configured' }, 503)

    await db.insert(tasks).values({
      id: taskId, userId, prompt, title: prompt.slice(0, 60), repoUrl,
      selectedAgent: agent, selectedModel: model, installDependencies: true,
      maxDuration, keepAlive: true, enableBrowser: Boolean(body.enableBrowser),
      status: 'pending', progress: 0, logs: [], branchName,
    })

    const logger = createTaskLogger(taskId)
    await logger.info('Build session created')
    await logger.info('Planning workspace changes')

    const run = async () => {
      let sandbox: Awaited<ReturnType<typeof createSandbox>>['sandbox'] | undefined
      try {
        await logger.updateStatus('processing', 'Agent build started')
        await logger.updateProgress(10, 'Inspecting repository')
        const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null
        const apiKeys = {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,
          CURSOR_API_KEY: process.env.CURSOR_API_KEY,
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
        }
        const port = await detectPortFromRepo(repoUrl, githubToken)
        const sandboxResult = await createSandbox({
          taskId, repoUrl, githubToken,
          gitAuthorName: process.env.GITHUB_USER_NAME || 'Velclaw Agent',
          gitAuthorEmail: process.env.GITHUB_USER_EMAIL || 'agent@velclaw.local',
          apiKeys, timeout: `${maxDuration}m`, ports: [port], runtime: 'node22', resources: { vcpus: 4 },
          taskPrompt: prompt, selectedAgent: agent, selectedModel: model, installDependencies: true,
          keepAlive: true, enableBrowser: Boolean(body.enableBrowser), preDeterminedBranchName: branchName,
          onProgress: (progress, message) => logger.updateProgress(progress, message),
        }, logger)
        if (!sandboxResult.success || !sandboxResult.sandbox) throw new Error(sandboxResult.error || 'Sandbox creation failed')

        sandbox = sandboxResult.sandbox
        await db.update(tasks).set({ sandboxId: sandbox.sandboxId, sandboxUrl: sandboxResult.domain || null, branchName: sandboxResult.branchName || branchName, updatedAt: new Date() }).where(eq(tasks.id, taskId))
        await logger.updateProgress(50, 'Running coding agent')

        const agentInstruction = `You are Velclaw Agent operating inside an isolated Vercel Sandbox. Execute the requested build, not just describe it. Inspect the existing project first, edit the necessary files, run the project, run relevant tests/typechecks, and if a command fails, diagnose the failure, patch the code, rerun the failed command, and continue until the result is validated. Preserve existing conventions. Do not expose credentials. User request:\n\n${prompt}`
        const agentResult = await executeAgentInSandbox(sandbox, agentInstruction, agent, logger, model, [], undefined, apiKeys, false, undefined, taskId, generateId())
        if (!agentResult.success) throw new Error(agentResult.error || 'Agent execution failed')

        if (agentResult.agentResponse) await db.insert(taskMessages).values({ id: generateId(12), taskId, role: 'agent', content: agentResult.agentResponse })
        await logger.info('Reviewing generated changes')
        await logger.updateProgress(90, 'Committing validated changes')
        const pushResult = await pushChangesToBranch(sandbox, sandboxResult.branchName || branchName, createFallbackCommitMessage(prompt), logger)
        if (pushResult.pushFailed) throw new Error('Changes were created but could not be pushed to GitHub')

        await db.update(tasks).set({ status: 'completed', progress: 100, previewUrl: sandboxResult.domain || null, updatedAt: new Date() }).where(eq(tasks.id, taskId))
        await logger.success('Build completed and preview is ready')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown agent error'
        await logger.error(message)
        await logger.updateStatus('error', message)
      } finally {
        if (sandbox && process.env.AGENT_SHUTDOWN_AFTER_BUILD === 'true') {
          try { await sandbox.stop() } catch {}
        }
      }
    }

    after(run)
    return json({ ok: true, taskId, status: 'processing', stream: `/api/agent/run?taskId=${encodeURIComponent(taskId)}`, capabilities: { planner: true, filesystem: true, terminal: true, runtime: true, tests: true, review: true, preview: true, git: true } }, 202)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Failed to start agent run' }, 500)
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return json({ error: 'Unauthorized' }, 401)
  const taskId = new URL(req.url).searchParams.get('taskId')
  if (!taskId) return json({ error: 'taskId is required' }, 400)
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)
  if (!task) return json({ error: 'Task not found' }, 404)
  return json({ task: { id: task.id, status: task.status, progress: task.progress, logs: task.logs || [], sandboxUrl: task.sandboxUrl, previewUrl: task.previewUrl, branchName: task.branchName, error: task.error } })
}
