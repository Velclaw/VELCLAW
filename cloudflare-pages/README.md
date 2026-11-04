# Velclaw Unified Workspace — Cloudflare Pages

This directory is a static entrypoint for the Velclaw ecosystem. It is intentionally isolated from the root Next.js application so Pages can build it without trying to run the Next.js server runtime.

## Cloudflare Pages preview configuration

- Project: `velclaw-workspace-preview`
- Preview hostname: `velclaw-workspace-preview.pages.dev`
- Repository: `Velclaw/VELCLAW`
- Branch: `feat/cloudflare-unified-pages-preview`
- Root directory: `cloudflare-pages`
- Build command: empty (static HTML)
- Build output directory: `.`
- Production branch: `main`, with production deployments explicitly disabled.
- Preview branch allowlist: `feat/cloudflare-unified-pages-preview`

The Pages project has been created with Git integration. The latest Preview deployment completed all stages successfully. The branch-specific preview alias is `https://feat-cloudflare-unified-page.velclaw-workspace-preview.pages.dev`. A direct external HTTP/browser smoke test is still pending.

## Scope

- Provides one responsive entrypoint and a product registry shell.
- Links to verified source repositories.
- Does not proxy application traffic, rewrite DNS, migrate databases, copy secrets, or replace existing Workers.
- Dynamic applications must be integrated through separately reviewed Worker routing or service bindings. Do not iframe or reverse-proxy an application until its canonical origin, auth/cookie behavior, CSP, and API paths are verified.

## Migration gates

1. Deploy this branch to the isolated Pages preview project.
2. Verify mobile layout, all source links, HTTP status, asset loading, and security headers.
3. Add application routes only after confirming each application's current origin and runtime requirements.
4. Keep existing Pages projects and Worker routes unchanged until route-by-route parity is proven.
5. Production cutover and DNS changes require separate explicit approval.
