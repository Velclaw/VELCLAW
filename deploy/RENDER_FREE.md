# Velclaw Hosting — Render Free

This deployment profile runs the Velclaw control plane on Render's free web service tier. It deliberately keeps the runtime provider behind `lib/hosting`, so the same application can later use the existing self-hosted Docker + Traefik runtime.

## Configuration

Set these variables in the Render service:

```env
VELCLAW_HOSTING_PROVIDER=render
RENDER_SERVICE_ID=<Render service ID>
RENDER_API_KEY=<Render API key>
RENDER_PUBLIC_URL=https://<your-render-service>.onrender.com
POSTGRES_URL=<external PostgreSQL URL>
```

Keep secrets in Render's environment settings; never commit them to Git.

## Important limitation

The Render adapter triggers a deploy of a configured Render service. It does not create arbitrary Docker containers from the Velclaw control plane, because Render's free service is not a general-purpose Docker host.

For true per-project isolated containers and wildcard `*.velclaw.dev` routing, use the existing self-hosted provider when a Docker-capable server is available.

## Suggested free rollout

1. Deploy the control plane from this repository using `deploy/render.yaml`.
2. Configure an external PostgreSQL provider appropriate for the required data retention.
3. Add the Render API key and service ID as secrets.
4. Connect `velclaw.com` through DNS/custom-domain configuration.
5. Keep `VELCLAW_HOSTING_PROVIDER=render` for the free phase.
6. Later switch to `self-hosted` after provisioning a Docker host.
