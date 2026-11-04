# Velclaw Unified Workspace — Cloudflare Pages

This directory is a static, mobile-first entrypoint for the Velclaw ecosystem. It is intentionally isolated from the root Next.js application so Pages can serve it without changing the root application's runtime.

## Default design system

- Visual direction: Dark Minimal / Developer Control Center.
- Primary background: `#05070f`; panel: `#0b1020`; text: `#f3f6ff`.
- Action blue: `#5687ff`; secondary violet: `#9b7bff`.
- Mobile-first responsive layout, compact navigation, large touch targets, accessible menu state, project search and category filters.
- Project status labels must reflect evidence. A source link is not a live deployment.
- Respect `prefers-reduced-motion`; do not rely on animation for navigation or state.

## Cloudflare Pages preview configuration

- Project: `velclaw-workspace-preview`
- Repository: `Velclaw/VELCLAW`
- Branch: `feat/cloudflare-unified-pages-preview`
- Root directory: `cloudflare-pages`
- Build command: empty (static HTML)
- Build output directory: `.`
- Production branch: `main`, with production deployments explicitly disabled.
- Preview branch allowlist: `feat/cloudflare-unified-pages-preview`

The isolated Pages project has a successful Preview deployment at the time of the last infrastructure check. The latest deployment URL/alias must be read from Cloudflare after each commit; do not hardcode an older deployment ID in product documentation. External browser/HTTP smoke testing remains a separate verification gate.

## Scope

- Provides one responsive entrypoint and a project registry shell.
- Links to verified source repositories and the verified woww Pages site.
- Does not proxy application traffic, rewrite DNS, migrate databases, copy secrets, or replace existing Workers.
- Dynamic applications must be integrated through separately reviewed Worker routing or service bindings. Do not iframe or reverse-proxy an application until its canonical origin, auth/cookie behavior, CSP, and API paths are verified.

## Migration gates

1. Deploy this branch to the isolated Pages Preview project.
2. Verify mobile layout, hamburger navigation, search/filter behavior, all source links, HTTP status, asset loading, and security headers.
3. Add application routes only after confirming each application's current origin and runtime requirements.
4. Keep existing Pages projects and Worker routes unchanged until route-by-route parity is proven.
5. Production cutover and DNS changes require separate explicit approval.
