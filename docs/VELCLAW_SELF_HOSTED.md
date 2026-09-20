# Velclaw Deploy — Self-hosted platform

Velclaw Deploy is a Velclaw-owned runtime. The repository remains the control-plane application; a separate Linux host provides the runtime publisher and reverse proxy. No Vercel deployment configuration is required.

## Architecture

```text
GitHub → GitHub webhook → Velclaw queue → publisher → Docker runtime → Traefik → public hostname
```

## Required host

- Linux server with Docker Engine and Compose v2
- Public TCP 80/443 for production HTTPS; TCP 80 is sufficient for temporary HTTP verification
- PostgreSQL reachable through `POSTGRES_URL`
- A long random `VELCLAW_DEPLOY_API_TOKEN`
- DNS for the selected public hostname and wildcard branch hosts when using a real domain

## Start

1. Copy `deploy/.env.example` to `deploy/.env` and fill every value.
2. Configure `POSTGRES_URL` and the deployment API token.
3. Set `VELCLAW_PUBLIC_DOMAIN` to the hostname you currently control.
4. For production, use `VELCLAW_PUBLIC_SCHEME=https`, `VELCLAW_TRAEFIK_ENTRYPOINT=websecure`, and `VELCLAW_TLS_ENABLED=true`.
5. Point the base hostname and wildcard `*.${VELCLAW_PUBLIC_DOMAIN}` at the runtime host.
6. Run `docker compose -f deploy/docker-compose.selfhosted.yml up -d --build`.
7. Configure the GitHub webhook at `https://${VELCLAW_PUBLIC_DOMAIN}/api/webhooks/github` using the existing `GITHUB_WEBHOOK_SECRET`.

## Temporary domain-lock mode

When the production domain `velclaw.cfd` is locked or unavailable, do not point the runtime at it and do not claim production readiness. Use a temporary hostname that you control instead.

For a temporary HTTP verification host, configure:

```dotenv
VELCLAW_PUBLIC_DOMAIN=deploy-test.example.com
VELCLAW_PUBLIC_SCHEME=http
VELCLAW_TRAEFIK_ENTRYPOINT=web
VELCLAW_TLS_ENABLED=false
```

Then point `deploy-test.example.com` and `*.deploy-test.example.com` at the runtime host. This validates the complete GitHub → queue → publisher → Docker → Traefik path without depending on the locked production domain. Replace the temporary values with `velclaw.cfd` and HTTPS after the production domain is restored.

Do not use a hostname you do not control. An IP address can be used for basic control-plane HTTP testing, but branch preview hostnames require DNS unless the client explicitly supplies matching host entries.

## Public URL contract

- Production: `https://velclaw.cfd`
- Branch preview: `https://velclaw-git-<branch-slug>-velclaw.cfd`
- Temporary mode follows the same hostname pattern under `VELCLAW_PUBLIC_DOMAIN`.
- Provider-generated hostnames are infrastructure details and are never the product URL.

## Runtime behavior

Every queued deployment is claimed once, cloned into a temporary directory, built from the repository root `Dockerfile`, and launched with resource limits. Traefik discovers containers through Docker labels. HTTPS mode provisions certificates through ACME; HTTP temporary mode intentionally does not enable TLS labels.

## Security boundary

The Docker socket is intentionally available only to the publisher/proxy services. Keep the host private, restrict SSH, use a dedicated deployment token, rotate webhook secrets periodically, and never commit `.env`.

The application does not claim that DNS, TLS, PostgreSQL, or external infrastructure is configured merely because these files exist. Production readiness requires the host, DNS, TLS, PostgreSQL and runtime health checks to pass.
