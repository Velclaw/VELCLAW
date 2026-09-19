# Velclaw Product URLs

Velclaw owns its public product namespace.

## Canonical product URL

```text
https://velclaw.com
```

This is the canonical homepage/control-plane URL. It is not a Vercel deployment URL.

## Branch product URLs

Branch deployments use a first-party hostname under the Velclaw domain:

```text
https://velclaw-git-<branch-slug>-velclaw.dev
```

Example:

```text
https://velclaw-git-feat-velclaw-deploy-page3-velclaw.com
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
velclaw-git-<branch>-velclaw.com
```

## Product URL rules

1. `velclaw.com` is the only canonical Velclaw product domain.
2. Public preview/release URLs must be under `*.velclaw.dev`.
3. `*.vercel.app` is never a Velclaw product URL.
4. Platform-generated deployment URLs may exist as infrastructure evidence, but must not be presented to users as the product URL.
5. The application and deployment API validate first-party URL boundaries before exposing deployment URLs.
6. DNS for `*.velclaw.dev` and TLS certificate issuance must be configured in the Velclaw deployment infrastructure.
