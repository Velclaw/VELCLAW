# Velclaw Deploy

`/deploy` is the canonical **Velclaw Deploy** control plane.

## Purpose

Velclaw Deploy gives deployment a dedicated first-party surface without creating a second orchestration system. It connects release preparation and deployment evidence to the existing Velclaw workflow.

```text
Task → Skill selection → Executor → Review → Gate → GitHub API → PR → Deployment evidence
```

## Responsibilities

- show the canonical production target: `velclaw.cfd`
- distinguish production from preview deployment URLs
- link Task, Skills, Executor, Review, Gate, GitHub, Plugins, MCP, API Keys and VelclawHub
- present the release checklist required before deployment claims
- surface the existing task deployment evidence path

## Non-responsibilities

Velclaw Deploy does not invent provider state. A page render is not a deployment. Production is only considered deployed when a real provider/GitHub deployment check supplies evidence.

## Deployment targets

### Production

`velclaw.cfd` is the sole canonical Velclaw host.

### Preview

`*.vercel.app` is deployment output for previews. It is never a replacement for the canonical host.

### Task deployment

Task-scoped deployments use the existing `app/api/tasks/[taskId]/deployment/route.ts` API. That API checks cached preview URLs and provider-backed GitHub Checks, Deployments and commit statuses.

## Security

Deployment credentials are not stored in page metadata or Skills. They belong in the existing API Keys, environment, or secrets boundary.

## UI integration

The Deploy route must be present in the canonical UI Audit inventory and VelclawHub navigation. Its naming is **Velclaw Deploy**, consistent with the project-wide `Velclaw + function` rule.
