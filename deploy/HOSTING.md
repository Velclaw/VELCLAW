# Velclaw Hosting

Velclaw Hosting is the first-party application hosting layer for the Velclaw ecosystem. It does not use Vercel as the public hosting product or hostname.

## Production runtime

The primary target is **KubeOps Cloud**, using the existing K3s production cluster. The Docker Compose stack remains a compatibility/self-hosted fallback for a single Linux host; it is not the preferred production architecture when a KubeOps Kubernetes cluster is available.

```text
GitHub
  |
  v
Velclaw Control Plane / Webhook
  |
  v
PostgreSQL deployment queue
  |
  v
Kubernetes-native publisher
  |
  v
KubeOps Cloud / K3s
  |
  +--> Deployment -> Pod
  +--> Service -> ClusterIP
  +--> Ingress -> nginx
  +--> cert-manager -> TLS
  |
  v
Cloudflare Edge
  |
  v
velclaw.cfd / *.velclaw.cfd
```

## Kubernetes deployment

The canonical Kubernetes manifests are in `deploy/kubernetes/`:

- `namespace.yaml` — isolated `velclaw-production` namespace.
- `velclaw.yaml` — ServiceAccount, Deployment, Service, HPA, Ingress and PDB.
- `kustomization.yaml` — reproducible Kustomize entrypoint.
- `.github/workflows/kubeops-deploy.yml` — build/push/deploy workflow.

The production Deployment uses the same `/api/health` contract already used by Velclaw runtime validation and deploy configurations. The workload runs as non-root UID/GID `1001`, drops Linux capabilities, and uses Kubernetes rolling updates with `maxUnavailable: 0`.

### Required KubeOps secret

GitHub Actions expects one repository secret:

```text
KUBEOPS_KUBECONFIG_B64
```

It must contain the base64-encoded kubeconfig for the KubeOps production cluster. Do not commit or paste the kubeconfig into the repository.

The application runtime secret is supplied separately in Kubernetes as:

```text
velclaw-production/velclaw-runtime
```

Expected keys depend on the active Velclaw features; at minimum configure the PostgreSQL connection and deployment/authentication secrets required by the application. Kubernetes Secrets are references to runtime configuration, not proof of encryption-at-rest; enable cluster/KMS encryption separately if that guarantee is required.

## Current implementation

- `/hosting` — authenticated Velclaw Hosting control plane.
- `/deploy` — deployment architecture/control-plane overview.
- `/deploy/engine` — deployment queue interface.
- `POST /api/deployments` — authenticated deployment queue API.
- `GET /api/deployments` — deployment history API.
- `deploy/runner.mjs` — worker loop for queued deployments.
- `deploy/runtime-publisher.mjs` — Docker runtime publication fallback.
- `deploy/kubernetes/` — KubeOps Kubernetes production contract.
- `deploy/docker-compose.selfhosted.yml` — single-host fallback stack.
- `deploy/traefik.yml` — reverse-proxy configuration for the fallback stack.

## Production boundary

The canonical Velclaw product host is `velclaw.cfd`. Public deployment hostnames must remain inside the Velclaw namespace, for example `my-app.velclaw.cfd` or a generated preview hostname under `*.velclaw.cfd`.

For KubeOps, the cluster must provide:

1. nginx Ingress Controller.
2. `letsencrypt-prod` cert-manager ClusterIssuer.
3. Metrics API/metrics-server for HPA CPU and memory metrics.
4. A working Kubernetes API endpoint reachable by the deployment workflow.
5. GHCR access for the Velclaw image.
6. PostgreSQL and Redis connectivity required by the application.
7. DNS/Cloudflare routing for `velclaw.cfd` and deployment subdomains.

## Compose fallback

For a Linux host without Kubernetes:

```bash
cd deploy
cp .env.example .env
# edit .env and add real secrets

docker compose -f docker-compose.selfhosted.yml up -d --build
```

The control plane listens internally on port `3000`; Traefik owns public ports `80` and `443`.

## Deployment lifecycle

A deployment starts as `queued`, is claimed by one worker as `building`, and ends as `ready` or `failed`. The PostgreSQL queue uses row locking with `SKIP LOCKED`, allowing multiple workers without claiming the same job.

For Kubernetes production, image publication is pinned to the Git commit SHA and rollout is verified with `kubectl rollout status`. A failed rollout automatically attempts `kubectl rollout undo` before the workflow fails.

## Security rules

- Never commit `.env`, kubeconfigs, registry tokens, or real secrets.
- Never expose `GITHUB_TOKEN`, `KUBEOPS_KUBECONFIG_B64`, or `VELCLAW_DEPLOY_API_TOKEN` to client-side code.
- Do not grant the web UI direct Kubernetes API or Docker socket access.
- Keep deployment workers isolated from the public application process.
- Use Kubernetes RBAC with the smallest practical permissions for production automation.
- Only publish URLs generated inside the configured Velclaw domain boundary.
- Validate GitHub repository URLs before queueing a deployment.
