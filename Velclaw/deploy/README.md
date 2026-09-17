# Velclaw Deploy Engine

Velclaw Deploy is the self-hosted deployment control plane for the Velclaw ecosystem. It is intentionally provider-neutral: GitHub is the source of truth, PostgreSQL is the durable queue, and an isolated worker performs production builds.

## Phase 1 shipped

- Authenticated deployment queue API: `POST /api/deployments`
- Deployment history API: `GET /api/deployments`
- GitHub webhook HMAC-SHA256 verification
- Verified `push` events enqueue deployments automatically
- PostgreSQL-backed queue with `FOR UPDATE SKIP LOCKED`
- Containerized non-root build worker
- Resource limits and `no-new-privileges` in Compose
- Velclaw Deploy Engine UI at `/deploy/engine`
- Next.js production build verification

## Required infrastructure

The application still needs one always-on machine or container host for the build worker. This is deliberate: a serverless request handler cannot safely act as a persistent build queue/worker.

Required environment variables for the worker:

```text
POSTGRES_URL=...
GITHUB_TOKEN=...
```

`GITHUB_TOKEN` must have the minimum repository contents read permission required to clone private repositories. Never commit it to the repository.

Start the worker from the repository root:

```bash
cd deploy
docker compose up -d --build
```

The worker polls the database queue, clones the requested GitHub branch, installs dependencies, runs the repository production build, records logs/status, and removes the temporary source directory.

## Runtime publication boundary

Phase 1 stops after a verified build artifact. It does **not** claim that an application is publicly deployed merely because a build succeeded. Phase 2 adds an isolated runtime adapter, reverse proxy, health checks, TLS, immutable artifacts, and rollback.

## Security boundary

- GitHub webhook requests must pass `X-Hub-Signature-256` verification.
- Repository URLs are restricted to `https://github.com/...`.
- Build workers run as a non-root user.
- Compose enables `no-new-privileges` and resource limits.
- Secrets stay in environment/secret storage.
- Build logs never include the GitHub token.

## Public namespace

The canonical Velclaw production host remains `https://velclaw.cfd`. Public deployment URLs must be verified before being exposed to users.
