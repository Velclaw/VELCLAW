# Velclaw

Velclaw is the unified ZSKBOT AI coding-agent platform.

## Product direction

Velclaw combines repository-aware coding agents, isolated workspaces, Git automation, pull requests, AI code review, local LLM support, MCP, extensible skills, and deployment control behind one workflow.

## Core workflow

1. Authenticate and select a repository.
2. Create a task and isolated agent workspace.
3. Select a cloud or local coding agent.
4. Select the applicable Velclaw Skill.
5. Let the agent inspect, modify, and test the code.
6. Review the diff and AI findings.
7. Commit and push a dedicated branch.
8. Open a pull request.
9. Run automated quality/security review.
10. Merge only when configured checks and review gates pass.
11. Use **Velclaw Deploy** (`/deploy`) to prepare release delivery and verify deployment evidence.

## Integration plan

- `coding-agent-platform`: application and orchestration foundation.
- `Gito`: AI code-review integration.
- `code-ollama`: local Ollama coding-agent integration.
- `git-worktree-runner`: isolated Git workspaces.
- `skills` / `awesome-claude-skills`: extensible agent skills.
- `SandboxCode`: selected documentation, CI/CD, and deployment patterns.
- `rikkahub-agent`: selected agent/tool/approval architecture patterns; Android-specific implementation remains separate.
- `docs-web`: Velclaw product documentation and website content.

## Principles

- Reuse capabilities, not entire unrelated repositories.
- Preserve upstream licenses and attribution.
- Keep secrets out of source control.
- Isolate agent execution from the application host.
- Require explicit approval for destructive or privileged actions.
- Prefer small, testable adapters over tightly coupled integrations.
- Treat `velclaw.com` as the sole canonical Velclaw host.
- Public preview/release URLs must use the Velclaw-owned `*.velclaw.dev` namespace.
- Platform-generated deployment hostnames are infrastructure details and must never be presented as Velclaw product URLs.

## Deployment

**Velclaw Deploy** is the dedicated deployment control plane. It does not create a second task/executor pipeline. The canonical delivery path is:

`Task → Skill selection → Executor → Review → Gate → GitHub API → PR → Deployment evidence`

Production URL: `https://velclaw.com`

Preview URL pattern: `https://<velclaw-deployment-name>.velclaw.com`

Deployment success must be backed by real deployment/GitHub evidence; opening the Deploy page alone never constitutes a successful deployment. DNS and deployment-provider routing for the `*.velclaw.dev` namespace are infrastructure configuration, not application state.

## Initial milestone

Establish a clean platform shell, provider abstraction, repository/task workflow, isolated execution, GitHub branch/PR automation, an optional AI review pipeline, and a dedicated deployment evidence surface. Later milestones add richer deployment automation and observability.
