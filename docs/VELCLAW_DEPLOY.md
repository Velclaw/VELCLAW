# Velclaw Deploy

`/deploy` is the canonical **Velclaw Deploy** control plane.

## Purpose

Velclaw Deploy gives deployment a dedicated first-party surface without creating a second orchestration system. It connects release preparation and deployment evidence to the existing Velclaw workflow.

## Canonical application pipeline

```text
Task → Skill selection → Executor → Review → Gate → GitHub API → PR → Deployment evidence
```

## Canonical runtime deployment pipeline

```text
GitHub webhook
  → Velclaw deployment queue
  → Velclaw runtime publisher
  → root Dockerfile
  → Docker image
  → isolated Docker container
  → Velclaw Traefik proxy
  → *.velclaw.cfd
```

The root `Dockerfile` is the canonical application image definition for Velclaw. The runtime publisher builds that Dockerfile for a release branch, starts the resulting container with resource/security limits, and attaches Velclaw-owned routing labels. Traefik exposes the container through the first-party `velclaw.cfd` namespace.

## Responsibilities

- show the canonical production target: `velclaw.cfd`
- show only Velclaw-owned production and preview URLs
- distinguish production from preview deployment URLs
- link Task, Skills, Executor, Review, Gate, GitHub, Plugins, MCP, API Keys and VelclawHub
- present the release checklist required before deployment claims
- surface runtime-backed deployment evidence

## Non-responsibilities

Velclaw Deploy does not invent runtime state. A page render is not a deployment. Production is only considered deployed when the Velclaw runtime publisher and deployment API provide evidence.

## Deployment targets

### Production

`https://velclaw.cfd` is the sole canonical Velclaw host.

### Preview

Preview deployments use a first-party subdomain under `velclaw.cfd`, for example:

`https://velclaw-git-feat-velclaw-deploy-page3-velclaw.cfd`

Platform-generated hostnames are infrastructure details and must not be surfaced as Velclaw product URLs.

### Task deployment

Task-scoped deployments use the existing deployment API. Runtime deployment jobs are claimed by the Velclaw publisher, built from the repository branch using the root Dockerfile, and published through the Velclaw runtime network.

## Docker runtime contract

The root `Dockerfile`:

- uses Node 22
- installs dependencies from the committed `pnpm-lock.yaml`
- builds the Next.js application with the repository `build` script
- runs the production application on port `3000`
- runs the final container as the non-root `velclaw` user
- disables Next.js telemetry in the image

The publisher applies container limits and `no-new-privileges`, then places the container on the `velclaw-runtime` network.

## Security

Deployment credentials are not stored in page metadata or Skills. They belong in the existing API Keys, environment, or secrets boundary. The Docker socket is exposed only to the runtime publisher and reverse proxy services in the self-hosted deployment topology.

## UI integration

The Deploy route must be present in the canonical UI Audit inventory and VelclawHub navigation. Its naming is **Velclaw Deploy**, consistent with the project-wide `Velclaw + function` rule.

## DNS / deployment boundary

The `*.velclaw.cfd` namespace requires wildcard DNS, TLS and reverse-proxy routing to be configured for the Velclaw runtime host. Repository code can enforce and display the canonical namespace, but DNS/infrastructure state is external and is not fabricated by the application.
