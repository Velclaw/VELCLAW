# Velclaw review gate

Velclaw uses Gito as the first CI review adapter for pull requests.

## Required secret

Configure the repository secret `LLM_API_KEY` with the key for the selected LLM provider.

Optional repository variables:

- `LLM_API_TYPE` — defaults to `openai`.
- `LLM_MODEL` — defaults to `gpt-5.5`.

## Workflow

`.github/workflows/velclaw-review.yml` runs Gito on pull-request events, posts the review to the PR, and stores the generated reports as workflow artifacts.

The application-level `ReviewGate` remains the deterministic policy layer: `critical` and `high` findings are blocking. The CI workflow is deliberately provider-specific while the application contract stays provider-neutral.

## Security

Secrets are read from GitHub Actions secrets and environment variables. They are not committed to the repository or placed in command-line arguments.
