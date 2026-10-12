# Velclaw Dashboard

![Velclaw Logo](./assets/logo.png)

**AI-native Control Center** — Layout inspired by Cursor, built for the Velclaw ecosystem.

> Publisher: **Huỳnh Thương**  
> Domain: `velclaw.cfd` (canonical) · MCP: `mcp.velclaw.site`

---

## Overview

Velclaw Dashboard is the unified workspace for agents, deployments, MCP servers, and ecosystem tools.  
Dark theme, violet accent, monospace typography — fully compliant with `DESIGN_SYSTEM.md`.

### Quick Start

```bash
git clone https://github.com/Velclaw/VELCLAW.git
cd VELCLAW/dashboard-skeleton
npm install
npm run dev
```

![Demo](https://user-images.githubusercontent.com/placeholder/demo.gif)

Open [http://localhost:3000](http://localhost:3000)

---

## Features

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing & overview |
| Docs | `/docs` | System documentation |
| Auth | `/auth` | Cloudflare Access / Cursor OIDC |
| Dashboard | `/dashboard` | Deployments, agents, usage |
| Chatbot | `/chatbot` | Multi-channel chat interface |
| CodeHub | `/work/agent/chat/codehub` | Agent + code workspace |
| VelclawHub | `/VelclawHub` | Skills, plugins, channels |
| MCP | `/mcp.velclaw.com` | MCP server status & tools |
| API | `/api.velclaw.com` | API gateway |

---

## Architecture

```
sidebar (nav)  →  main content  →  agent chat panel
```

- React 18 + Vite + React Router
- CSS variables from design tokens
- Ready for MCP tool integration

---

## Sponsors & Partners

| | |
|---|---|
| ![GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png) | **GitHub** — Source control & CI |
| ![Vercel](https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png) | **Vercel** — Deployment platform |
| ![Cloudflare](https://www.cloudflare.com/img/logo-cloudflare-dark.svg) | **Cloudflare** — MCP Portal & Access |

---

## Open Source Libraries

Built with the open source community:

- [React](https://react.dev) — UI library
- [Vite](https://vitejs.dev) — Build tool
- [React Router](https://reactrouter.com) — Routing
- [Model Context Protocol](https://modelcontextprotocol.io) — Agent tools

> Thousands of libraries power the ecosystem. See `package.json` for the full list.

---

## Publisher

**Huỳnh Thương**  
Velclaw Ecosystem Maintainer

---

## License

See [LICENSE](../LICENSE) in the root repository.

---

## Related

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- [docs/integrations/velclaw-mcp.md](../docs/integrations/velclaw-mcp.md)
- [AgentsIDE](../AgentsIDE/)
