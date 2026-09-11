# Autoship integration

AgentsIDE exposes Autoship deployment status in Workspace and Tools.

## Runtime endpoint

The frontend defaults to the existing Autoship Cloud Run endpoint. Override it at build time with `VITE_AUTOSHIP_URL=https://your-autoship-host`.

## Production flow

1. `AgentsIDE CI` validates the application.
2. `.github/workflows/autoship-deploy.yml` runs only after successful `main` CI (or manual dispatch).
3. The workflow calls `POST /api/projects/upsert`, so no project ID is hard-coded.
4. The workflow calls `POST /api/pipelines/trigger` with the exact 40-character workflow commit SHA.
5. Autoship clones that exact revision, installs dependencies, tests, builds, deploys and health-checks it.
6. AgentsIDE reads `/api/pipelines` and `/api/pipelines/:id` to surface deployment status and deployed URL.

## Authentication boundary

Browser code never receives `AUTOSHIP_API_TOKEN`. Mutating Autoship API calls are server-side GitHub Actions operations. Read-only status calls can be made by the browser through CORS.

Optional GitHub Actions secrets:

- `AUTOSHIP_URL` — override the default Autoship endpoint.
- `AUTOSHIP_API_TOKEN` — bearer token for protected mutating API routes.

The workflow derives the project ID with `projects/upsert`; it does not depend on `AUTOSHIP_PROJECT_ID`.

## Autoship runner requirements

For private repositories, the isolated runner uses `AUTOSHIP_GITHUB_TOKEN` without embedding the token in the clone URL. Deployment-specific credentials remain runner-side: SSH keys/known-hosts, webhook tokens, registry credentials, and Cloud Run credentials.

## Security boundary

No GitHub token, Gemini key, SSH credential, deployment token, or API secret is bundled into AgentsIDE. Autoship limits command runtime and log output, sanitizes inherited environment variables, redacts configured secret values, cleans temporary workspaces, and verifies GitHub webhook signatures.
