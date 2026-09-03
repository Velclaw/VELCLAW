# Velclaw Product URLs

Velclaw owns its public product namespace.

## Canonical product URL

`https://velclaw.cfd`

## Branch product URLs

Branch deployments use a first-party hostname under the Velclaw domain:

`https://velclaw-git-<branch-slug>-velclaw.cfd`

Example:

`https://velclaw-git-feat-velclaw-deploy-page3-velclaw.cfd`

## Rules

1. `velclaw.cfd` is the only canonical Velclaw product domain.
2. Public preview/release URLs must be under `*.velclaw.cfd`.
3. `*.vercel.app` is never a Velclaw product URL.
4. Platform-generated deployment URLs are infrastructure evidence only and must not be presented as product URLs.
5. DNS for `*.velclaw.cfd` and TLS certificate issuance must be configured in Velclaw infrastructure.
