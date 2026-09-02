# Velclaw Project Context

> Canonical project reference. Update this document when a project-level fact changes.

## Identity

- Project: **Velclaw** / `velclaw`
- Canonical GitHub repository: **`Velclaw/Velclaw`**
- Primary/canonical domain: **`velclaw.cfd`**
- Documentation domain: **`docs.velclaw.ai`**
- Default branch: `main`

## Domain rules

- `velclaw.cfd` is the primary Velclaw domain.
- `docs.velclaw.ai` is the documentation domain, not the primary application domain.
- `*.vercel.app` addresses are deployment URLs and must not be assumed to be the canonical domain.
- Never infer the primary domain from a GitHub Website field or a Vercel deployment URL.

## Repository rule

- The canonical/root repository is **`Velclaw/Velclaw`**.
- Do not treat `zskbot/Velclaw` or `zskbot/velclaw` as the canonical/root repository.
- Future Velclaw implementation work must be checked against `Velclaw/Velclaw` first.

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
- Docs domain: `docs.velclaw.ai`
- Canonical repository: `Velclaw/Velclaw`
- Project name: Velclaw / `velclaw`
- Pipeline: Task → Executor → Review → Gate → GitHub API → PR
