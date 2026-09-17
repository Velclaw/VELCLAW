# Velclaw AutoFix Agent

Velclaw AutoFix is a guarded CI repair loop for `Velclaw/Velclaw`.

## Loop

1. `Velclaw Core CI` completes.
2. If it succeeds, AutoFix does nothing.
3. If it fails, AutoFix reads the failed job logs.
4. Error locations are parsed and emitted as GitHub workflow annotations.
5. A repair agent receives the failure plus the relevant source context.
6. The agent returns a minimal unified diff.
7. The diff is checked against protected-path and size/file-count policies.
8. The patch is applied and `pnpm type-check` runs before commit.
9. The repair branch is pushed and a PR is created or updated.
10. Core CI runs again on that branch.
11. The next failed run re-enters the same loop.
12. The loop stops when CI succeeds or the configured iteration limit is reached.

## Required secret

Configure one repository secret:

- `OPENAI_API_KEY` (preferred), or
- `LLM_API_KEY` (legacy-compatible fallback)

Optional repository variable:

- `VELCLAW_AUTOFIX_MODEL` — defaults to `gpt-5.6`.

The secret is never written to the repository or included in the agent prompt.

## Safety boundaries

AutoFix cannot modify:

- `.env` files
- the AutoFix workflow
- the Core CI workflow
- lockfiles
- AutoFix state

The agent is limited to configured source/document extensions, six files per patch, and a 60 KB patch. It cannot turn off CI checks or hide failures.

## State

`.velclaw/autofix/state.json` records the iteration number, recent error fingerprints, and the last repair run. Reports are stored under `.velclaw/autofix/runs/` so each iteration has an auditable record.

The default safety limit is 12 iterations. Increase it only after reviewing the repair behavior.
