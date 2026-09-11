# Velclaw Project Context

> Canonical project reference. Update this document when a project-level fact changes.

## Identity
- Project: **Velclaw** / `velclaw`
- Canonical GitHub repository: **`Velclaw/Velclaw`**
- Primary/canonical domain: **`velclaw.cfd`**
- Canonical default branch: `main`

## Domain rules
- `velclaw.cfd` is the primary and canonical domain for the Velclaw ecosystem.
- All first-party Velclaw pages and public deployment links should use the `velclaw.cfd` host.
- Preview deployments use first-party subdomains under `velclaw.cfd`, for example `velclaw-git-feat-velclaw-deploy-page3-velclaw.cfd`.
- Platform-generated deployment hostnames are infrastructure details and must not be exposed as Velclaw product URLs.

## Canonical page naming
Display names follow the **Velclaw + function** convention.

| Route | Canonical display name | Source role |
|---|---|---|
| `/` | **Velclaw Workspace** | Main workspace / task entry |
| `/new` | **Velclaw Task** | Task creation |
| `/tasks` | **Velclaw Tasks** | Task list |
| `/velclaw` | **Velclaw Dashboard** | Pipeline dashboard |
| `/repos/new` | **Velclaw Repo** | Repository creation |
| `/mcp` | **Velclaw MCP** | MCP connectors |
| `/plugins` | **Velclaw Plugins** | Integration registry |
| `/skills` | **Velclaw Skills** | Reusable agent capabilities |
| `/deploy` | **Velclaw Deploy** | Deployment control plane |
| `/api-keys` | **Velclaw API Keys** | Provider credentials |
| `/wiki` | **Velclaw Wiki** | System knowledge |
| `/auth/signin` | **Velclaw Sign In** | Authentication |
| `/velclawhub` | **VelclawHub** | Ecosystem gateway / route inventory |
| `/velclaw/ui-audit` | **Velclaw UI Audit** | QA / UI audit |
| `/docs` | **Velclaw Docs** | Documentation |
| `/hub` | **VelclawHub Ecosystem** | Existing ecosystem hub route |

The canonical ecosystem gateway is **VelclawHub** at `/velclawhub`. The existing `/hub` route is explicitly named **VelclawHub Ecosystem**. The legacy `/test` route has been removed.

## Naming rules
1. Use `Velclaw + function` for user-facing page names where a generic name would be ambiguous.
2. Keep stable public routes unchanged unless a migration/redirect plan is explicitly required.
3. Keep route directories aligned with URL semantics.
4. Use canonical display names in navigation, QA inventories, headings, and source-level page components where practical.
5. New first-party pages/components/registries use the Velclaw namespace and do not introduce unrelated product branding.

## Core architecture
Velclaw is an AI-native software workspace for agents, code, builds, runtime, storage, and user services.

Canonical delivery pipeline:

**Task → Skill selection → Executor → Review → Gate → GitHub API → PR → Deployment evidence**

- **Skills** = reusable agent capabilities, instructions and workflows.
- **Plugins** = external integrations/connectors; not pipeline stages.
- **MCP** = protocol/runtime interface; not a pipeline stage.
- **Executor** = executes the selected task/skill in the approved workspace.
- **Review** = produces review evidence/findings.
- **Gate** = enforces quality/policy checks.
- **GitHub API** = branch, commit, checks and PR delivery.
- **Velclaw Deploy** = release/deployment control plane and evidence surface after delivery; it does not create a second execution pipeline.

## Velclaw Deploy

The canonical deployment control-plane page is `/deploy` (**Velclaw Deploy**). It centralizes release preparation, target semantics, deployment evidence and links to the existing Task, Skills, Executor, Review, Gate, GitHub, Plugins, MCP, API Keys and VelclawHub surfaces.

Task-scoped deployment discovery may consume provider/GitHub evidence, but the public Velclaw URL presented to users must be a first-party `*.velclaw.cfd` address. The Deploy page must not claim production success without provider-backed evidence.

`velclaw.cfd` is the only canonical Velclaw host. Preview URLs are Velclaw-owned hostnames under that domain.

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
- Canonical Plugins route: `/plugins`
- Canonical Skills route: `/skills`
- Canonical Deploy route: `/deploy`
- Canonical page naming: `Velclaw + function`
