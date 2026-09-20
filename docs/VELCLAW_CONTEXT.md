# Velclaw Project Context

> Canonical project reference. Update this document when a project-level fact changes.

## Identity
- Project: **Velclaw** / `velclaw`
- Current canonical GitHub repository: **`Velclaw/VELCLAW`**
- Canonical default branch: `main`
- Current public domain: **deployment-configured; `velclaw.cfd` is legacy/transition only**

## Ecosystem structure
`Velclaw/VELCLAW` is the current canonical core repository. The Velclaw ecosystem is intentionally multi-repository. Independent repositories remain independently deployable and integrate through explicit APIs, webhooks, OAuth, GitHub, MCP/skills/plugins, artifacts and documented configuration contracts.

### Core ecosystem members
- **Auth:** `Velclaw/Oauth`
- **Official Docs:** `Velclaw/velclaw.cfd/docs`
- **Docs Pages:** `zskbot/repo-docs-velclaw`
- **Deploy:** `Velclaw/deploy-velclaw`
- **Release automation:** `zskbot/Autoship`, `zskbot/autoship-velclaw`
- **IDE:** `zskbot/AgentsIDE`, `zskbot/Zvelclaw`, `zskbot/Zvelclaw-CLI`, `zskbot/velclaw-pages`, `zskbot/velclaw-browser`
- **Agents:** `Velclaw/zvelclaw-agent`, `Velclaw/velclaw-eve`
- **AI/developer surfaces:** `zskbot/ZsKai`, `zskbot/agent-skills`
- **Review:** `zskbot/ChatGPT-CodeReview`

Repositories that merely share an owner or name are not automatically ecosystem members; membership requires verified purpose or integration.

## Domain architecture
The long-term namespace is split by role rather than duplicated websites:

- `velclaw.cfd` — brand / corporate canonical identity.
- `velclaw.cfd` — AI, agents, models and intelligence surfaces.
- `velclaw.cfd` — developer platform, docs, SDK and CLI.
- `velclaw.cfd` — main user-facing application.
- `velclaw.cfd` — platform, API, gateway and runtime infrastructure.

`velclaw.cfd` is a legacy/transition domain. It must not be introduced as a new dependency and must not be the hard-coded OAuth issuer, metadata base, sitemap host, robots host or CORS authority.

The application reads domain identity from environment variables such as `VELCLAW_PUBLIC_ORIGIN`, `VELCLAW_OAUTH_ISSUER`, `VELCLAW_APP_ORIGIN`, `VELCLAW_API_ORIGIN`, `VELCLAW_DOCS_ORIGIN` and `VELCLAW_ALLOWED_ORIGINS`.

## Core architecture
Velclaw is an AI-native software workspace for agents, code, builds, runtime, storage, and user services.

Canonical delivery pipeline:

**Task → Skill selection → Executor → Review → Gate → GitHub API → PR → Deployment evidence**

Independent ecosystem services plug into this pipeline; they do not silently create competing execution pipelines.

## Ecosystem integration contracts
1. **GitHub:** repositories, branches, commits, PRs, Actions and checks.
2. **HTTP APIs:** versioned service contracts for workspace, agent, deployment and platform operations.
3. **Webhooks:** CI, GitHub and deployment state transitions.
4. **OAuth:** authorization-code, token and userinfo contracts. OAuth credentials are not API keys.
5. **MCP / Skills / Plugins:** capability discovery and controlled execution.
6. **Artifacts:** builds, images, logs and release evidence.
7. **Configuration:** namespaced environment variables and documented schemas; no secrets committed to source.

## Working rules
1. Inspect the canonical repository before changing anything.
2. Extend existing functionality instead of creating competing systems.
3. Validate implementation with actual repository/build/CI evidence.
4. Never claim a check passes without evidence.
5. Keep API keys and secrets in environment/secrets configuration; never hard-code them.
6. Treat domain names as configuration and identity boundaries, not infrastructure dependencies.
7. Normal GitHub flow: branch → commit → CI/check → PR → review → merge.
8. Do not merge, delete, or destroy project data without explicit basis.
9. Do not claim production deployment unless provider-backed evidence confirms it.
