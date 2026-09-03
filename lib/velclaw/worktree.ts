export type WorktreePlan = {
  branch: string
  path: string
  commands: string[]
}

/**
 * Produces a deterministic worktree plan for an agent task.
 * Execution remains inside the configured sandbox/runner.
 */
export function createWorktreePlan(branch: string, path: string): WorktreePlan {
  if (!/^[A-Za-z0-9._/-]+$/.test(branch)) {
    throw new Error('Invalid branch name')
  }

  if (!path.trim() || path.includes('\0')) {
    throw new Error('Invalid worktree path')
  }

  return {
    branch,
    path,
    commands: ['git fetch --prune origin', `git worktree add ${shellQuote(path)} -b ${shellQuote(branch)} origin/HEAD`],
  }
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}
