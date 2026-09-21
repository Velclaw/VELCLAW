# Gito adapter validation

The Gito adapter is intentionally thin and sandbox-bound.

Validation checklist:

- `gito review` executes only through the existing sandbox runner.
- Credentials are provisioned through the sandbox environment, never command arguments.
- Review output is normalized into `ReviewFinding` values.
- `critical` and `high` findings block the Velclaw merge gate.
- Provider-specific parsing can evolve without changing the merge gate contract.
