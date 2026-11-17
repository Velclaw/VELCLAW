# Google Cloud deployment

This document describes the production delivery path for the Velclaw application.

## Architecture

```
GitHub: Velclaw/VELCLAW
        |
        | push to main
        v
Cloud Build trigger
        |
        +--> pnpm type-check
        +--> pnpm build
        +--> Docker build
        +--> Artifact Registry
        +--> Cloud Run
```

The existing `Dockerfile` remains the runtime contract. Google Cloud does not require a second application server or a parallel deployment implementation.

## Required Google Cloud resources

Create these resources in the target Google Cloud project:

- Artifact Registry Docker repository: `velclaw`
- Cloud Run service: `velclaw`
- Cloud Build GitHub host connection and repository link
- Cloud Build trigger for `main`

Recommended region: `asia-southeast1`.

## Required IAM

The Cloud Build service account needs:

- Artifact Registry Writer
- Cloud Run Admin
- Service Account User for the runtime service account

Grant only the permissions required by the target project.

## Trigger

Configure Cloud Build > Triggers with:

- Event: push to a branch
- Repository: `Velclaw/VELCLAW`
- Branch: `^main$`
- Configuration: repository `cloudbuild.yaml`

The trigger should use the Google Cloud project that owns the Artifact Registry and Cloud Run service.

## Configuration

The build uses these substitutions:

| Variable | Default | Purpose |
| --- | --- | --- |
| `_REGION` | `asia-southeast1` | Artifact Registry and Cloud Run region |
| `_AR_REPOSITORY` | `velclaw` | Artifact Registry repository |
| `_SERVICE` | `velclaw` | Cloud Run service |

The Google-managed `$PROJECT_ID` and `$COMMIT_SHA` substitutions are used for image naming.

## Secrets

Application secrets must not be committed to GitHub or placed in `cloudbuild.yaml`.

Use Google Secret Manager and attach secrets to Cloud Run after the service exists. Existing Velclaw environment variables such as GitHub credentials, database URLs, JWE/encryption keys, and deployment tokens should be migrated to Secret Manager values with least-privilege access.

## First deployment

1. Enable Cloud Build, Artifact Registry, Cloud Run, Secret Manager and IAM APIs.
2. Create the `velclaw` Artifact Registry repository.
3. Connect GitHub `Velclaw/VELCLAW` to Cloud Build.
4. Create the `main` trigger using `cloudbuild.yaml`.
5. Run the trigger once.
6. Confirm the Cloud Run revision becomes ready.
7. Attach production secrets and domain routing.
8. Verify application health and canonical Velclaw routes.

This repository change only adds the reproducible build/deploy contract. It does not claim that a Google Cloud project, GitHub host connection, IAM bindings, DNS, or production secrets already exist.
