# Velclaw Domain Architecture

## Current status

`velclaw.cfd` is the **temporary canonical production domain** for the current Velclaw deployment. All active application, deployment, API, documentation and preview URLs use the `velclaw.cfd` namespace.

When a primary domain is purchased later, migration targets may include:

- `velclaw.com`
- `velclaw.ai`
- `velclaw.dev`
- `velclaw.io`
- `velclaw.app`

These are future migration targets, not active runtime endpoints.

## Current URL map

- `https://velclaw.cfd`
- `https://velclaw.cfd/docs`
- `https://velclaw.cfd/api/*`
- `https://*.velclaw.cfd`
- Branch previews: `https://velclaw-git-<branch-slug>-velclaw.cfd`

## Environment contract

Production defaults:

```env
VELCLAW_PUBLIC_ORIGIN=https://velclaw.cfd
VELCLAW_OAUTH_ISSUER=https://velclaw.cfd
VELCLAW_APP_ORIGIN=https://velclaw.cfd
VELCLAW_API_ORIGIN=https://velclaw.cfd
VELCLAW_DOCS_ORIGIN=https://velclaw.cfd
VELCLAW_ALLOWED_ORIGINS=https://velclaw.cfd
```

The variables remain overrideable for controlled local/test environments.

## Migration rule

When a primary domain is purchased, change deployment configuration first, validate OAuth/CORS/metadata, then add redirects from `velclaw.cfd`. The current deployment must continue using `velclaw.cfd` until that migration is explicitly performed.

## Repository

Canonical repository: `Velclaw/VELCLAW`.
