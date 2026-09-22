# Velclaw Domain Architecture

## Public domain roles

Velclaw uses three first-party public domains with distinct responsibilities:

- `velclaw.ai` — primary platform, company and AI product surface
- `velclaw.dev` — developer surface: IDE, documentation, SDKs, APIs and engineering tools
- `velclaw.app` — application and user-service surface

The three domains can be served by the same application while the request host selects the appropriate role, metadata, canonical URL, sitemap and product identity.

## Current URL map

- `https://velclaw.ai`
- `https://velclaw.dev`
- `https://velclaw.app`

`velclaw.com` is not part of the active public domain map until ownership is independently verified.

## Environment contract

Production defaults:

```env
VELCLAW_PUBLIC_ORIGIN=https://velclaw.ai
VELCLAW_OAUTH_ISSUER=https://velclaw.ai
VELCLAW_APP_ORIGIN=https://velclaw.app
VELCLAW_API_ORIGIN=https://velclaw.dev
VELCLAW_DOCS_ORIGIN=https://velclaw.dev
VELCLAW_ALLOWED_ORIGINS=https://velclaw.ai,https://velclaw.dev,https://velclaw.app
```

## Migration rule

Do not make `velclaw.com` canonical until its ownership and DNS control are verified. If a future domain migration is required, update deployment configuration, OAuth/CORS, metadata, canonical URLs, redirects and Search Console properties as one controlled migration.

## Repository

Canonical repository: `Velclaw/VELCLAW`.
