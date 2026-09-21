# Velclaw task workflow

The user-facing task workflow is exposed at `/velclaw/tasks/<taskId>`.

The console is intentionally a thin orchestration UI over the existing task system:

1. Create Task — use the existing task creation flow.
2. Repository + Agent — use the task's configured repository and executor.
3. Execute in Sandbox — existing sandbox executor remains the execution boundary.
4. Live Logs / Diff — existing task logs and diff APIs remain the source of truth.
5. Gito Review — existing review integration normalizes findings.
6. Review Gate — critical/high findings block PR creation.
7. GitHub PR — existing authenticated GitHub service creates the PR after the gate.
8. PR status — task/PR status is displayed by the existing task UI and APIs.

The console does not store GitHub credentials and does not execute shell commands in the browser.
