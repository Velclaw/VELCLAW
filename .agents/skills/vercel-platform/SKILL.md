---
name: vercel-platform
description: Diagnose, configure, build, and deploy applications in the Vercel ecosystem, including Next.js, Vite, pnpm monorepos, environment variables, deployment logs, domains, and health checks. Use when the user asks to deploy or fix a Vercel project or integrate Vercel capabilities into Velclaw.
---

# Vercel Platform Skill

## Objective

Operate Vercel deployments safely and verify each claim with provider evidence. Prefer the connected Vercel integration over asking the user to run commands when authorized tools are available.

## Required workflow

1. Identify the exact Vercel team, project, repository, branch, commit, and deployment target. Do not guess project IDs or switch accounts silently.
2. Inspect the latest deployment and its events/logs before editing configuration. Separate the first actionable error from follow-on errors.
3. Inspect the relevant source files, package manager, lockfile, workspace configuration, framework preset, root directory, install command, build command, output directory, environment variable names, and Node.js version.
4. Make the smallest reversible change that addresses the root cause. Preserve unrelated services and production aliases. Never print or commit secret values.
5. Commit changes with a specific message and link the exact commit.
6. Start or observe a deployment for that commit. If it remains queued, report that accurately; do not claim a build passed.
7. After a deployment reaches READY, check its assigned URL and the production alias, then run relevant HTTP health checks and inspect runtime logs if available.
8. Report the verified commit, deployment state, URL, checks performed, failures, and remaining blockers.

## pnpm monorepos and multi-service projects

- Inspect `pnpm-workspace.yaml`, root and child `package.json` files, `pnpm-lock.yaml`, and Vercel service roots together.
- Every package expected to share workspace-managed dependencies must be declared under `packages` using the actual repository directory names.
- Do not assume a workspace declaration alone fixes an outdated lockfile or incorrect install/build command. Compare importer entries in `pnpm-lock.yaml` with package manifests.
- Avoid blindly adding every directory to the workspace. Register only actual Node.js packages that participate in the build.
- For a Vite error such as `vite: command not found`, verify that the package's dependencies are installed in the package's execution context and that devDependencies are not omitted during the build.
- For TypeScript errors such as missing `vite` or `@vitejs/plugin-react`, inspect workspace membership and lockfile importers before changing source code.
- Run package-specific checks where possible. If no shell/build runner is available, do not imply that local tests were executed.

## Secrets and access

- Never commit tokens, API keys, database URLs, OAuth client secrets, or deployment credentials.
- Refer to environment variables by name only. Use the provider's secret/environment-variable interface for values.
- Do not expose production credentials to client-side code.
- Require explicit approval for destructive changes, production alias changes, database migrations, DNS changes, purchases, or actions that can interrupt service.
- Keep least-privilege access and preserve a rollback path.

## Verification rules

- `QUEUED` and `BUILDING` are not successful deployment states.
- `ERROR` is a failed deployment even if an older production alias still works.
- A successful commit is not proof that a deployment succeeded.
- A `READY` state alone is not proof that all routes or integrations work; check the assigned URL and the relevant health endpoint.
- If provider APIs or network restrictions prevent verification, state the exact limitation and provide the inspection link.

## Velclaw integration

For Velclaw's MCP endpoint and connector instructions, read [the Velclaw MCP integration guide](../../../docs/integrations/velclaw-mcp.md). Do not add write-capable MCP tools without server-side authentication, authorization checks, and an explicit approval workflow.
