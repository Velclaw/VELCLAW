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

## Canonical page naming

Display names follow the **Velclaw + function** convention so product navigation, source-level page names, and QA inventories remain unambiguous.

| Route | Canonical display name | Source role |
|---|---|---|
| `/` | **Velclaw Workspace** | Main workspace / task entry |
| `/new` | **Velclaw Task** | Task creation |
| `/tasks` | **Velclaw Tasks** | Task list |
| `/velclaw` | **Velclaw Dashboard** | Pipeline dashboard |
| `/repos/new` | **Velclaw Repo** | Repository creation |
| `/mcp` | **Velclaw MCP** | MCP connectors |
| `/api-keys` | **Velclaw API Keys** | Provider credentials |
| `/wiki` | **Velclaw Wiki** | System knowledge |
| `/auth/signin` | **Velclaw Sign In** | Authentication |
| `/velclawhub` | **VelclawHub** | Ecosystem gateway / route inventory |
| `/velclaw/ui-audit` | **Velclaw UI Audit** | QA / UI audit |
| `/docs` | **Velclaw Docs** | Documentation |
| `/hub` | **VelclawHub Ecosystem** | Existing ecosystem hub route |

The canonical ecosystem gateway is **VelclawHub** at `/velclawhub`. The existing `/hub` route is explicitly named **VelclawHub Ecosystem** so it is not confused with the gateway. The legacy `/test` route has been removed.

## Naming rules

1. Use `Velclaw + function` for user-facing page names where a generic name would be ambiguous.
2. Keep stable public routes unchanged unless a migration/redirect plan is explicitly required.
3. Keep Next.js route directories aligned with their URL semantics; do not rename a route directory solely for display branding when that would silently change the public URL.
4. Use the canonical display name in navigation, QA route inventories, page headings, and source-level page component names where practical.
5. Never use legacy **Test Hub** naming for `/velclawhub`.

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
- Canonical page naming: `Velclaw + function`
- Pipeline: Task → Executor → Review → Gate → GitHub API → PR
