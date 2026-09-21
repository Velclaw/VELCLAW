# Security Policy

Velclaw Docs is a protected project asset. The public website may be intentionally accessible, but source, workflows, deployment configuration, and credentials must remain protected.

## Reporting

Do not publish suspected vulnerabilities in a public issue. Use GitHub's private security reporting channel when available, or contact the repository owner privately.

## Baseline

- `main` is the source-of-truth branch for the published documentation.
- UI changes should be reviewed through pull requests before reaching `main`.
- Deployment workflow changes require explicit review.
- Never commit API keys, access tokens, passwords, private keys, `.env` files, or other credentials.
- Keep GitHub Actions permissions minimal.
- The public Pages site is separate from the confidentiality of the source repository.

## Secret handling

If a secret is committed, rotate/revoke it immediately. A later deletion does not remove the secret from Git history.

## Maintainer note

Repository visibility and branch protection/rulesets are GitHub repository settings. They must be enforced in GitHub Settings in addition to the security checks stored in this repository.
