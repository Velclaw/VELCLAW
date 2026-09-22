# Velclaw multi-domain SEO

Velclaw publishes three distinct public web properties:

- velclaw.com — platform and company surface
- velclaw.dev — developer, IDE, documentation and API surface
- velclaw.app — application and user-service surface

The same Next.js deployment can serve all three domains. The incoming Host header determines the domain role.

## Domain-specific SEO

Each domain receives:

- its own title and description
- its own canonical URL
- its own Open Graph URL
- its own robots.txt host and sitemap
- its own sitemap URL set
- Organization or SoftwareApplication JSON-LD
- a domain-specific semantic introduction on the homepage

The domains are intentionally not configured as duplicate aliases.

## Production environment

Use these values in the production deployment:

VELCLAW_PUBLIC_ORIGIN=https://velclaw.com
VELCLAW_APP_ORIGIN=https://velclaw.app
VELCLAW_API_ORIGIN=https://velclaw.dev
VELCLAW_DOCS_ORIGIN=https://velclaw.dev
VELCLAW_OAUTH_ISSUER=https://velclaw.com
VELCLAW_ALLOWED_ORIGINS=https://velclaw.com,https://velclaw.dev,https://velclaw.app

Do not use velclaw.cfd as the canonical origin for these three public properties.

## DNS and deployment

All three domains must resolve to the production deployment serving this application, with valid HTTPS:

- https://velclaw.com
- https://velclaw.dev
- https://velclaw.app

The deployment platform must accept all three hostnames.

## Google Search Console

Create or verify three Search Console properties and submit:

- https://velclaw.com/sitemap.xml
- https://velclaw.dev/sitemap.xml
- https://velclaw.app/sitemap.xml

Then use URL Inspection on each homepage and request indexing when the domains are publicly reachable.

Google controls crawl and indexing timing; metadata and sitemaps provide signals but do not guarantee a specific search-result position or appearance.

## Verification checklist

1. Every domain resolves to production.
2. HTTPS is valid on every domain.
3. GET / returns 200 on every domain.
4. GET /robots.txt returns 200 and references that domain's sitemap.
5. GET /sitemap.xml returns 200 and contains URLs on that same domain.
6. Homepage canonical points to its own domain.
7. Homepage title and description match the domain role.
8. Search Console has all three properties verified.
9. Search Console has all three sitemaps submitted.
10. Each domain contains substantive content matching its stated role.
