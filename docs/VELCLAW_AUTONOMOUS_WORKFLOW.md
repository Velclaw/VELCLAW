# Velclaw Autonomous Delivery Workflow

## Purpose

Velclaw uses a continuous implementation loop. After each completed report, the next actionable step starts automatically; no additional user confirmation is required.

## Canonical scope

- Primary repository: `Velclaw/Velclaw`
- Default branch: `main`
- Production product domain: `https://velclaw.cfd`
- Supporting docs repository: `Velclaw/velclaw.cfd/docs`

## Execution loop

1. **Audit** — inspect repository state, recent commits, CI, deployment state, routes, integrations, and known blockers.
2. **Plan the smallest useful change** — choose the highest-priority actionable defect or missing capability.
3. **Implement** — modify the canonical repository directly. Avoid duplicate deployment systems when an existing subsystem can be extended.
4. **Validate** — run the strongest available checks: type-check, runtime validation, lint, format check, tests, production build, and Docker build.
5. **Commit** — record the change with a focused commit message.
6. **CI verification** — inspect the resulting GitHub Actions run and fix failures automatically.
7. **Deploy** — use an available free/self-hosted runtime path; do not claim production success until the deployed runtime responds successfully.
8. **Runtime verification** — verify HTTP health, critical routes, API behavior, logs, and deployment state.
9. **Security/configuration audit** — verify secrets are not committed, production configuration is explicit, and privileged runtime components are isolated.
10. **Documentation synchronization** — update Velclaw documentation and route maps when behavior changes.
11. **Product QA** — verify canonical routes, branding, navigation, authentication, repository workflow, AI integration, deploy workflow, and error handling.
12. **Repeat** — select the next highest-priority actionable item and continue without waiting for another prompt.

## Priority policy

### P0 — must work

- Application starts and serves HTTP.
- Production build passes.
- Docker image builds.
- CI authoritative checks pass.
- Deployment runtime is reachable.
- Core authentication/session behavior is safe.
- Webhook/deploy execution cannot expose credentials or unrestricted host access.

### P1 — required product functionality

- Repository import and inspection.
- Tasks/agents execution.
- Build/review/fix loop.
- Deploy engine and deployment status.
- Logs and rollback.
- Velclaw AI OpenAI-compatible integration.
- API keys and secrets handling.
- MCP, plugins, and skills surfaces.
- VelclawHub and docs navigation.

### P2 — product hardening

- Observability and structured audit logs.
- Rate limits and abuse controls.
- Better failure recovery and retry policies.
- Backup/restore procedures.
- Performance and accessibility QA.
- Documentation completeness.

## Autonomous error loop

When a check fails:

`capture failure → identify exact stage/file → implement fix → commit → rerun validation → inspect result → repeat`

A failure is not considered resolved merely because code was changed. It is resolved only when the relevant check passes.

## Reporting contract

Every progress report contains only:

- **Đã làm** — concrete changes and verified results.
- **Bước tiếp theo** — the next action that is already being started automatically.
- **Còn thiếu / blocker** — only real blockers.
- **Bổ sung** — useful improvements that were implemented rather than merely proposed.

Never claim a deployment is production-ready based only on source code, a commit, or a created service. Production status requires successful runtime verification.
