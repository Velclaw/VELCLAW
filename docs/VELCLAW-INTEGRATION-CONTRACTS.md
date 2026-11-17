# Velclaw Ecosystem Integration Contracts

This document defines the implementation boundary for integrating independent Velclaw ecosystem repositories into `Velclaw/VELCLAW` without coupling the core to their internal source trees.

## 1. Canonical lifecycle

```text
Task
  ↓
Workspace
  ↓
Agent
  ↓
Plan / Edit
  ↓
Test
  ↓
Review
  ↓
Gate
  ↓
Git / PR
  ↓
Build
  ↓
Artifact
  ↓
Deploy
  ↓
Health / Routing
  ↓
Observe
```

Every integration must attach to one or more lifecycle stages and declare its evidence source.

## 2. Capability envelope

Each external capability is represented by a normalized envelope:

```ts
type CapabilityEnvelope = {
  id: string
  provider: string
  version: string
  capability: string
  scope: string[]
  status: "available" | "degraded" | "unavailable"
  evidence?: {
    source: string
    timestamp: string
    reference?: string
  }
  actions: Array<{
    id: string
    destructive: boolean
    requiresApproval: boolean
  }>
}
```

The envelope is a UI/control-plane contract, not a requirement that every upstream repository implement this exact TypeScript type.

## 3. Workspace contract

The canonical Project context owns:

- repository
- branch
- worktree
- task
- environment
- agent session
- checks
- review
- deployment target

External IDE surfaces may provide editing or agent functionality, but they must not create a second authoritative project state.

### Required workspace evidence

```text
repository → branch/worktree → dirty/clean → task → agent → checks → PR
```

A workspace is considered synchronized only when the latest known Git state and agent/worktree state are available.

## 4. Agent contract

Agents expose:

- identity/provider
- model
- runtime state
- capabilities/skills
- tool permissions
- current task
- approvals
- execution events
- output/artifacts

### Agent state

```text
planning
  → editing
  → testing
  → reviewing
  → awaiting-approval
  → applying
  → fixing
  → ready-to-commit
```

A failed step must retain its diagnostic evidence and allow retry/cancel without losing task context.

## 5. Skills / MCP contract

A skill or MCP capability must declare:

- stable identifier
- version
- provider/source
- required permissions
- input/output schema
- availability
- provenance
- execution/audit reference

Discovery is lightweight. Full instructions and references are loaded only when a capability is selected.

Privileged capabilities must expose an approval boundary before execution.

## 6. Git / review contract

Git operations are tied to a project task and, where agent isolation is used, a dedicated worktree.

Minimum lifecycle:

```text
branch/worktree
  → changes
  → checks
  → review findings
  → gate
  → commit
  → PR
```

Review findings must retain:

- file
- location
- severity
- finding
- status
- reviewer/source
- rerun state

The UI must never present a review as a passed gate merely because a review artifact exists.

## 7. Build / artifact contract

Build status and artifact status are separate resources.

```text
requested
→ running
→ succeeded | failed | cancelled

artifact
→ unavailable | ready | expired
```

A successful build without a usable artifact must not be represented as deploy-ready.

## 8. Deployment contract

Deployment integrates Autoship, deploy surfaces and VelclawHost through a normalized delivery record:

```ts
type DeliveryRecord = {
  projectId: string
  environment: string
  releaseId: string
  buildId?: string
  artifactId?: string
  provider: string
  deploymentId?: string
  previewUrl?: string
  productionUrl?: string
  health: "unknown" | "checking" | "healthy" | "unhealthy"
  routing: "unknown" | "pending" | "active" | "failed"
  verification: "unverified" | "verified"
  rollbackAvailable: boolean
}
```

The UI must separately display:

- provider accepted request
- deployment created
- provider URL returned
- runtime healthy
- domain routed
- deployment verified

## 9. Domain / DNS / TLS contract

Domain state is not deployment state.

Required independent states:

```text
domain
  → configured
  → DNS pending
  → DNS propagated
  → TLS pending
  → TLS active
  → route verified
```

A production URL must not receive a “verified” state unless routing and health evidence exist.

## 10. Security contract

- OAuth credentials and provider tokens stay server-side.
- Public client code receives opaque resource IDs and safe status metadata.
- Tool permissions are explicit and scoped.
- Destructive actions require confirmation.
- Build/runtime execution is isolated from the public API process.
- Git write operations are auditable.
- Database write capabilities require an explicit write scope.
- Secrets never appear in logs, review comments or client state.

## 11. Failure contract

Every integration must support:

```text
loading
empty
degraded
error
permission-denied
cancelled
retrying
success
```

Error surfaces must contain:

1. what failed
2. affected resource
3. evidence/reference
4. retry or recovery action
5. whether state may be stale

Do not hide failures behind generic toast messages.

## 12. UI composition

Desktop:

```text
┌──────────┬───────────────────────────────┬──────────────┐
│ Sidebar  │ Project / Task Context        │ Context      │
│          ├───────────────────────────────┤ Drawer       │
│          │ Files │ Editor / Agent        │ Review       │
│          │       │                       │ Deploy       │
│          │       │                       │ Diagnostics  │
│          ├───────────────────────────────┤              │
│          │ Terminal / Preview / Tests    │              │
└──────────┴───────────────────────────────┴──────────────┘
```

The contextual drawer is not another dashboard. It is a detail surface for the current resource.

## 13. Integration gate

Before an ecosystem adapter is considered production-ready:

- [ ] Contract is documented.
- [ ] Source repository and version are recorded.
- [ ] Authentication boundary is explicit.
- [ ] Capability scope is explicit.
- [ ] Evidence source is available.
- [ ] Loading/empty/error/permission/success states exist.
- [ ] Audit trail exists for writes.
- [ ] No client-side secrets.
- [ ] Mobile interaction is defined.
- [ ] Keyboard/accessibility behavior is defined.
- [ ] Existing routes and API contracts remain compatible.
- [ ] `npm run type-check` passes.
- [ ] `npm run build` passes.
- [ ] Deployment verification is distinct from provider acknowledgement.

## 14. Ownership rule

`Velclaw/VELCLAW` owns the canonical product model and UI contract.

External repositories own their implementation details.

The core must not import arbitrary internal modules from companion repositories. Integration is performed through stable boundaries: HTTP APIs, GitHub APIs, webhooks, OAuth, MCP/skills, artifacts or explicitly versioned adapters.
