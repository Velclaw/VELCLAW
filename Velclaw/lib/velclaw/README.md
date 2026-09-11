# Velclaw core

This directory contains the small, dependency-free integration boundary used by the Velclaw platform.

## Current primitives

- `integrations.ts` — canonical registry of adapters and their status.
- `integrations/curl.ts` — builds deterministic curl request plans for sandbox execution.
- `integrations/mdn.ts` — resolves common Web Platform topics to canonical MDN references.
- `integrations/ibm-cloud.ts` — builds IBM Cloud API request descriptors without persisting credentials.
- `agents.ts` — validates normalized agent execution requests.
- `worktree.ts` — validates task branch/path input and creates a safe Git worktree command plan.
- `review.ts` — evaluates normalized findings against the merge gate.
- `../sandbox/agents/ollama.ts` — executes an Ollama coding agent inside the existing sandbox boundary.

## Provider boundaries

### curl

Velclaw uses curl as a network execution boundary. The adapter produces an argument array rather than executing a host process. The existing sandbox runner remains responsible for execution, logging, limits, and environment restoration.

### MDN Web Docs

Velclaw treats MDN as an external Web Platform reference. The adapter resolves known concepts and search URLs; it does not mirror or scrape MDN content into the repository.

### IBM Cloud

Velclaw treats IBM Cloud as a provider adapter. The adapter creates authenticated request descriptors from runtime-supplied access tokens. API keys belong in deployment secret storage and must never be committed to source control.

## Integration rule

Adapters should wrap existing capabilities behind stable interfaces. Do not copy entire upstream repositories into the application. Large integrations should land as focused changes with tests and license attribution.

## Execution rule

Velclaw integration code does not execute host processes directly. Agent execution remains inside the configured sandbox/runner, with logs and environment restoration handled by the platform.
