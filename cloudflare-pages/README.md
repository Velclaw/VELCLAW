# Velclaw Unified Workspace — Cloudflare Pages

This directory is a static entrypoint for the Velclaw ecosystem. It is intentionally isolated from the root Next.js application so Pages can build it without trying to run the Next.js server runtime.

## Cloudflare Pages preview configuration

- Repository: `Velclaw/VELCLAW`
- Branch: `feat/cloudflare-unified-pages-preview`
- Root directory: `cloudflare-pages`
- Build command: leave empty (static HTML)
- Build output directory: `.`
- Production branch: do not point this project at `main` during the preview phase.

## Scope

- Provides one responsive entrypoint and a product registry shell.
- Links to verified source repositories.
- Does not proxy application traffic, rewrite DNS, migrate databases, copy secrets, or replace existing Workers.
- Dynamic applications must be integrated through separately reviewed Worker routing or service bindings. Do not iframe or reverse-proxy an application until its canonical origin, auth/cookie behavior, CSP, and API paths are verified.

## Migration gates

1. Build and deploy this branch to an isolated Pages preview project.
2. Verify mobile navigation, all source links, HTTP status, asset loading, and security headers.
3. Add application routes only after confirming each application's current origin and runtime requirements.
4. Keep existing Pages projects and Workers unchanged until route-by-route parity is proven.
5. Production cutover and DNS changes require separate explicit approval.
