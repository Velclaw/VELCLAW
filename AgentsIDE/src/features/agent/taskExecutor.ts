import type { AgentTask, FileChange } from './types'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const starterApp = `import { useState } from 'react'\n\nexport default function App() {\n  const [status, setStatus] = useState('Ready')\n\n  return (\n    <main>\n      <h1>AgentsIDE</h1>\n      <p>{status}</p>\n      <button onClick={() => setStatus('Built by Agent')}>\n        Run agent\n      </button>\n    </main>\n  )\n}`

const buildChange = (prompt: string): FileChange => ({
  path: 'src/App.tsx',
  kind: 'modified',
  before: starterApp,
  after: starterApp.replace(
    "<p>{status}</p>",
    `<p>{status}</p>\n      <p data-agent-task="true">Task: ${prompt.slice(0, 80)}</p>`,
  ),
})

export async function executeTask(
  prompt: string,
  onUpdate: (task: AgentTask) => void,
): Promise<AgentTask> {
  const task: AgentTask = {
    id: crypto.randomUUID(),
    prompt,
    status: 'planning',
    plan: [],
    changes: [],
    logs: [],
    createdAt: new Date().toISOString(),
  }

  const update = (patch: Partial<AgentTask>) => {
    Object.assign(task, patch)
    onUpdate({ ...task, plan: [...task.plan], changes: [...task.changes], logs: [...task.logs] })
  }

  task.logs.push('Agent task created')
  onUpdate({ ...task })
  await wait(450)

  task.plan.push('Inspect the active workspace and identify the smallest safe change')
  task.plan.push('Prepare a focused edit for src/App.tsx')
  task.plan.push('Run lightweight validation before review')
  task.logs.push('Plan generated')
  update({ status: 'executing' })
  await wait(550)

  const change = buildChange(prompt)
  task.changes.push(change)
  task.logs.push(`Prepared ${change.kind} change: ${change.path}`)
  update({ status: 'testing' })
  await wait(550)

  task.logs.push('Validation passed: change is structurally reviewable')
  update({ status: 'review' })
  return { ...task }
}
