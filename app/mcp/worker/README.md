# Velclaw MCP Worker

This is a standalone Cloudflare Worker project. `workers.dev` is the public hostname Cloudflare assigns after deployment; it is not a folder in this repository.

## Tools

- `ping` — returns `pong`
- `echo` — returns the provided message
- `get_time` — returns the current time in ISO 8601 UTC format

## Local test

From this directory:

```sh
npm install
npm run typecheck
npm run dev
```

Wrangler normally serves the Worker at `http://localhost:8787`. Check `GET /health`, then connect an MCP Inspector to `http://localhost:8787/mcp` and call each tool.

## Deploy

After local checks pass and Wrangler is authenticated to the intended Cloudflare account:

```sh
npm run deploy
```

Cloudflare will print the assigned `https://velclaw-mcp-worker.<account-subdomain>.workers.dev` hostname. The MCP endpoint will be `/mcp`.

## Authentication

To require a bearer token, run:

```sh
npx wrangler secret put MCP_AUTH_TOKEN
```

The Worker will then require `Authorization: Bearer <token>` on `/mcp`. Do not commit the token. Before enabling this on the MCP Portal, verify that the portal can attach the required Authorization header; otherwise the portal connection will fail. The sample tools are non-sensitive and authentication is optional until that compatibility check is complete.

`/health` deliberately reports only whether authentication is configured; it does not expose the secret.
