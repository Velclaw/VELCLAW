# Velclaw Ecosystem — Master Architecture & Project Registry

> **Purpose:** single reference for the Velclaw parent project, child products, repositories, deployment surfaces, integrations, and outstanding verification.  
> **Last reviewed:** 2026-10-12.  
> **Source of truth:** repository contents and connected GitHub/Render metadata checked during this review. A link or roadmap entry is not proof that a service is production-ready.

## 1. Executive summary

Velclaw is the umbrella AI-native software engineering ecosystem. The intended workflow is:

```text
VELCLAW (parent workspace / product shell)
  ├── Identity & OAuth boundary
  ├── VelCli (developer-facing AI coding workspace and runtime)
  ├── VelclawHost (hosting, domains, deployment control plane)
  ├── VelcliHub (templates and reusable resources; product area)
  ├── Plugins / MCP / Skills (extension layer)
  └── Velcli Build (related build-agent workspace/prototype)
          │
          ├── GitHub: repositories, branches, reviews, releases
          ├── AI providers: Gemini, Groq, OpenAI-compatible providers
          ├── Data: PostgreSQL; other stores only where explicitly configured
          └── Hosting / edge: Render and Cloudflare; Vercel appears in
              existing product/domain history and must be mapped per service
```

The projects are kept in separate repositories for now. This document consolidates the architecture and records how they should integrate; it does **not** merge their source code or claim that all integrations are already live.

## 2. Project and repository registry

| Role | Repository / resource | Known responsibility | Evidence / status |
|---|---|---|---|
| **Parent / canonical workspace** | [Velclaw/VELCLAW](https://github.com/Velclaw/VELCLAW) | Main AI-native workspace: agents, projects, code, builds, runtime, storage, GitHub and delivery workflow. | README checked. Canonical product domain declared there as `https://velclaw.dev`; DNS, OAuth routing and production paths still require live verification. |
| **Coding agent / developer workspace** | [Velclaw/VelCli](https://github.com/Velclaw/VelCli) · [velcli.dev](https://velcli.dev) | AI Agent, Plan Mode, workspace editor, projects/chat history, preview and integration with VelclawHost. | README checked. Some capabilities depend on deployment and database configuration; do not infer full production status from the UI or README. |
| **Hosting / control plane** | [Velclaw/VelclawHost](https://github.com/Velclaw/VelclawHost) · [velclaw.site](https://velclaw.site) | Hosting and deployment control plane, domain workflows, service health, deployment queue, docs and API. | README and recent commits checked. Render service is configured; newest GitHub commits were newer than the latest confirmed live deployment at review time. |
| **Build-agent workspace / related project** | [zskbot/Velcli-Build](https://github.com/zskbot/Velcli-Build) | Plan/Build/Review starter, shared agent contracts, health endpoint and CI foundation. | README checked. README explicitly says persistent PostgreSQL, provider adapters, sandbox execution, subagents, plugins/MCP, background tasks and deployment integration are roadmap items, not yet implemented in that starter. Account/repository relationship to the Velclaw organization should be treated as related, not assumed to be an official org repo. |
| **Website / brand surface** | [Velclaw/VELCLAW.COM](https://github.com/Velclaw/VELCLAW.COM) | Website surface referenced in the Render account. | Render services were found; repository README was not verified in this pass. Map production domain and intended role before changing routing. |
| **Core/legacy platform repository** | [Velclaw/repo-Velclaw](https://github.com/Velclaw/repo-Velclaw) | Additional core/operations services referenced by Render resources. | Several Render services point to this repository. Treat each as a separate service until its code, purpose and traffic are audited. |
| **Identity boundary** | [Velclaw/Oauth](https://github.com/Velclaw/Oauth) | Dedicated OAuth entry point, callbacks and session boundary, as documented by the parent README. | Mentioned by parent README; deployment, callback URLs and routing were explicitly not verified. |
| **Templates / extension areas** | VelcliHub, Plugins, MCP servers, Skills, Hooks | Reusable project templates and controlled extensions for agents. | Product areas / architecture targets. Do not represent each as a live standalone service until a repository, deployment and health check are identified. |

## 3. Deployment inventory (observed)

### Render

| Service | Repository | Service ID | Observed URL | Notes |
|---|---|---|---|---|
| `velclawhost` | `Velclaw/VelclawHost` | `srv-db2mqafavr4c73eljaa0` | [velclawhost.onrender.com](https://velclawhost.onrender.com) | Free plan, Singapore region, branch `main`, auto-deploy on commit. Latest deploy list checked during review showed `a93ee8b...` as `live`; commit `7cf1cc2...` (header hamburger menu) was newer and not yet shown as deployed. |
| `velcli` | `Velclaw/VelCli` | `srv-db40auqd0e5s73fbabog` | [velcli.onrender.com](https://velcli.onrender.com) | Free plan, Singapore region, branch `main`, auto-deploy on commit. Verify health and database configuration independently. |
| `velcli-build` | `zskbot/Velcli-Build` | `srv-db5ffqd9fdbs73cmdn5g` | [velcli-build.onrender.com](https://velcli-build.onrender.com) | Free plan, Singapore region, branch `main`, auto-deploy on commit. Starter project; do not assume roadmap items are implemented. |
| `velclaw-com-live` | `Velclaw/VELCLAW.COM` | `srv-db2lemmgekts73fdrvtg` | [velclaw-com-live.onrender.com](https://velclaw-com-live.onrender.com) | Separate service; map its intended production domain before routing changes. |
| `velclaw-com` | `Velclaw/VELCLAW.COM` | `srv-db2lcbk9v7es738hrvl0` | [velclaw-com.onrender.com](https://velclaw-com.onrender.com) | Separate service; do not assume it is interchangeable with `velclaw-com-live`. |
| `velclaw-core-v2` | `Velclaw/repo-Velclaw` | `srv-dak2tuh42hec73bqfdcg` | [velclaw-core-v2.onrender.com](https://velclaw-core-v2.onrender.com) | Separate service; inspect runtime and environment before assigning canonical traffic. |
| `velclaw-core` | `Velclaw/repo-Velclaw` | `srv-dak2thqfngtc7381rh9g` | [velclaw-core.onrender.com](https://velclaw-core.onrender.com) | Separate service; relationship to core-v2 needs explicit ownership/traffic mapping. |

Render service IDs and URLs are copied from connected Render metadata available during this review. A service being configured in Render does not itself prove the app's HTTP health, database connectivity, or custom-domain routing.

## 4. Domain and routing policy

Several domain names appear in the project history, so use explicit ownership rather than silently treating them as aliases.

| Domain | Intended role in current documentation | Required verification |
|---|---|---|
| `velclaw.dev` | Canonical parent workspace/product domain declared by `Velclaw/VELCLAW`. | DNS records, TLS, app routing, OAuth callback and API origin. |
| `velcli.dev` | VelCli product entry point. | DNS/TLS and which production service it targets. |
| `velclaw.site` | VelclawHost product/docs domain. | Cloudflare DNS, TLS, origin routing and whether `/docs` maps to the intended service. |
| `api.velclaw.site` | API/developer endpoint referenced by VelclawHost. | Reproduce and resolve the previously reported HTTP 403; inspect Cloudflare Access/WAF/Worker/origin rules before changing security policy. |
| `app.velclaw.site` | App subdomain documented by VelclawHost. | Treat as intended until DNS, TLS and live route are checked. |
| `velclawhost.onrender.com` | Render origin for VelclawHost. | Health endpoint and deployment SHA. |
| `velcli.onrender.com` | Render origin for VelCli. | Health endpoint, current commit and data persistence. |

**Routing rule:** Cloudflare should own public DNS/edge policy where configured; Render owns application runtime for the services listed above. Vercel is present in the project history, but must not be assumed to host the same service unless the domain/service mapping confirms it. Do not point multiple production domains at different app generations without a written route map.

## 5. Integration contracts

### 5.1 Identity and sessions
- Keep OAuth/identity as a clear trust boundary.
- The parent workspace, VelCli and VelclawHost should share identity only through documented session/token contracts, not by copying private session secrets between services.
- Register callbacks only after the exact production hostname, HTTPS, callback path and reverse-proxy behavior have been verified.
- Never store client secrets, OAuth secrets or access tokens in repository files, documentation, chat logs or browser-visible configuration.

### 5.2 GitHub and project lifecycle
- A project should map to an explicit repository, branch, commit SHA and deployment target.
- Expected workflow: task/issue → agent plan → permissioned edits → lint/typecheck/build/tests → branch/PR → review/merge → deployment → health check.
- Record deployment SHA and rollback target. Do not treat a commit being pushed as proof that production has updated.
- Use least-privilege GitHub permissions. Do not put PATs or private keys in source control.

### 5.3 AI provider layer
- Route model requests through a provider adapter in the server/runtime layer.
- Provider candidates mentioned in project context: Gemini, Groq and OpenAI-compatible APIs; use other providers only when configured.
- Model selection must be explicit and configurable. API keys stay in hosting environment secrets; logs must redact authorization headers, tokens, prompts containing secrets and environment values.
- A configured API key is not proof that a provider call works; verify with a safe health/smoke test.

### 5.4 Data and persistence
- PostgreSQL is the preferred durable store for users, settings, conversations, projects, agent runs, deployment metadata and audit records.
- Use migrations and a documented schema owner. Avoid two services independently applying conflicting migrations to the same database.
- Keep `DATABASE_URL` in Render/Supabase secret settings, never in Git or documentation.
- A health endpoint that only checks whether `DATABASE_URL` exists must not report that the database connection was verified.
- Do not assume MongoDB, Cloudflare D1 or object storage is active merely because it was discussed; list each only after a service/configuration is confirmed.

### 5.5 Hosting and deployment
- VelclawHost should act as the deployment/control-plane integration, not silently become the owner of every app's runtime.
- Each deploy record should include repository, branch, commit SHA, service ID, status, start/end timestamps and health result.
- Use queue/idempotency controls for repeated deployment requests; keep logs free of secrets.
- Cloudflare rules, Worker routes, DNS and origin access should be reviewed together before resolving 403/5xx incidents.

### 5.6 Agent execution safety
- Separate planning from execution. Plan Mode should be read-only unless explicitly designed otherwise.
- Shell, filesystem, Git, deployment, plugin and MCP tools must use per-tool permissions, audit trails and bounded execution.
- Run untrusted project code only in an isolated sandbox with resource/time limits; do not run arbitrary generated code in the control-plane process.
- Require approval for destructive operations, production changes, secret access and domain/DNS modifications.

## 6. Canonical responsibility boundaries

| Component | Owns | Should not own |
|---|---|---|
| VELCLAW parent | Main product experience, project orchestration, workspace UX and integration contracts | Duplicate independent implementations of every child service |
| VelCli | Developer workflow, agent interaction, editor/preview and project-facing runtime interface | DNS/registrar source of truth or uncontrolled production infrastructure changes |
| VelclawHost | Hosting/deployment control plane, domain workflows, health/deployment records | User-facing source projects or AI provider secrets exposed to clients |
| OAuth service | Identity provider callbacks, token/session boundary | Project source code and deployment execution |
| PostgreSQL | Durable relational records and migrations | Secret storage as plain text or transient logs |
| Cloudflare | Public DNS, edge policy, Worker/Access/WAF where configured | Application data ownership unless a specific Cloudflare storage service is intentionally adopted |
| Render | Runtime, build/deploy lifecycle and environment secrets for configured services | Product-level canonical project metadata unless explicitly stored there |

## 7. Branch strategy

Repository default branches and deployed branch mappings must be confirmed per repository. The following is the recommended convention, not a claim about every current repository:

- `main`: protected, releasable integration branch.
- `feat/<short-name>`: feature development.
- `fix/<short-name>`: targeted bug fixes.
- `docs/<short-name>`: documentation-only changes.
- `release/<version>`: optional release stabilization.
- Deploy production only from the intended branch and record the exact commit SHA.
- Avoid committing directly to production branches for risky changes; use PR review and automated checks.
- Keep service-specific configuration and environment secrets outside source control.

Current confirmed examples from Render metadata: VelclawHost, VelCli and Velcli-Build services are configured for `main`. Other branch mappings must be checked individually before being documented as fact.

## 8. Verification and operational checklist

Before declaring the ecosystem integrated or production-ready, verify every item with evidence:

- [ ] Enumerate all GitHub repositories under the Velclaw organization and related account; identify archived, duplicate and legacy projects.
- [ ] For each repository, record default branch, last commit, CI status, README, package/build commands and owner.
- [ ] Map every Render service to one repository, branch, production domain, health path and environment configuration.
- [ ] Check current deployment SHA and state for each service; redeploy only after build/test review.
- [ ] Check `/health` or the documented health route and verify HTTP status from the public URL.
- [ ] Verify PostgreSQL connectivity with a real non-destructive query; do not expose connection strings.
- [ ] Reproduce `api.velclaw.site` 403 and identify whether the response originates from Cloudflare Access/WAF/Worker or the application.
- [ ] Verify DNS, TLS, redirects, canonical host and reverse-proxy paths for each domain.
- [ ] Verify OAuth callback/session flow end-to-end after deployment.
- [ ] Test GitHub branch/PR workflow, deployment status propagation and rollback.
- [ ] Audit secret exposure, access rules, agent tool permissions and sandbox isolation.
- [ ] Update this registry whenever a repository, service, branch, domain or database ownership changes.

## 9. Known gaps at this review

1. The latest VelclawHost GitHub commit observed was `7cf1cc2d5e3669596ccb898912365c122b6e7663` (hamburger menu). The Render deploy list checked in the same review still showed `a93ee8b...` as live. Production therefore was **not yet confirmed to contain the latest docs/menu changes**.
2. The previously reported `api.velclaw.site` HTTP 403 has not been diagnosed by this document. Cloudflare configuration and origin response must be inspected.
3. OAuth deployment and callback routing are not verified by the parent README.
4. Service/domain mappings for VELCLAW.COM and the two core services require an owner-approved route map.
5. The complete set of organization repositories, branches, CI runs, database resources and Cloudflare Workers has not yet been exhaustively enumerated. This document is a consolidated baseline, not a claim of exhaustive live infrastructure discovery.
6. Features listed as roadmap in Velcli-Build are explicitly not considered implemented.

## 10. Related links

- [Parent workspace — VELCLAW](https://github.com/Velclaw/VELCLAW)
- [VelCli](https://github.com/Velclaw/VelCli)
- [VelclawHost](https://github.com/Velclaw/VelclawHost)
- [Velcli Build](https://github.com/zskbot/Velcli-Build)
- [VELCLAW.COM](https://github.com/Velclaw/VELCLAW.COM)
- [repo-Velclaw](https://github.com/Velclaw/repo-Velclaw)
- [VelclawHost Render service](https://dashboard.render.com/web/srv-db2mqafavr4c73eljaa0)
- [VelCli Render service](https://dashboard.render.com/web/srv-db40auqd0e5s73fbabog)
- [Velcli-Build Render service](https://dashboard.render.com/web/srv-db5ffqd9fdbs73cmdn5g)

---
This file is maintained as the ecosystem-level architecture registry. Update the status columns from live API/CI/deployment evidence rather than from assumptions.
