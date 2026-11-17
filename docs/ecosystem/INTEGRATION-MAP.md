# Velclaw Ecosystem — Integration Map

## Goal

Use **Velclaw** as the product/workspace hub while keeping each repository independently deployable. Repositories are connected through explicit APIs, identity, webhooks, and deployment adapters—not by copying their source trees together.

## Current inventory

| Project | Repository | Intended responsibility | Current integration status |
|---|---|---|---|
| Core workspace | [Velclaw/VELCLAW](https://github.com/Velclaw/VELCLAW) | Product UI, project workspace, agent workflow, build/deploy UX | Hub candidate; runtime integration not verified |
| Identity | [Velclaw/Oauth](https://github.com/Velclaw/Oauth) | OAuth entry point and session boundary | Repository referenced by core README; deployed callback/domain not verified |
| Hosting control plane | [Velclaw/VelclawHost](https://github.com/Velclaw/VelclawHost) | Hosting, domain and infrastructure management APIs | Live Render service reported at https://velclawhost.onrender.com; health endpoint is defined in source |
| AI sandbox design | [zskbot/CodeXsanBox](https://github.com/zskbot/CodeXsanBox) | Orchestration, tool gateway and isolated coding runtime design | Design/source review required before wiring |
| AI coding workspace | [zskbot/bbit](https://github.com/zskbot/bbit) | Browser IDE, model routing, GitHub workflow and preview | Candidate product module; deployment/API contract not verified |
| Riks AI | [zskbot/riks](https://github.com/zskbot/riks) | Coding assistant and local-model/tool adapters | Prototype per its README; service contract not verified |
| Documentation | [zskbot/SandboxCode](https://github.com/zskbot/SandboxCode) | User/developer documentation | Candidate documentation surface; deployment not verified |
| Coding-agent template | [zskbot/SandboxCode.com](https://github.com/zskbot/SandboxCode.com) | Multi-agent coding template | Template/fork lineage must be reviewed before production reuse |
| Coding-agent platform | [zskbot/coding-agent-platform](https://github.com/zskbot/coding-agent-platform) | Multi-agent execution template | README currently matches a template; treat as a candidate, not a production service |

This is a curated first-party/candidate inventory, not a claim that every repository is already integrated. Other repositories on the account may be upstream forks, mirrors, experiments, or unrelated utilities; do not automatically wire them into production.

## Proposed integration topology

```text
User
  |
  v
Velclaw Workspace (VELCLAW)
  |---- Identity adapter ------> Velclaw/Oauth
  |---- GitHub adapter --------> authorized repositories / PRs / webhooks
  |---- Agent gateway ---------> CodeXsanBox runtime (after isolation review)
  |---- AI workspace adapter --> bbit / Riks (only after API contracts exist)
  |---- Hosting adapter -------> VelclawHost control-plane API
  |---- Documentation --------> SandboxCode docs
  |
  v
PostgreSQL / durable job state / audit events
```

## Integration rules

1. **One identity boundary:** use the OAuth service for sign-in; do not create competing session stores in each product.
2. **One project identity:** each connected repository/workspace gets a stable internal project ID plus its GitHub owner/repository and default branch.
3. **Explicit service contracts:** each runtime/service adapter must define its base URL, authentication method, timeout, health endpoint and API version. Never infer a production URL from a repository name.
4. **Secrets stay in deployment secret stores:** no OAuth secrets, database URLs, access tokens, or API keys in Git, JSON manifests, client bundles, logs, or this document.
5. **Sandbox isolation:** do not expose a shell or Docker socket directly to the public web app. Use a separately isolated worker with scoped credentials, resource limits and an allowlisted network policy.
6. **Least privilege:** grant GitHub access only to selected repositories and permissions required for the current operation.
7. **No destructive migration:** do not merge/delete repositories, reset databases, or change DNS until dependencies and rollback paths are verified.
8. **Observable integrations:** record connection status, last health check, last successful sync, error summary and deployment commit for each adapter.

## Implementation sequence

- [x] Create an initial repository inventory and integration boundary.
- [x] Set `https://velclaw.dev` as the single canonical domain in application defaults and documentation. DNS, HTTPS, OAuth callbacks, and any path/reverse-proxy routing still require production verification; do not assume they are configured.
- [ ] Verify the OAuth repository's deployment, callback URLs, cookie/session domain and logout behavior.
- [ ] Add a read-only GitHub repository registry and per-repository connection status to the core workspace.
- [ ] Define and test a versioned VelclawHost API client; health checks must use the real `GET /api/v1/health` endpoint.
- [ ] Define an authenticated job contract between the core workspace and isolated sandbox worker.
- [ ] Add adapter contracts for bbit/Riks only if those apps expose supported APIs; otherwise keep them as separate products linked from the hub.
- [ ] Add end-to-end checks for sign-in → select repository → plan task → sandbox run → build/test → publish → audit log.
- [ ] Verify each production deployment and database connection without opening unnecessary network access.

## Release gate

A module is considered **connected** only after its configuration is present in the secret store, its authenticated API contract is tested, its health status is visible, and a real end-to-end test passes. A repository entry alone is not a live integration.
