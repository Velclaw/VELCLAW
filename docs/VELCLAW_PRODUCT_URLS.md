# Velclaw Product URLs

Velclaw owns its public product namespace.

## Canonical product URL

```text
https://velclaw.cfd
```

This is the canonical homepage/control-plane URL. It is not a Vercel deployment URL.

## Branch product URLs

Branch deployments use a first-party hostname under the Velclaw domain:

```text
https://velclaw-git-<branch-slug>-velclaw.cfd
```

Example:

```text
https://velclaw-git-feat-velclaw-deploy-page3-velclaw.cfd
```

The branch slug is normalized to lowercase DNS-safe characters and bounded to one DNS label.

## Runtime flow

```text
GitHub
  ↓
Velclaw deployment queue
  ↓
Velclaw runtime publisher
  ↓
root Dockerfile
  ↓
Docker image
  ↓
isolated container
  ↓
Velclaw Traefik
  ↓
velclaw-git-<branch>-velclaw.cfd
```

## Product URL rules

1. `velclaw.cfd` is the only canonical Velclaw product domain.
2. Public preview/release URLs must be under `*.velclaw.cfd`.
3. `*.vercel.app` is never a Velclaw product URL.
4. Platform-generated deployment URLs may exist as infrastructure evidence, but must not be presented to users as the product URL.
5. The application and deployment API validate first-party URL boundaries before exposing deployment URLs.
6. DNS for `*.velclaw.cfd` and TLS certificate issuance must be configured in the Velclaw deployment infrastructure.
