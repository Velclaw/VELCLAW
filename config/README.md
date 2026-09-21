# Velclaw MCP configuration

The canonical MCP registry is `config/mcp.json`. The root `.mcp.json` points to this file.

## Servers

- **playwright** — browser automation through Microsoft Playwright MCP.
- **filesystem** — filesystem access scoped to the Velclaw workspace.
- **postgres** — PostgreSQL analysis and SQL access in restricted/read-only mode.
- **github** — GitHub's hosted MCP server.
- **context7** — version-aware library documentation.
- **sequential-thinking-recall** — optional Recall-backed sequential-thinking server; disabled until its local build is provisioned.

## Required environment

Do not commit secrets.

- `POSTGRES_URL`
- `GITHUB_MCP_PAT`
- `CONTEXT7_API_KEY`
- `RECALL_PRIVATE_KEY` (only when sequential-thinking-recall is enabled)
- `RECALL_NETWORK` (default: `testnet`)
- `RECALL_BUCKET_ALIAS` (default: `sequential-thinking-logs`)
- `RECALL_LOG_PREFIX` (default: `sequential-`)

Postgres is deliberately configured in restricted mode for the shared development configuration. Switch to unrestricted mode only in a separately controlled development profile.

## Verification

Use the repository's normal validation commands:

```bash
pnpm format
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

Do not start a development server as part of validation.
