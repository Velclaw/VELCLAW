# Velclaw ecosystem scope

## Keep now

These capabilities directly support the current production workflow:

- GitHub Cloud: source control, branches, commits, pull requests and checks.
- Vercel Cloud: current authentication/workspace identity.
- MCP: agent tools, resources and prompts.
- API Keys: provider credential management.
- Ollama: local-agent execution path.
- Git worktree isolation: safe parallel workspaces.
- Gito review: AI review and Gate input.
- curl: sandboxed HTTP/HTTPS network execution.
- MDN: web-platform reference resolution.
- IBM Cloud: cloud-provider adapter boundary.
- Velclaw Skills: extension mechanism for reusable capabilities.
- Velclaw Wiki: operational knowledge layer.

## Remove from the current core registry

GitLab Cloud, Bitbucket Cloud, Azure DevOps and a separate Claude skill catalog are not part of the current core registry. They can be reintroduced later when there is a concrete production use case and adapter implementation.

## Rule

Do not add an integration merely because it is popular. Add it when it removes a real bottleneck in the Velclaw Task → Executor → Review → Gate → GitHub workflow or materially improves the platform's extensibility/security.
