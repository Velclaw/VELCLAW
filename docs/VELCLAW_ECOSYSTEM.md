# Velclaw Ecosystem Registry

This document is the registry for the independent repositories that form the Velclaw ecosystem.

The ecosystem is intentionally multi-repository. `Velclaw/VELCLAW` is the current canonical core platform; independent repositories remain separate products, tools, runtimes, or supporting surfaces and are integrated through explicit contracts.

## Canonical structure

```text
VELCLAW ECOSYSTEM
│
├── Core
│   └── Velclaw/VELCLAW
│
├── Authentication
│   └── Velclaw/Oauth
│
├── Official documentation
│   └── Velclaw/velclaw.cfd/docs
│
├── Documentation Pages companion
│   └── zskbot/repo-docs-velclaw
│
├── Deployment / release
│   ├── zskbot/Autoship
│   ├── zskbot/autoship-velclaw
│   └── Velclaw/deploy-velclaw
│
├── IDE / developer tooling
│   ├── zskbot/AgentsIDE
│   ├── zskbot/Zvelclaw
│   ├── Velclaw/zvelclaw-agent
│   ├── zskbot/Zvelclaw-CLI
│   ├── zskbot/velclaw-pages
│   └── zskbot/velclaw-browser
│
├── AI / agent systems
│   ├── zskbot/ZsKai
│   ├── Velclaw/velclaw-eve
│   ├── zskbot/agent-skills
│   └── zskbot/agentskills
│
└── Additional ecosystem surfaces
    ├── zskbot/app-velclaw
    ├── Velclaw/velclaw-eve
    ├── Velclaw/Velclaw-velclaw-docs-ui-reference
    └── zskbot/ChatGPT-CodeReview
```

## Repository classification

| Repository | Class | Integration target | Current assessment |
|---|---|---|---|
| `Velclaw/VELCLAW` | Core platform | Canonical application APIs, UI, deploy control | **CORE** |
| `Velclaw/Oauth` | Auth UI | OAuth authorization endpoints / callbacks | **INTEGRATE** |
| `Velclaw/velclaw.cfd/docs` | Official docs | Core product contracts and routes | **INTEGRATE** |
| `zskbot/repo-docs-velclaw` | Docs Pages | Documentation/page publishing | **INTEGRATE** |
| `zskbot/Autoship` | Release automation | GitHub + release lifecycle | **INTEGRATE** |
| `zskbot/autoship-velclaw` | Velclaw Autoship variant | Velclaw release/deploy workflow | **INTEGRATE** |
| `Velclaw/deploy-velclaw` | Deploy surface | Deployment API / hosting workflow | **INTEGRATE** |
| `zskbot/AgentsIDE` | IDE | Core workspace / agent / Git workflow | **INTEGRATE** |
| `zskbot/Zvelclaw` | CLI | Local task, gate, GitHub, deploy control | **INTEGRATE** |
| `Velclaw/zvelclaw-agent` | Agent | Agent execution/control plane | **INTEGRATE** |
| `zskbot/Zvelclaw-CLI` | CLI variant | Developer automation | **REVIEW** |
| `zskbot/velclaw-pages` | Standalone IDE/pages | Workspace, GitHub, agent bridge | **INTEGRATE** |
| `zskbot/velclaw-browser` | Browser subsystem | Browser/build/preview capabilities | **INTEGRATE** |
| `zskbot/ZsKai` | AI terminal/app | AI + developer tooling | **REVIEW/INTEGRATE** |
| `Velclaw/velclaw-eve` | Agent runtime | Agent capabilities / deployment | **REVIEW** |
| `zskbot/agent-skills` | Skills | Agent capability distribution | **INTEGRATE** |
| `zskbot/agentskills` | Skills surface | Agent capability distribution | **REVIEW** |
| `zskbot/app-velclaw` | App surface | Core product UI/runtime | **REVIEW** |
| `Velclaw/Velclaw-velclaw-docs-ui-reference` | UI reference | Docs/product visual reference | **REFERENCE** |
| `zskbot/ChatGPT-CodeReview` | Review tooling | PR/code review | **INTEGRATE** |

## Verified repository facts

### Core

`Velclaw/VELCLAW` is the canonical core platform repository. Its README and product surfaces cover agents, projects, code, builds, runtime, storage, GitHub, review and deployment. Historical references to former repository names are treated as stale identity references and are removed from active contracts.

### AgentsIDE

`zskbot/AgentsIDE` describes an AI-native coding workspace with the loop `Workspace → Agent → Edit → Test → Review → Git → Deploy`. It is therefore an IDE/developer-surface companion rather than the core platform itself.

### Zvelclaw

`zskbot/Zvelclaw` is an AI-native developer CLI for task execution, workspace automation, review gates, GitHub integration and deployment workflows. Its deployment model is GitHub Actions based and it requires a GitHub token at runtime.

### Autoship

`zskbot/autoship-velclaw` is a release automation CLI with AI release analysis, changeset generation, CI waiting and automated PR/version-package merging. It supports multiple repositories and is suitable as a release automation adapter for the ecosystem.

### velclaw-pages

`zskbot/velclaw-pages` is a standalone mobile-first codebase/agent IDE. Its documented API surface includes workspace status/tree/file APIs, agent chat, Git status/branch/commit/PR operations and CI status. It explicitly keeps write credentials server-side.

### ZsKai

`zskbot/ZsKai` currently identifies its product as Watson Shell, an AI-enabled terminal application with cloud sync, 2FA, syntax highlighting and project tooling. It should not be relabeled as the Velclaw core without an explicit product decision; treat it as an ecosystem AI/developer surface.

### OAuth

`Velclaw/Oauth` is a separate OAuth UI repository. Its integration contract belongs at the authentication boundary; it must not be merged into the core application merely because it provides login UI.

## Integration contracts

Independent repositories should communicate with the core through explicit interfaces:

1. **GitHub** — repository, branch, commit, PR, Actions and status integration.
2. **HTTP APIs** — stable versioned APIs for agent, deploy, workspace and OAuth operations.
3. **Webhooks** — GitHub events and deployment/CI state transitions.
4. **OAuth** — authorization-code/token/userinfo contracts; never substitute API keys for OAuth credentials.
5. **MCP / skills / plugins** — capability discovery and execution contracts.
6. **Artifacts** — build outputs, container images, logs and release metadata.
7. **Shared configuration** — namespaced environment variables and documented schemas; never shared secrets committed to source.

## Rules

- Do not copy independent repositories into the core as nested Git repositories or gitlinks unless there is a deliberate vendoring decision.
- Do not silently rename an independent repository because its name contains Velclaw.
- Do not treat every repository owned by `zskbot` as a Velclaw repository. Ownership is not sufficient evidence of ecosystem membership.
- A repository becomes an ecosystem member when its purpose, code, deployment, documentation or integration contract is verified.
- `Velclaw/VELCLAW` is the only canonical core platform repository.
- `Velclaw/velclaw.cfd/docs` is the canonical documentation repository.
- `zskbot/repo-docs-velclaw` remains a secondary Docs Pages repository.
- Product URLs should use the canonical Velclaw domain rather than infrastructure-generated hostnames where applicable.

## Audit status

This registry is the initial verified inventory from repository discovery. It deliberately distinguishes **confirmed ecosystem candidates** from unrelated repositories that merely share a name or account owner. The next audit stage should inspect source imports, package dependencies, workflow references, webhooks, deployment configuration and environment-variable contracts for every repository marked `INTEGRATE` or `REVIEW`.


## Audit extension: additional repositories verified on 2026-09-21

The following repositories were discovered under the `zskbot` and `Velclaw` owners and inspected for direct relevance to the canonical core. Ownership alone is not sufficient for membership.

| Repository | Verified role | Status for core | Intended reuse |
|---|---|---|---|
| `zskbot/VelclawHost` | Hosting/control plane: runtime, DNS, routing, TLS, health, deployment domains | **INTEGRATE** | Canonical Deploy/Observe adapter and evidence source. |
| `zskbot/git-worktree-runner` | Parallel Git worktree lifecycle for AI agents | **INTEGRATE** | Isolated task/workspace adapter; do not vendor wholesale. |
| `zskbot/code-ollama` | Local Ollama coding agent with MCP, skills, memory and sessions | **INTEGRATE** | Local-agent provider adapter. |
| `zskbot/postgres-mcp` | PostgreSQL health/tuning/query-plan/safe-SQL MCP server | **INTEGRATE** | Database MCP capability with explicit read/write/approval scope. |
| `Velclaw/VelCat` | Velclaw ecosystem UI/tooling surface | **REVIEW** | Reuse only verified UX or operational capabilities after license/contract review. |
| `Velclaw/Velcat-pro` | Deployment/work-management dashboard patterns | **REVIEW** | UI and deployment-flow reference; do not duplicate the canonical Deploy surface. |
| `Velclaw/agent-browser` | Browser automation/agent tooling | **REVIEW** | Preview/browser capability adapter if contracts are stable. |
| `zskbot/smolagents` | Agent framework/reference | **REVIEW** | Architecture reference only unless a concrete adapter contract is approved. |
| `zskbot/compose-cli` | Container/developer tooling | **REVIEW** | Reference for local/runtime workflows; no direct product dependency without contract. |
| `zskbot/spec-kit` | Specification-driven development tooling | **REVIEW** | Reference for task/spec workflow and project templates. |
| `zskbot/dashboard-cli` | Developer dashboard CLI | **REVIEW** | CLI UX/operations reference. |
| `zskbot/agent-zskbot` | Agent implementation | **REVIEW** | Agent/runtime reference; verify execution isolation before reuse. |
| `zskbot/skills` | Skill/tooling collection | **REVIEW** | Capability reference; canonical distribution remains the Velclaw skill contract. |
| `zskbot/docs-web` | Documentation/web surface | **REVIEW** | Content/navigation reference; canonical docs route remains in Velclaw core. |
| `zskbot/sandboxcode-docs` | Sandbox/developer documentation | **REVIEW** | CI/CD and deployment documentation patterns only. |
| `zskbot/openai-cli` | CLI/model interaction tooling | **REVIEW** | Provider/CLI reference; use the existing Velclaw provider boundary. |

### Explicitly excluded from automatic integration

Large upstream mirrors, unrelated experiments, generic infrastructure forks, and repositories whose only evidence is owner/name similarity remain **REFERENCE or EXCLUDED** until a concrete Velclaw contract is identified. Examples discovered during the owner-wide audit include generic Git/GitHub/VS Code/Prometheus/Postgres/Docker-related mirrors and unrelated personal projects.

No repository in this audit should be copied into `Velclaw/VELCLAW` as a nested Git repository or gitlink. Reuse is contract-first: API, webhook, OAuth, MCP/skills, artifact, CLI or provider adapter.

### Integration readiness gate

The next implementation pass must verify source imports, package dependencies, workflow references, webhooks, deployment configuration and environment-variable contracts for each repository marked **INTEGRATE** or **REVIEW**. The integration-contract document is now the normative boundary for that audit.

Readiness states:

- **DISCOVERED** — repository found and relevant by purpose.
- **VERIFIED** — source/configuration inspected and capability confirmed.
- **CONTRACTED** — canonical adapter boundary documented.
- **IMPLEMENTED** — core adapter/UI integration exists.
- **VALIDATED** — type-check/build/tests and runtime evidence pass.

No repository may be labeled IMPLEMENTED or VALIDATED based only on its README.

### Current canonical integration set

For implementation planning, the highest-confidence set is now:

1. Core: `Velclaw/VELCLAW`
2. Identity: `Velclaw/Oauth`
3. Docs: `zskbot/repo-docs-velclaw` + core `/docs`
4. Deployment/control plane: `zskbot/VelclawHost` + `Velclaw/deploy-velclaw`
5. Release automation: `zskbot/Autoship` + `zskbot/autoship-velclaw`
6. Workspace/IDE: `zskbot/AgentsIDE` + `zskbot/velclaw-pages`
7. Agent runtime: `Velclaw/zvelclaw-agent` + `Velclaw/velclaw-eve`
8. CLI/control: `zskbot/Zvelclaw`
9. Agent capabilities: `zskbot/agent-skills` + `zskbot/agentskills`
10. Review: `zskbot/ChatGPT-CodeReview`
11. Isolation: `zskbot/git-worktree-runner`
12. Local AI: `zskbot/code-ollama`
13. Database MCP: `zskbot/postgres-mcp`

The UI must represent these as **capabilities inside one lifecycle**, not as separate competing products or dashboards.
