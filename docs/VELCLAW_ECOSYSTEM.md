# Velclaw Ecosystem Registry

This document is the registry for the independent repositories that form the Velclaw ecosystem.

The ecosystem is intentionally multi-repository. `Velclaw/repo-Velclaw` is the current core platform; independent repositories remain separate products, tools, runtimes, or supporting surfaces and are integrated through explicit contracts.

## Canonical structure

```text
VELCLAW ECOSYSTEM
│
├── Core
│   └── Velclaw/repo-Velclaw
│
├── Authentication
│   └── Velclaw/Oauth
│
├── Official documentation
│   └── Velclaw/docs.velclaw.ai
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
| `Velclaw/repo-Velclaw` | Core platform | Canonical application APIs, UI, deploy control | **CORE** |
| `Velclaw/Oauth` | Auth UI | OAuth authorization endpoints / callbacks | **INTEGRATE** |
| `Velclaw/docs.velclaw.ai` | Official docs | Core product contracts and routes | **INTEGRATE** |
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

`Velclaw/repo-Velclaw` describes itself as an AI-native software workspace covering agents, projects, code, builds, runtime, storage, GitHub, review and deployment. Its README also defines the canonical product surface around `velclaw.cfd`. The README currently contains historical references to `Velclaw/Velclaw`; these must be treated as stale repository names and replaced during documentation cleanup.

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
- `Velclaw/repo-Velclaw` is the only canonical core platform repository.
- `Velclaw/docs.velclaw.ai` is the canonical documentation repository.
- `zskbot/repo-docs-velclaw` remains a secondary Docs Pages repository.
- Product URLs should use the canonical Velclaw domain rather than infrastructure-generated hostnames where applicable.

## Audit status

This registry is the initial verified inventory from repository discovery. It deliberately distinguishes **confirmed ecosystem candidates** from unrelated repositories that merely share a name or account owner. The next audit stage should inspect source imports, package dependencies, workflow references, webhooks, deployment configuration and environment-variable contracts for every repository marked `INTEGRATE` or `REVIEW`.
