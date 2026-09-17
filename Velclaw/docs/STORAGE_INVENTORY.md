# Velclaw storage inventory

This file is the source-of-truth inventory for persistence and storage surfaces found in `Velclaw/Velclaw`. It intentionally distinguishes durable storage from ephemeral build/runtime state and from provider templates.

## Durable application data

- **PostgreSQL** — authoritative application/deployment state through `POSTGRES_URL`; used by Drizzle, deployment stores, routes, and migrations.
- **Database migrations** — versioned under `lib/db/migrations`; source-controlled migration history, not runtime user storage.

## Self-hosted runtime storage

- **`velclaw-deploy-work` Docker volume** — build/work area used by the Compose deployment worker.
- **`letsencrypt` Docker volume** — Traefik ACME certificate state at `/letsencrypt/acme.json`; required for persistent TLS certificates.
- **Docker images/containers** — runtime artifacts and active workloads on the host; disposable/rebuildable rather than the authoritative application database.
- **Publisher temporary workdir** — per-deployment temporary clone under the host OS temporary directory; explicitly removed after publication and therefore ephemeral.

## External/provider storage contracts

- **Neon integration** — represented in `vercel-template.json` and package dependencies as a PostgreSQL storage option. It is not a separate Velclaw runtime database when `POSTGRES_URL` points elsewhere.
- **IBM Cloud Object Storage** — referenced by OpenShift documentation for IBM registry backing. It is not currently a required Velclaw application datastore.
- **Supabase PostgreSQL** — compatible with the `POSTGRES_URL` contract when a Supabase connection string is supplied. The project URL alone is not a database connection string.

## Repository/documentation stores

- `Velclaw/Velclaw` — canonical application/control-plane repository.
- `Velclaw/deploy-velclaw` — static Velclaw Pages source repository.
- `Velclaw/docs.velclaw.ai` — documentation source repository; deployed independently as the docs site and also compatible with the Velclaw container publisher.

## Rules

1. Never treat an ephemeral build directory as durable storage.
2. Never commit credentials, `.env`, database passwords, access keys, or tokens.
3. `POSTGRES_URL` remains the single application database connection contract.
4. Docker volumes are infrastructure state; PostgreSQL remains authoritative for application/deployment records.
5. Provider-specific storage documented for optional integrations must not be presented as active production infrastructure without runtime evidence.
