# Velclaw production operations

## Required environment

Configure the existing application database, authentication, sandbox provider, Gito provider, and GitHub integration according to the repository's environment configuration.

## Release gate

A release is accepted only when:

- dependencies install from the lockfile;
- typecheck passes;
- lint passes;
- production build passes;
- E2E/integration tests pass when configured;
- database migrations are applied successfully;
- a real sandbox task completes;
- Gito produces a review snapshot;
- the gate blocks a known high/critical finding;
- the gate permits a clean review with passing CI;
- GitHub PR creation and check-run status are observed end-to-end.

Do not mark a deployment healthy based only on UI state.
