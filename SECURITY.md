# Security Policy

## Scope

Velclaw source code, workflows, deployment configuration, and project secrets are treated as protected project assets.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Report it privately to the repository owner through GitHub's private security reporting channel when available.

If private vulnerability reporting is not enabled, contact the repository owner directly through GitHub before disclosing details publicly.

## Repository security baseline

- `main` is the protected source-of-truth branch.
- Changes to protected paths should arrive through pull requests.
- CI/security checks must pass before merging.
- Secrets must be stored only in GitHub Actions Secrets or environment-specific secret stores; never commit credentials, API keys, or `.env` files.
- Review workflow changes carefully because GitHub Actions can access repository data and, when granted, secrets.
- Production/deployment credentials must use the minimum permissions required.

## Secret handling

If a secret is accidentally committed, revoke/rotate it immediately. Removing the file in a later commit does not remove the secret from Git history.

## Maintainer note

Repository visibility, branch protection/rulesets, and GitHub security-analysis features are account-level repository settings and should be enforced in GitHub Settings in addition to the checks stored in this repository.
