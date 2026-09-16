# Velclaw Ecosystem Registry

This document is the registry for the Velclaw repositories being integrated with the canonical core.

The canonical core is `Velclaw/VELCLAW`. Source repositories remain intact and are not deleted by consolidation. Snapshot imports are isolated under explicit destination namespaces and sensitive files are excluded.

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
│   └── Velclaw/docs.velclaw.ai
│
├── Documentation Pages
│   └── zskbot/repo-docs-Velclaw
│
├── Deployment / release
│   ├── Velclaw/deploy-velclaw
│   └── zskbot/autoship-velclaw
│
├── Application surfaces
│   ├── zskbot/app-velclaw
│   ├── zskbot/velclaw-pages
│   └── zskbot/velclaw-browser
│
├── Agent systems
│   ├── Velclaw/velclaw-eve
│   └── zskbot/Velclaw
│
└── Reference
    └── Velclaw/Velclaw-velclaw-docs-ui-reference
```

## Repository classification

| Repository | Class | Integration target | Current assessment |
|---|---|---|---|
| `Velclaw/VELCLAW` | Core platform | Canonical application APIs, UI, deploy control | **CORE** |
| `Velclaw/Oauth` | Auth UI | OAuth authorization boundary | **CONSOLIDATE** |
| `Velclaw/docs.velclaw.ai` | Official docs | Product contracts and routes | **CONSOLIDATE** |
| `zskbot/repo-docs-Velclaw` | Docs pages | Documentation publishing | **CONSOLIDATE** |
| `Velclaw/deploy-velclaw` | Deploy surface | Deployment / hosting workflow | **CONSOLIDATE** |
| `zskbot/autoship-velclaw` | Release automation | Release / deploy lifecycle | **CONSOLIDATE** |
| `zskbot/app-velclaw` | App surface | Product UI/runtime | **CONSOLIDATE** |
| `zskbot/velclaw-pages` | Pages surface | Workspace / GitHub / agent bridge | **CONSOLIDATE** |
| `zskbot/velclaw-browser` | Browser subsystem | Browser / preview capabilities | **CONSOLIDATE** |
| `Velclaw/velclaw-eve` | Agent runtime | Agent capabilities / execution | **CONSOLIDATE** |
| `zskbot/Velclaw` | Legacy/core source | Historical source and candidate components | **CONSOLIDATE** |
| `Velclaw/Velclaw-velclaw-docs-ui-reference` | UI reference | Product visual reference | **CONSOLIDATE** |

## Integration contracts

Independent repositories communicate with the core through explicit interfaces:

1. **GitHub** — repository, branch, commit, PR, Actions and status integration.
2. **HTTP APIs** — stable versioned APIs for agent, deploy, workspace and OAuth operations.
3. **Webhooks** — GitHub events and deployment/CI state transitions.
4. **OAuth** — authorization-code/token/userinfo contracts; never substitute API keys for OAuth credentials.
5. **MCP / skills / plugins** — capability discovery and execution contracts.
6. **Artifacts** — build outputs, container images, logs and release metadata.
7. **Shared configuration** — namespaced environment variables and documented schemas; never shared secrets committed to source.

## Consolidation rules

- Preserve every source repository; do not delete them as part of consolidation.
- Never push migration output directly to `main`.
- Stage migration output on a dedicated branch and review it through a pull request.
- Exclude `users.json`, `.env`, `.env.*`, private keys and certificate material from snapshot imports.
- Do not import `.git` directories or nested gitlinks.
- Record the source repository and source commit in the migration manifest.
- Do not treat a snapshot import as full Git history preservation; history-preserving subtree migration is a separate operation.
