# Vercel Agent Skills and Plugin Integration

This repository includes the `vercel-platform` Agent Skill at `.agents/skills/vercel-platform/SKILL.md`. It teaches coding agents how to inspect Vercel configuration, diagnose build failures, deploy safely, and verify production health.

## Install this repository's skill

From the root of a checkout of `Velclaw/VELCLAW`:

```bash
npx skills add Velclaw/VELCLAW --skill vercel-platform
```

The command installs the skill into the supported coding agent's project-level skill directory. Use `--agent` to select a specific supported agent, or `-g` for global installation if appropriate.

## Install the official Vercel plugin

The official Vercel plugin provides a broader set of Vercel product knowledge, agent workflows, commands, and an MCP connection. It is separate from Velclaw's custom skill.

```bash
npx plugins add vercel/vercel-plugin
```

Official source: https://github.com/vercel/vercel-plugin

The plugin requires a supported coding agent and its documented prerequisites. Review the upstream README before installation. Its MCP integration may access account resources and can perform writes; authenticate only the intended account/team, review available tools, and approve consequential operations explicitly.

## Install a focused Vercel skill collection

The open Agent Skills CLI can also install Vercel-maintained skills:

```bash
npx skills add vercel-labs/agent-skills
```

To list skills before installing:

```bash
npx skills add vercel-labs/agent-skills --list
```

Official source: https://github.com/vercel-labs/agent-skills

## Safety and verification

- Never commit provider tokens, OAuth secrets, database URLs, or environment-variable values.
- Do not claim a deployment is complete until the provider reports `READY` and the deployed URL/health checks pass.
- Inspect deployment logs before modifying configuration.
- Keep custom Velclaw MCP access read-only until server-side authorization and explicit write approvals are implemented and tested.
