# Velclaw Skills

Velclaw Skills are reusable agent capabilities, instructions, and workflows. They sit inside the canonical Velclaw execution pipeline; they do not create a parallel orchestration system.

## Pipeline

```text
Task → Skill selection → Executor → Review → Gate → GitHub API → PR
```

The skill layer is responsible for capability selection and execution guidance. The existing Task, Executor, Review, Gate, and GitHub API layers remain the source of truth for their respective responsibilities.

## Skills vs. adjacent systems

| Surface | Responsibility |
|---|---|
| Velclaw Skills | Reusable capabilities, instructions, workflows |
| Velclaw Plugins | External integrations and connectors |
| Velclaw MCP | Protocol/runtime interface for tools, resources and prompts |
| Velclaw Executor | Runs the selected task/skill in an approved workspace |
| Velclaw Review | Produces review evidence/findings |
| Velclaw Gate | Enforces quality/policy checks |
| GitHub API | Branch, commit, checks and PR delivery |

## Canonical registry

`lib/velclaw/skills.ts` is the single metadata registry. Every skill declares:

- stable `id`
- semantic `version`
- description and capabilities
- supported agents
- Executor binding
- sandbox boundary
- requested permissions
- source identifier

The registry is intentionally metadata-only. It contains no API keys, access tokens, passwords, or other credentials.

## Initial skill set

- `velclaw-task-planning` — task decomposition and acceptance criteria.
- `velclaw-code-change` — repository code-change workflow.
- `velclaw-pr-review` — review findings and Gate input.
- `velclaw-github-delivery` — branch/commit/check/PR delivery guidance.
- `velclaw-mcp-operation` — reusable MCP-oriented operations.

## UI

`/skills` is the canonical **Velclaw Skills** control-plane page. It links the Skills layer to Task, Executor/Dashboard, Plugins, MCP, Review/QA, Gate/Docs, GitHub delivery, API Keys, and the ecosystem gateway.

## Runtime boundary

The current implementation exposes the registry and contract surface. It does not pretend that install/remove/enable or arbitrary runtime execution exists. Those operations must be implemented against a real backend and validated through the same branch → CI/check → PR → review → merge flow.
