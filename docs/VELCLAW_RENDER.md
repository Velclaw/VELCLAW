# Velclaw on Render

Render is the hosted runtime for the current Velclaw deployment path. IBM Cloud and Cloudflare are not required for this deployment.

## Architecture

```text
GitHub (Velclaw/Velclaw)
        |
        v
Render Web Service
        |
        +---- Next.js / Velclaw
        |
        +---- PostgreSQL via POSTGRES_URL
        |
        v
https://velclaw.com
```

## Deploy

1. Sign in to Render and connect the `Velclaw/Velclaw` GitHub repository.
2. Create a Blueprint from `render.yaml`, or create a Web Service using the same build/start commands.
3. Use the `main` branch for production.
4. Set the environment variables marked `sync: false` in `render.yaml` in Render's Environment settings.
5. Deploy and wait for the Render build to finish.
6. Add `velclaw.com` as a custom domain in the Render service and complete the DNS records Render provides.

## Required secrets

At minimum, production needs:

- `POSTGRES_URL`
- `JWE_SECRET`
- `ENCRYPTION_KEY`
- `NEXT_PUBLIC_GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` when GitHub OAuth is enabled

`GITHUB_TOKEN` and agent/provider API keys are optional until the corresponding features are used.

`VELCLAW_DEPLOY_API_TOKEN` is retained for Velclaw deployment API authorization; it does not make Render itself the deployment API.

## GitHub OAuth

Set the GitHub OAuth callback URL to:

`https://velclaw.com/api/auth/github/callback`

The client ID is public and belongs in `NEXT_PUBLIC_GITHUB_CLIENT_ID`. The client secret must remain a private Render environment variable.

## Database

Velclaw expects PostgreSQL through `POSTGRES_URL`. Run the repository's Drizzle migrations against the production database before using database-backed features.

## Production evidence

A successful Render build alone is not proof that `velclaw.com` is serving production. Verify the Render service is healthy, the custom domain is attached, DNS resolves to Render, and the public site responds before declaring production deployed.
