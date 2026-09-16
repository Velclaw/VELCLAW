<div align="center">

<a href="https://github.com/Velclaw/VELCLAW"><img src="assets/velclaw_logo_7color_transparent.gif" alt="Velclaw" width="620"></a>

# Velclaw

**AI-native software workspace for agents, developers, and teams.**

Build, inspect, test, deploy, and operate software from one developer-focused workspace.

<p>
<a href="https://github.com/Velclaw/VELCLAW"><img src="https://img.shields.io/badge/GitHub-Velclaw%2FVELCLAW-111827?style=flat-square&logo=github&logoColor=white"></a>
<a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-Framework-111827?style=flat-square&logo=nextdotjs&logoColor=white"></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Code-3178C6?style=flat-square&logo=typescript&logoColor=white"></a>
<a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Runtime-339933?style=flat-square&logo=nodedotjs&logoColor=white"></a>
</p>

<p><a href="#quick-start">Get started</a> · <a href="#architecture">Architecture</a> · <a href="#capabilities">Capabilities</a> · <a href="#technology-ecosystem">Ecosystem</a> · <a href="#development">Development</a></p>

</div>

---

<div align="center"><img src="assets/velclaw_footer_restored.png" alt="Velclaw animated introduction" width="900"></div>

## What is Velclaw?

Velclaw is an AI-native software workspace focused on the full software lifecycle: **agents, code, projects, builds, runtime, storage, services, review, and deployment**.

The goal is to give coding agents and developers one coherent environment instead of forcing every workflow through disconnected tools.

> **Build software. Give agents context. Keep the workflow together.**

## Architecture

```text
                         ┌─────────────────────────┐
                         │       AI AGENTS         │
                         │ models · tools · tasks  │
                         └────────────┬────────────┘
                                      │
                                      ▼
┌──────────────────┐       ┌─────────────────────────┐       ┌──────────────────┐
│ Projects & Files │ ◄──── │    VELCLAW WORKSPACE    │ ────► │ Build & Runtime  │
│ code · context   │       │ projects · code · state │       │ build · execute  │
└──────────────────┘       └────────────┬────────────┘       └──────────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                    ┌─────────┐   ┌──────────┐   ┌─────────────┐
                    │ Storage │   │ GitHub   │   │ Deployment  │
                    │ data    │   │ review   │   │ delivery    │
                    └─────────┘   └──────────┘   └─────────────┘
```

## Capabilities

| Area | Purpose |
| --- | --- |
| **AI Agents** | Agent-driven development workflows and tool execution |
| **Workspace** | Projects, files, code, persistent context and state |
| **Build** | Build, validate and package software |
| **Runtime** | Execute workloads and development processes |
| **Storage** | Persist application data and files |
| **GitHub** | Repository integration, code review and delivery workflows |
| **Deployment** | Move validated software toward production |
| **Developer UI** | A single workspace for the software lifecycle |

## Product URLs

The documented product surface uses **`velclaw.cfd`** as the canonical host. Deployment-generated Vercel hostnames are infrastructure addresses, not canonical product identity.

| Product surface | Canonical URL |
| --- | --- |
| Velclaw | `https://velclaw.cfd/` |
| Velclaw Docs | `https://velclaw.cfd/docs` |
| VelclawHub | `https://velclaw.cfd/velclawhub` |
| VelclawHub Ecosystem | `https://velclaw.cfd/hub` |
| Velclaw Deploy | `https://velclaw.cfd/deploy` |
| Velclaw Skills | `https://velclaw.cfd/skills` |

## Repository

The canonical repository is **`Velclaw/VELCLAW`** on the `main` branch. Other Velclaw repositories are preserved and integrated through explicit contracts or the controlled consolidation workflow.

## Quick start

```bash
git clone https://github.com/Velclaw/VELCLAW.git
cd VELCLAW
pnpm install
pnpm dev
```

Validation:

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

## Security

Do not commit credentials, API keys, OAuth secrets, database URLs or private deployment tokens. Migration workflows intentionally exclude sensitive files such as `users.json`, `.env*`, private keys and certificate material.
