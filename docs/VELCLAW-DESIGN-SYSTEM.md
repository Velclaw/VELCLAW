# Velclaw Design System

## Product model
Velclaw is an AI-native software lifecycle workspace. The UI is organized around three verbs: **Build → Run → Understand**.

## Sitemap
- Home
- Console: Dashboard, Workspace, Projects, Agents, Code Space, Environments, Deployments, Logs, Settings
- Platform: Architecture, Runtime, Workspace, Project Model, Agent Model
- Build: Code Space, Repositories, Branches, Packages, Environments
- Automate: Workflows, Jobs, Triggers, Schedules
- Deploy: Builds, Deployments, Releases, Rollbacks
- Integrate: API, SDK, Webhooks, Integrations
- Secure: Authentication, Access, Secrets, Audit
- Observe: Logs, Metrics, Events, Diagnostics
- Docs: Start, Guides, Tutorials, Concepts, Reference
- Developers: CLI, API Reference, SDK Reference, Extensions, Examples
- Community: Discussions, Contributing, Extensions, Changelog

## Foundation
### Brand
- Primary mark: minimal geometric V.
- V-Core: primary brand mark.
- V-Motion: runtime/loading state.
- V-Mono: terminal/CLI mark.
- Do not use literal wolf artwork as the primary identity.

### Tokens
- Background: #08090B
- Surface: #0F1115
- Surface elevated: #151820
- Border: #262A33
- Text primary: #F4F6F8
- Text secondary: #A7ADB8
- Text muted: #6D7480
- Accent: #C7FF4A
- Success: #5BE39B
- Warning: #FFC857
- Danger: #FF6B6B
- Info: #72B7FF

### Typography
- UI/display: Inter or Geist
- Code: JetBrains Mono
- Display 48–72px; H1 36–48px; H2 28–32px; H3 20–24px; body 14–16px; caption 12–13px; code 12–14px.

### Layout
- Desktop max content width: 1440px.
- Sidebar: 240px.
- Page gutters: 32px desktop, 20px mobile.
- Base spacing unit: 4px.
- Radius: 10px controls, 14px cards, 18px panels.
- Responsive breakpoints: 640 / 768 / 1024 / 1280 / 1536.

### Motion
- Fast UI transitions: 120–180ms.
- Panels/modals: 180–240ms.
- Runtime status transitions may use subtle 800–1200ms loops.
- Always respect prefers-reduced-motion.

## Core components
Navigation, TopBar, Sidebar, Breadcrumb, Tabs, CommandPalette, Button, Input, Select, Combobox, Toggle, Card, DataTable, CodeBlock, Terminal, LogViewer, DiffViewer, StatusIndicator, Badge, Metric, AgentCard, WorkflowNode, DeploymentCard, ActivityStream, Modal, Drawer, Toast, Skeleton, EmptyState, ErrorState.

## Core screen contracts
- Home: explain product, establish V identity, route users into Build/Run/Docs.
- Docs: searchable technical knowledge with persistent section navigation.
- Console: workspace health and recent activity at a glance.
- Project: code, agents, automations, deployments and settings in one project context.
- Agent: identity, runtime, capabilities, current execution and activity.
- Code Space: file tree, editor, terminal and preview.
- Workflow: graph-first orchestration with execution state.
- Deployment: release status, environment, logs, rollback.
- API: endpoint explorer, authentication, request/response examples.

## System states
Every major resource must define loading, empty, error, disabled, permission-denied and success states. Avoid decorative states that hide actionable diagnostics.

## Accessibility
Keyboard-first navigation, visible focus, semantic landmarks, accessible names, minimum AA contrast, reduced motion, and status announcements for asynchronous runtime changes.


## Ecosystem-derived UX architecture (audit: 2026-09-21)

This section translates verified capabilities from the Velclaw ecosystem repositories into **contracts for the canonical core UI**. Repositories remain independently deployable; the core consumes capabilities through adapters, APIs, webhooks, OAuth, MCP/skills and artifacts. Do not vendor unrelated repositories into the core.

### 1. Source-to-capability matrix

| Source repository | Verified capability | Canonical Velclaw surface | UX contract |
| --- | --- | --- | --- |
| `Velclaw/Oauth` | OAuth identity boundary | Secure → Authentication | Sign-in, consent, callback and session states are explicit; never expose provider secrets in UI. |
| `zskbot/repo-docs-velclaw` | Search, sidebar, TOC, code copy, responsive docs shell | Docs | Preserve persistent section navigation, keyboard search, copyable code and mobile drawer behavior. |
| `zskbot/Autoship` | CI/CD project + pipeline control plane, isolated runner model, deployment adapters | Automate + Deploy | Show pipeline stages, runner trust boundary, artifact readiness, healthcheck and deployment evidence as separate states. |
| `zskbot/autoship-velclaw` | Velclaw deployment console and Vercel adapter | Deploy | Deployment card must distinguish preview URL, production URL, provider dashboard and evidence status. |
| `Velclaw/deploy-velclaw` | Deployment surface | Deploy | Keep deployment orchestration behind the canonical Deploy contract; no competing task/executor pipeline. |
| `VelclawHost` | Runtime/control plane, DNS, routing, TLS, health and domain lifecycle | Deploy + Observe | Domain, routing, certificate and runtime states must be independently observable; never equate page availability with deployment success. |
| `zskbot/AgentsIDE` | Workspace → Agent → Edit → Test → Review → Git → Deploy | Workspace + Code Space | The primary workspace must keep task context, editor, agent, test and source-control actions in one project context. |
| `zskbot/Zvelclaw` | Deterministic CLI task/gate/GitHub/deploy workflow | Developers → CLI | Surface CLI parity for task, doctor, gate, merge, deploy and config operations where applicable. |
| `Velclaw/zvelclaw-agent` | IDE workflow Understand → Plan → Review → Apply → Build → Fix | Agent + Code Space | Agent execution must expose plan, review, apply, build and fix as auditable states, not one opaque spinner. |
| `zskbot/velclaw-pages` | File tree, editor, agent bridge, Git status/branch/commit/PR, CI status | Code Space | Use file tree + editor + terminal/agent + Source Control panels; keep write credentials server-side. |
| `zskbot/velclaw-browser` | Browser/build/preview subsystem | Code Space + Preview | Treat preview as a first-class runtime surface with explicit loading, ready, failed and disconnected states. |
| `zskbot/ZsKai` | Terminal, project tree, syntax highlighting, analysis panel, session/export patterns | Code Space + Observe | Reuse interaction patterns for terminal analysis and diagnostics only; do not relabel the product as Velclaw core. |
| `zskbot/agent-skills` | Progressive-disclosure skills and Next/React/web-design guidance | Agent + Developers | Skill discovery should be lightweight; activation loads detailed instructions only when matched. |
| `zskbot/agentskills` | Portable SKILL.md capability format | Agent + Integrate | Represent skills as versioned capability packages with metadata, instructions, optional scripts/references/assets and provenance. |
| `zskbot/ChatGPT-CodeReview` | PR-triggered automated code review | Review + Pull Request | Review findings belong to the PR/diff context and must show file scope, severity, status and rerun state. |
| `zskbot/git-worktree-runner` | Parallel Git worktrees for agents | Workspace + Branches | Each agent task can own an isolated worktree/branch; expose lifecycle and cleanup state. |
| `zskbot/code-ollama` | Local Ollama coding agent, MCP, skills, memory and sessions | Agent + Integrate | Provider selection must show local/cloud mode, model readiness, MCP compatibility and trust scope. |
| `zskbot/postgres-mcp` | Postgres health, query plans, tuning and safe SQL via MCP | Integrate + Observe | Database tools require explicit read/write capability states and safe-SQL/approval affordances. |
| `Velclaw/velclaw-eve` | Agent runtime with tools, skills, channels, schedules and Vercel deployment | Agent + Automate | Agent detail must separate identity, runtime, tools, schedules and deployment state. |

### 2. Canonical information architecture

The verified repositories converge on a single product loop:

`Task → Workspace → Agent → Plan/Edit → Test → Review → Gate → Git/PR → Build → Deploy → Observe`

The UI therefore uses these persistent contexts:

- **Project context:** repository, branch/worktree, task, environment and deployment target.
- **Agent context:** provider/model, skill set, execution state, approvals and tool calls.
- **Code context:** tree, editor, diff, terminal and preview.
- **Delivery context:** checks, review findings, artifacts, deployment, domain and rollback.
- **Operations context:** runtime health, logs, metrics, events, DNS and certificate state.

Do not create separate dashboards that duplicate the same state. A project is the primary join point.

### 3. Workspace layout contract

Desktop:
- 240px persistent navigation.
- Main work canvas uses a 2- or 3-pane composition depending on task: **Files | Editor/Agent | Terminal/Preview**.
- A contextual right drawer is reserved for **Review, Deploy, Diagnostics or Resource details**.
- Project/task identity remains visible above the canvas.
- Command Palette is global and must expose navigation plus safe actions.

Mobile:
- Primary navigation becomes a drawer.
- Editor, agent, terminal and source control become tabs/panels rather than squeezed columns.
- Destructive or privileged actions require a confirmation surface with the exact target and consequence.

### 4. State machine requirements

Every asynchronous capability must expose at minimum:

`idle → queued → running → awaiting-review/approval → succeeded | failed | cancelled`

Deployment additionally exposes:

`build → artifact-ready → deploying → health-check → routed → verified | rolled-back`

Agent execution additionally exposes:

`planning → editing → testing → reviewing → applying → fixing → ready-to-commit`

Never display a generic “complete” state when the underlying evidence is missing. The UI must distinguish:
- **Requested** from **started**.
- **Started** from **healthy**.
- **Provider URL returned** from **deployment verified**.
- **Review generated** from **review gate passed**.
- **DNS record changed** from **DNS propagated and verified**.

### 5. Security UX contract

- Secrets and provider tokens are server-side only.
- OAuth is an identity boundary, not an API-key substitute.
- Agent tools, deployment adapters and database tools declare their required capability scope.
- Privileged/destructive actions require explicit approval and show the target resource.
- Public APIs expose readiness/health metadata, never credentials.
- Build execution is isolated from the public API process; arbitrary repository code must run in a constrained worker/container.
- Source-control write operations are auditable and tied to a branch/worktree/task.

### 6. Docs-specific visual contract

The private `Velclaw/Velclaw-velclaw-docs-ui-reference` is treated as the **Docs UI reference only**, not the global product visual source of truth. Its verified rules include compact documentation layout, three-region desktop reading, mobile navigation drawer, square documentation controls and purple interaction accents.

The canonical product system above remains authoritative for Workspace/Console/Build/Run surfaces. If the Docs surface adopts its reference styling, it must be isolated under a Docs theme/token layer so it cannot silently alter core application controls.

### 7. Integration boundary rule

Repositories are **capability sources, not UI pages to copy wholesale**. For each integration:
1. Define the adapter/API contract.
2. Map the capability into an existing Project/Agent/Code/Delivery/Operations context.
3. Add loading/empty/error/permission/success states.
4. Add audit/evidence fields where state changes are consequential.
5. Preserve upstream attribution and licensing when code/assets are actually reused.
6. Validate type-check, tests and production build before merging.

### 8. Design acceptance checklist

A screen is not ready until all applicable checks pass:

- [ ] Uses canonical Velclaw tokens and typography.
- [ ] Has a clear project/task context.
- [ ] Defines loading, empty, error, disabled, permission-denied and success states.
- [ ] Async runtime state is visible and evidence-backed.
- [ ] Keyboard navigation and visible focus work.
- [ ] Mobile layout is intentionally designed, not merely collapsed.
- [ ] Privileged actions expose scope and confirmation.
- [ ] No secrets are rendered client-side.
- [ ] No duplicate workflow/dashboard was introduced.
- [ ] Existing route/API contracts remain stable.
- [ ] `npm run type-check` passes.
- [ ] `npm run build` passes.
