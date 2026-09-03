# Velclaw Deploy — Self-hosted platform

Velclaw Deploy can run without Vercel. The repository remains the control-plane application; a separate Linux host provides the runtime publisher and reverse proxy.

## Architecture

```text
GitHub → GitHub webhook → Velclaw queue → publisher → Docker runtime → Traefik → *.velclaw.cfd
```

## Required host

- Linux server with Docker Engine and Compose v2
- Public TCP 80/443
- DNS for `velclaw.cfd` and preview hostnames pointed at the host
- PostgreSQL reachable through `POSTGRES_URL`
- A long random `VELCLAW_DEPLOY_API_TOKEN`

## Start

1. Copy `deploy/.env.example` to `deploy/.env` and fill every value.
2. Configure `POSTGRES_URL` and the deployment API token.
3. Set `VELCLAW_TLS_EMAIL` to an address that can receive certificate notices.
4. Point `velclaw.cfd` and the chosen preview wildcard at the host.
5. Run `docker compose -f deploy/docker-compose.selfhosted.yml up -d --build`.
6. Configure GitHub webhook to `https://velclaw.cfd/api/webhooks/github` using the existing `GITHUB_WEBHOOK_SECRET`.

## Runtime behavior

Every queued deployment is claimed once, cloned into a temporary directory, built as a Docker image, and launched with resource limits. Traefik discovers containers through Docker labels and provisions TLS certificates through ACME.

Preview hostnames follow `<project>-<deployment-id-prefix>.velclaw.cfd`.

## Security boundary

The Docker socket is intentionally available only to the publisher/proxy services. Keep the host private, restrict SSH, use a dedicated deployment token, rotate webhook secrets periodically, and never commit `.env`.

The application does not claim that DNS or external infrastructure is configured merely because these files exist. Production readiness requires the host, DNS, TLS and PostgreSQL checks to pass.
