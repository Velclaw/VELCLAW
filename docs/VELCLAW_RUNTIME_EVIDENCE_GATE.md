# Velclaw Runtime Readiness & External Evidence Gate

## Purpose

Velclaw treats Git as the source of desired state, not proof that external infrastructure exists.

A component is **Unverified** until an operator supplies evidence produced by the real runtime. The evidence is SHA-256 hashed and stored in PostgreSQL with an attestation identity and timestamp.

UI: `/velclaw/runtime-readiness`

API: `/api/infra/runtime-evidence`

## Evidence components

1. Kubernetes API Server — authenticated API response and node state.
2. PostgreSQL — TCP readiness plus an authenticated SQL query.
3. GitHub credentials — authenticated GitHub API response with the required access.
4. GHCR / OCI Registry — authenticated registry access plus an OCI digest.
5. K3s + WireGuard — node/service state and WireGuard handshake evidence.
6. DNS / Cloudflare — public resolver results.
7. TLS / Let's Encrypt — certificate actually served by the public endpoint.

## State model

- `Declared in Git`: manifests, workflows, Dockerfiles and code exist.
- `Pending external provisioning`: runtime credentials or infrastructure are not proven.
- `Verified · Attested`: an operator submitted runtime output; Velclaw stored its SHA-256 digest and timestamp.

`Verified · Attested` is deliberately not described as an automatic cryptographic proof of the whole infrastructure. The evidence gate proves that a specific output was captured and preserved. Operators must still evaluate whether the output is sufficient for the component being attested.

## Security rules

- Never paste API keys, passwords, kubeconfig contents, private keys or bearer tokens into the evidence field.
- Only command output and other non-secret runtime observations should be submitted.
- Evidence is limited to 32 KiB per component.
- Replacing evidence creates a new hash/timestamp; revoking evidence returns the component to `Unverified`.
- The API requires the normal Velclaw session or `VELCLAW_DEPLOY_API_TOKEN` operator credential.

## Production gate

The evidence page is intentionally separate from GitOps deployment status. A green GitHub workflow must not be presented as proof that Kubernetes, PostgreSQL, DNS, TLS, WireGuard or GHCR are live. Runtime evidence must be collected from the external environment.
