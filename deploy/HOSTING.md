# Velclaw Hosting

Velclaw Hosting is the first-party self-hosted application hosting layer for the Velclaw ecosystem. It does not use Vercel as the public hosting product or hostname.

## Architecture

```text
GitHub repository
      |
      v
Velclaw Hosting UI (/hosting)
      |
      v
POST /api/deployments
      |
      v
PostgreSQL deployment queue
      |
      v
Velclaw publisher / worker
      |
      v
Docker build + isolated container
      |
      v
Traefik reverse proxy
      |
      v
*.velclaw.cfd
```

## Current implementation

- `/hosting` — authenticated Velclaw Hosting control plane.
- `/deploy` — deployment architecture/control-plane overview.
- `/deploy/engine` — deployment queue interface.
- `POST /api/deployments` — authenticated deployment queue API.
- `GET /api/deployments` — deployment history API.
- `deploy/runner.mjs` — worker loop for queued deployments.
- `deploy/runtime-publisher.mjs` — Docker runtime publication.
- `deploy/docker-compose.selfhosted.yml` — control plane, publisher and Traefik stack.
- `deploy/traefik.yml` — reverse-proxy configuration.

## Production boundary

The canonical Velclaw product host is `velclaw.cfd`. Public deployment hostnames must remain inside the Velclaw namespace, for example `my-app.velclaw.cfd` or a generated preview hostname under `*.velclaw.cfd`.

The production server must have:

1. DNS `A/AAAA` records for `velclaw.cfd` pointing to the self-hosted server.
2. A wildcard DNS record `*.velclaw.cfd` pointing to the same server.
3. Ports `80` and `443` reachable from the Internet.
4. Docker installed and able to run the publisher.
5. A PostgreSQL connection in `POSTGRES_URL`.
6. A GitHub token in `GITHUB_TOKEN` with only the repository access required for deployments.
7. `VELCLAW_PUBLIC_DOMAIN=velclaw.cfd` and `VELCLAW_PUBLIC_SCHEME=https`.

## Start the self-hosted stack

From the repository root on the hosting server:

```bash
cd deploy
cp .env.example .env
# edit .env and add real secrets

docker compose -f docker-compose.selfhosted.yml up -d --build
```

The control plane listens internally on port `3000`; Traefik owns public ports `80` and `443`.

## Deployment lifecycle

A deployment starts as `queued`, is claimed by one worker as `building`, and ends as `ready` or `failed`. The PostgreSQL queue uses row locking with `SKIP LOCKED`, allowing multiple workers without claiming the same job.

The Hosting UI polls the deployment API for status and displays the runtime URL and build logs returned by the deployment store.

## Security rules

- Never commit `.env` or real tokens.
- Never expose `GITHUB_TOKEN` or `VELCLAW_DEPLOY_API_TOKEN` to client-side code.
- Do not allow arbitrary Docker socket access from the web UI.
- Keep the Docker publisher isolated from the public application process.
- Only publish URLs generated inside the configured Velclaw domain boundary.
- Validate GitHub repository URLs before queueing a deployment.
