# Velclaw MCP (Cloudflare)

Velclaw MCP is published through the Cloudflare MCP Portal at:

- **MCP endpoint:** `https://mcp.velclaw.site/mcp`
- **Transport:** MCP Streamable HTTP
- **Authentication:** Cloudflare Access sign-in; access is limited to Cloudflare account members by policy
- **Current tools:** `velclaw_mcp_status`, `velclaw_mcp_capabilities`
- **Write operations:** disabled. Do not add mutating tools until an explicit approval workflow is implemented and tested.

## Connect from Velclaw Agent

1. Open **MCP Servers** in Velclaw.
2. Select **Manage MCP**.
3. Choose the **Velclaw MCP** remote connector preset.
4. Save the connector for the user/workspace.
5. Start an agent task with an MCP-capable CLI (Gemini, Claude, Copilot, or another supported agent). The CLI should complete Cloudflare Access sign-in when prompted.

The preset intentionally does not include client secrets or bearer tokens.

## Connect another MCP client

For clients with remote MCP + OAuth support, add this server URL:

`https://mcp.velclaw.site/mcp`

For clients that need a local stdio bridge, use `mcp-remote`:

```json
{
  "mcpServers": {
    "velclaw": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.velclaw.site/mcp"]
    }
  }
}
```

On first connection, complete the Cloudflare Access sign-in flow in the browser. Do not place OAuth access tokens or client secrets in this file.

## Verification and security

Cloudflare's MCP server sync successfully negotiated the protocol and discovered both tools. The portal is configured with Code Mode off and an account-member-only Access policy.

The upstream currently exposes read-only status/capability data only. There are no DNS, deployment, database, shell, or repository mutation tools. Add an approval queue and authorization checks before exposing any write-capable tool.
