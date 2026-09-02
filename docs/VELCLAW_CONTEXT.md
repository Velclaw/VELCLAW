# Velclaw Project Context

> Canonical project reference. Update this document when a project-level fact changes.

## Identity

- Project: **Velclaw** / `velclaw`
- Canonical GitHub repository: **`Velclaw/Velclaw`**
- Primary/canonical domain: **`velclaw.cfd`**
- Canonical default branch: `main`

## Domain rules

- `velclaw.cfd` is the primary and canonical domain for the Velclaw ecosystem.
- All first-party Velclaw pages should use the `velclaw.cfd` host.
- `*.vercel.app` addresses are deployment URLs and must not be assumed to be canonical.
- Never infer the primary domain from a GitHub Website field or a Vercel deployment URL.

## Canonical pages

- `/` — Workspace / Task
- `/new` — New Task
- `/tasks` — Tasks
- `/velclaw` — Velclaw Dashboard
- `/repos/new` — Repo Workspace
- `/mcp` — MCP Servers
- `/api-keys` — API Keys
- `/wiki` — Wiki
- `/auth/signin` — Sign In
- `/velclaw/ui-audit` — UI Audit
- `/velclawhub` — **VelclawHub** (renamed from the legacy Test Hub)
- `/docs` — Docs
- `/hub` — existing ecosystem hub route

The canonical public ecosystem gateway is now named **VelclawHub**, with route `/velclawhub`. The legacy `/test` route has been removed.

## Core architecture

Velclaw is an AI-native software workspace for agents, code, builds, runtime, storage, and user services.

The required pipeline architecture is:

**Task → Executor → Review → Gate → GitHub API → PR**

The MCP App is an integration/presentation layer. It must reuse Velclaw's existing Task, Review, Gate, and GitHub API source of truth rather than creating parallel systems.

## Working rules

1. Inspect the canonical repository before changing anything.
2. Extend existing functionality instead of creating competing systems.
3. Validate each implementation step with actual repository/build/CI evidence.
4. Never claim a check passes without evidence.
5. Keep API keys and secrets in environment/secrets configuration; never hard-code them.
6. Normal GitHub flow: branch → commit → CI/check → PR → review → merge.
7. Do not merge, delete, or destroy project data without explicit basis.
8. Do not claim production deployment unless it has been verified.

## Important project facts

- Primary domain: `velclaw.cfd`
- Canonical repository: `Velclaw/Velclaw`
- Project name: Velclaw / `velclaw`
- Canonical ecosystem gateway: `/velclawhub`
- Pipeline: Task → Executor → Review → Gate → GitHub API → PR
