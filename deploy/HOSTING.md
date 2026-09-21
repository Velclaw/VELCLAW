# Velclaw Hosting

Velclaw Hosting is the first-party application hosting layer for the Velclaw ecosystem. It does not use Vercel as the public hosting product or hostname.

## Production runtime

The primary target is **KubeOps Cloud**, using the existing K3s production cluster. The Docker Compose stack remains a compatibility/self-hosted fallback for a single Linux host; it is not the preferred production architecture when a KubeOps Kubernetes cluster is available.

```text
GitHub -> Velclaw Control Plane/Webhook -> PostgreSQL queue -> Kubernetes publisher
                                                       -> Job -> Kaniko -> GHCR
                                                       -> Deployment -> Service -> Ingress -> TLS
Cloudflare Edge -> velclaw.com / *.velclaw.dev
```

## Kubernetes deployment

Canonical manifests live in `deploy/kubernetes/`. The production publisher implementation is `deploy/kubernetes-publisher-v2.mjs`; `deploy/kubernetes-publisher.Dockerfile` packages that file. The publisher uses the Kubernetes API and has no Docker socket access. `publisher-rbac.yaml` is namespace-scoped least-privilege RBAC and `kustomization.yaml` is the deployment entrypoint.

The production workflow `.github/workflows/kubeops-deploy.yml` validates the application, builds and pushes both Velclaw and publisher images, applies Kustomize, then waits for both rollouts. Failed rollouts attempt an undo before the workflow exits unsuccessfully.

### Required GitHub Actions secret

```text
KUBEOPS_KUBECONFIG_B64
```

This is the base64-encoded kubeconfig for the KubeOps production cluster. Keep it only in GitHub Actions secrets.

### Required Kubernetes secrets

These are created out of band by `.github/workflows/kubeops-bootstrap-secrets.yml` and are intentionally not represented as Kubernetes Secret manifests with values:

```text
velclaw-production/velclaw-runtime
velclaw-production/velclaw-github
velclaw-production/velclaw-registry
```

See `deploy/kubernetes/runtime-secrets.example.yaml` for the non-secret bootstrap template.

Required keys:

| Secret | Key | Purpose |
|---|---|---|
| `velclaw-runtime` | `POSTGRES_URL` | PostgreSQL deployment queue/runtime |
| `velclaw-runtime` | `VELCLAW_DEPLOY_API_TOKEN` | authenticated publisher/control-plane callback |
| `velclaw-github` | `token` | GitHub repository-read token for private source checkout |
| `velclaw-registry` | `.dockerconfigjson` | GHCR push/pull credentials for Kaniko and application pods |

The publisher can read only the named runtime secrets and can mutate only Secrets, Jobs, Deployments, Services and Ingresses in its own namespace. It has no cluster-admin, node or Docker-daemon permissions.

## Native publisher lifecycle

1. A deployment enters PostgreSQL as `queued`.
2. Exactly one worker claims it with a row lock and changes it to `building`.
3. Stale `building` claims are automatically re-queued after the lease timeout.
4. The worker creates an ephemeral Kubernetes Job.
5. The Job checks out the requested Git branch/commit.
6. If needed, a minimal Node Dockerfile is generated; an existing Dockerfile is preserved.
7. Kaniko builds and pushes the immutable deployment image to GHCR.
8. The publisher creates/updates the application Secret, stable Deployment, Service and Ingress.
9. The publisher waits for Kubernetes readiness before reporting `ready`.
10. Build or rollout failure is reported as `failed` with bounded logs.
11. Rollback is represented as a new queue operation targeting the previous ready deployment image, so the public application identity remains stable.

The application URL remains within the configured Velclaw product domain. The API rejects non-Velclaw runtime URLs and rejects deployment repositories outside HTTPS GitHub URLs.

## Production prerequisites

KubeOps must provide:

- nginx Ingress Controller
- cert-manager with `letsencrypt-prod`
- Kubernetes Metrics API/metrics-server for HPA
- reachable Kubernetes API for GitHub Actions
- GHCR access
- PostgreSQL and Redis connectivity required by Velclaw
- DNS/Cloudflare routing for `velclaw.com` and `*.velclaw.dev`
- the three runtime Secrets listed above

These prerequisites are infrastructure state; repository manifests alone do not prove that the cluster is live.

## Compose fallback

For a Linux host without Kubernetes:

```bash
cd deploy
cp .env.example .env
# add real secrets to .env

docker compose -f docker-compose.selfhosted.yml up -d --build
```

The Compose publisher remains a compatibility fallback and may use the Docker socket. The Kubernetes production publisher does not.

## Security rules

- Never commit `.env`, kubeconfigs, registry tokens, GitHub tokens, or real secrets.
- Never expose deployment tokens or kubeconfigs to browser/client code.
- Do not give the web UI Kubernetes API or Docker socket access.
- Keep deployment workers isolated from the public application process.
- Keep publisher RBAC namespace-scoped.
- Validate repository URLs, branch names, environment variable names and deployment domains before queueing.
- Keep deployment logs bounded and do not echo secret values.
- Only publish URLs inside the Velclaw product domain.
