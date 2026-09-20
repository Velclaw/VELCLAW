# Velclaw Domain Architecture

## Status

Velclaw is **domain-agnostic at the application layer**.

`velclaw.cfd` is a legacy/transition domain and must not be treated as a core dependency. The current public hostname is deployment configuration and may change without a source-code rewrite.

## Future canonical roles

| Domain | Role | Priority |
| --- | --- | --- |
| `velclaw.cfd` | Brand / corporate | P0 |
| `velclaw.cfd` | AI / agents / intelligence | P0 |
| `velclaw.cfd` | Developer platform / docs / SDK / CLI | P0 |
| `velclaw.cfd` | Main user-facing application | P1 |
| `velclaw.cfd` | Platform / API / runtime / infrastructure | P1 |

These domains represent namespaces, not separate infrastructure stacks.

## Target URL map

```text
velclaw.cfd
  Brand / corporate

velclaw.cfd
  agents.velclaw.cfd
  models.velclaw.cfd
  playground.velclaw.cfd

velclaw.cfd
  docs.velclaw.cfd
  sdk.velclaw.cfd
  cli.velclaw.cfd
  status.velclaw.cfd

velclaw.cfd
  /login
  /workspace
  /projects
  /agents
  /builds
  /deployments
  /settings

velclaw.cfd
  api.velclaw.cfd
  gateway.velclaw.cfd
  runtime.velclaw.cfd
  events.velclaw.cfd
  status.velclaw.cfd
```

## Temporary zero-cost topology

```text
GitHub
  |
  +-- GitHub Pages -> docs / static fallback
  |
  +-- Vercel Hobby -> web/app previews
  |
  +-- PostgreSQL free tier -> application data
  |
  +-- 123HOST Free -> secondary / legacy utility workloads
  |
  +-- temporary developer hostname -> public entry point
```

The temporary hostname should be configured through environment variables. A free developer subdomain such as `velclaw.is-a.dev` can be used only if the project satisfies that service's current eligibility rules and the registration is approved.

## Environment contract

The application reads these variables:

```env
VELCLAW_PUBLIC_ORIGIN=https://example.invalid
VELCLAW_OAUTH_ISSUER=https://example.invalid
VELCLAW_APP_ORIGIN=https://example.invalid
VELCLAW_API_ORIGIN=https://api.example.invalid
VELCLAW_DOCS_ORIGIN=https://docs.example.invalid
VELCLAW_ALLOWED_ORIGINS=https://example.invalid
```

`VELCLAW_PUBLIC_DOMAIN` and `VELCLAW_PUBLIC_SCHEME` remain deployment/runtime variables for the self-hosted publisher.

### Migration example

Temporary:

```env
VELCLAW_PUBLIC_ORIGIN=https://velclaw.is-a.dev
VELCLAW_OAUTH_ISSUER=https://velclaw.is-a.dev
VELCLAW_APP_ORIGIN=https://velclaw.is-a.dev
VELCLAW_API_ORIGIN=https://velclaw.is-a.dev
VELCLAW_DOCS_ORIGIN=https://velclaw.is-a.dev
VELCLAW_ALLOWED_ORIGINS=https://velclaw.is-a.dev
```

Future:

```env
VELCLAW_PUBLIC_ORIGIN=https://velclaw.cfd
VELCLAW_OAUTH_ISSUER=https://velclaw.cfd
VELCLAW_APP_ORIGIN=https://velclaw.cfd
VELCLAW_API_ORIGIN=https://api.velclaw.cfd
VELCLAW_DOCS_ORIGIN=https://docs.velclaw.cfd
VELCLAW_ALLOWED_ORIGINS=https://velclaw.cfd,https://velclaw.cfd,https://velclaw.cfd,https://velclaw.cfd
```

## GitHub namespace strategy

The `Velclaw` GitHub organization should be the long-term project namespace.

Recommended repository roles:

```text
Velclaw/Velclaw              -> core application / platform
Velclaw/velclaw.github.io    -> static brand/docs fallback (when needed)
Velclaw/docs                 -> documentation source, if separated later
Velclaw/sdk-*                -> SDKs when they become independently versioned
Velclaw/cli                  -> CLI when it becomes independently versioned
```

The current primary repository is `Velclaw/repo-Velclaw`. Its README already refers to `Velclaw/Velclaw`, so the intended canonical repository name is `Velclaw/Velclaw`; rename it only when the GitHub organization administration path is available. GitHub repository renames preserve redirects for normal repository URLs and Git operations, but local remotes and GitHub Actions references should still be updated.

## Account roles

The available personal usernames should not be used as random mirrors of the same product. Keep one stable project owner namespace and use personal accounts for contribution/identity.

Recommended policy:

- `Velclaw` — organization / canonical project namespace.
- `zskbot` — engineering owner / personal development identity currently connected to the automation workspace.
- Other personal usernames — preserve as independent identities; do not create duplicate canonical Velclaw repositories unless a specific purpose exists.

## Migration rule

Never encode a temporary domain into application logic, OAuth issuer defaults, CORS defaults, metadata, sitemap, robots, or deployment configuration that can be supplied by environment.

When a new canonical TLD is purchased, change deployment configuration first, validate OAuth/CORS/metadata, then add redirects from legacy domains. Do not make `velclaw.cfd` a new dependency during the transition.
