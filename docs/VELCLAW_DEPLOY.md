# Velclaw Deploy

`/deploy` is the canonical **Velclaw Deploy** control plane.

## Purpose

Velclaw Deploy gives deployment a dedicated first-party surface without creating a second orchestration system. It connects release preparation and deployment evidence to the existing Velclaw workflow.

```text
Task → Skill selection → Executor → Review → Gate → GitHub API → PR → Deployment evidence
```

## Responsibilities

- show the canonical production target: `velclaw.cfd`
- show only Velclaw-owned production and preview URLs
- distinguish production from preview deployment URLs
- link Task, Skills, Executor, Review, Gate, GitHub, Plugins, MCP, API Keys and VelclawHub
- present the release checklist required before deployment claims
- surface the existing task deployment evidence path

## Non-responsibilities

Velclaw Deploy does not invent provider state. A page render is not a deployment. Production is only considered deployed when a real deployment check supplies evidence.

## Deployment targets

### Production

`https://velclaw.cfd` is the sole canonical Velclaw host.

### Preview

Preview deployments use a first-party subdomain under `velclaw.cfd`, for example:

`https://velclaw-git-feat-velclaw-deploy-page3-velclaw.cfd`

Platform-generated hostnames are infrastructure details and must not be surfaced as Velclaw product URLs.

### Task deployment

Task-scoped deployments use the existing `app/api/tasks/[taskId]/deployment/route.ts` API. It checks cached task URLs plus GitHub Checks, Deployments and commit statuses, but only accepts verified `velclaw.cfd` or `*.velclaw.cfd` URLs.

## Security

Deployment credentials are not stored in page metadata or Skills. They belong in the existing API Keys, environment, or secrets boundary.

## UI integration

The Deploy route must be present in the canonical UI Audit inventory and VelclawHub navigation. Its naming is **Velclaw Deploy**, consistent with the project-wide `Velclaw + function` rule.

## DNS / deployment boundary

The `*.velclaw.cfd` namespace requires DNS and deployment-provider routing to be configured for the Velclaw domain. Repository code can enforce and display the canonical namespace, but DNS/provider configuration is external infrastructure and is not fabricated by the application.
