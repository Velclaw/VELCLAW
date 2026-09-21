# Velclaw Ops Control Plane

Standalone recovery/control service for Velclaw CI and deployment operations.

## Purpose

The control plane exists outside the Next.js request path so CI recovery remains available when the main application is unhealthy. It can:

- inspect recent GitHub Actions runs;
- dispatch `ci-release.yml` on `main`;
- re-run failed jobs for an existing run;
- expose `/healthz` for host health checks;
- provide a small operator dashboard at `/`.

## Environment

Required:

- `GITHUB_TOKEN`: fine-grained GitHub token or GitHub App token with Actions read/write for `Velclaw/Velclaw`.
- `VELCLAW_OPS_SECRET`: random bearer secret used for mutation endpoints.

Optional:

- `GITHUB_REPOSITORY` (default `Velclaw/Velclaw`)
- `VELCLAW_CI_WORKFLOW` (default `ci-release.yml`)
- `VELCLAW_CI_BRANCH` (default `main`)
- `PORT` (default `10000`)

The GitHub workflow-dispatch API requires Actions write permission. GitHub documents the endpoint and its fine-grained permission requirement here: https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event

## Endpoints

- `GET /` — operator dashboard
- `GET /healthz` — liveness
- `GET /api/status` — recent workflows/runs
- `POST /api/dispatch` — dispatch release validation (Bearer secret required)
- `POST /api/rerun/:runId` — re-run failed jobs (Bearer secret required)

## Render

Recommended deployment is a separate Render Web Service using this repository as the source:

- Build: `corepack enable && pnpm install --frozen-lockfile`
- Start: `node ops/control-plane/server.mjs`
- Region: Singapore
- Auto deploy: enabled initially; move to a protected branch if strict release gating is later required.

Keep this service separate from the main Next.js process. It is intentionally dependency-light and uses Node's built-in HTTP and `fetch` APIs.
