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
  +--> Kubernetes Job -> Git checkout -> generated Dockerfile -> Kaniko -> GHCR
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
- `velclaw.yaml` — Velclaw control-plane ServiceAccount, Deployment, Service, HPA, Ingress and PDB.
- `publisher-rbac.yaml` — namespace-scoped least-privilege RBAC for the native publisher.
- `publisher.yaml` — Kubernetes publisher Deployment; it has no Docker socket access.
- `kustomization.yaml` — reproducible Kustomize entrypoint.
- `deploy/kubernetes-publisher.mjs` — deployment worker using the Kubernetes API.
- `deploy/kubernetes-publisher.Dockerfile` — publisher image definition.
- `.github/workflows/kubeops-deploy.yml` — build/push/deploy workflow for both control plane and publisher images.

The production Deployment uses the same `/api/health` contract already used by Velclaw runtime validation and deploy configurations. The workload runs as non-root UID/GID `1001`, drops Linux capabilities, and uses Kubernetes rolling updates with `maxUnavailable: 0`.

### Required GitHub Actions secret

GitHub Actions expects:

```text
KUBEOPS_KUBECONFIG_B64
```

It must contain the base64-encoded kubeconfig for the KubeOps production cluster. Do not commit or paste the kubeconfig into the repository.

### Required Kubernetes secrets

Create these in `velclaw-production` before enabling the publisher:

```text
velclaw-runtime
velclaw-github
velclaw-registry
```

`velclaw-runtime` is consumed by the Velclaw control plane. It must contain the real application runtime configuration, including `POSTGRES_URL` and `VELCLAW_DEPLOY_API_TOKEN` where those values are required by the active deployment API.

`velclaw-github` must contain:

```text
token=<GitHub token with the minimum repository read scope needed for private source checkouts>
```

`velclaw-registry` must be a Kubernetes Docker registry secret containing `.dockerconfigjson` credentials that allow the Kaniko build Job to push to the configured registry (`ghcr.io/velclaw` by default).

Never commit these secrets. Never put them in GitHub source files or browser/client bundles.

## Native publisher behavior

`deploy/kubernetes-publisher.mjs` claims the same PostgreSQL deployment queue used by the existing API. For each job it:

1. Creates a namespace-scoped Kubernetes `Job`.
2. Checks out the requested Git branch/commit in an ephemeral `emptyDir` volume.
3. Generates a minimal Node Dockerfile when the source repository has no Dockerfile but has a supported build script.
4. Builds and pushes the image with Kaniko; no Docker daemon and no Docker socket are required.
5. Creates/updates an application Secret, Deployment, Service and Ingress.
6. Publishes the resulting `https://<project>-<deployment>.velclaw.cfd` runtime URL to the deployment API.
7. Reports build/deployment errors back to the same queue record.

Private repositories require `velclaw-github`. Public repositories can still use the same path; the token is retained for consistent private-repository support. The registry secret is always required because the runtime image is pushed to GHCR before the application rollout.

The application workload is isolated by generated Kubernetes resource names and labels. Publisher permissions are limited to the `velclaw-production` namespace; the publisher does not receive cluster-admin or node-level privileges.

## Production boundary

The canonical Velclaw product host is `velclaw.cfd`. Public deployment hostnames must remain inside the Velclaw namespace, for example `my-app.velclaw.cfd` or a generated deployment hostname under `*.velclaw.cfd`.

For KubeOps, the cluster must provide:

1. nginx Ingress Controller.
2. `letsencrypt-prod` cert-manager ClusterIssuer.
3. Metrics API/metrics-server for HPA CPU and memory metrics.
4. A working Kubernetes API endpoint reachable by the deployment workflow.
5. GHCR access for both the Velclaw control-plane and publisher images.
6. Kubernetes secrets `velclaw-runtime`, `velclaw-github`, and `velclaw-registry`.
7. PostgreSQL and Redis connectivity required by the application.
8. DNS/Cloudflare routing for `velclaw.cfd` and deployment subdomains.

## Compose fallback

For a Linux host without Kubernetes:

```bash
cd deploy
cp .env.example .env
# edit .env and add real secrets

docker compose -f docker-compose.selfhosted.yml up -d --build
```

The Compose publisher remains a compatibility fallback and retains Docker socket access. The Kubernetes production publisher does not.

## Deployment lifecycle

A deployment starts as `queued`, is claimed by one worker as `building`, and ends as `ready` or `failed`. The PostgreSQL queue uses row locking with `SKIP LOCKED`, allowing multiple workers without claiming the same job.

For Kubernetes production, image publication is pinned to the deployment ID/commit and the Velclaw control-plane workflow pins its own production image to the Git commit SHA. Application build Jobs use ephemeral source storage and are automatically garbage-collected after completion.

The GitHub Actions workflow also verifies the control-plane and publisher rollout. A failed control-plane or publisher rollout attempts `kubectl rollout undo` before the workflow fails.

## Security rules

- Never commit `.env`, kubeconfigs, registry tokens, GitHub tokens, or real secrets.
- Never expose `GITHUB_TOKEN`, `KUBEOPS_KUBECONFIG_B64`, or `VELCLAW_DEPLOY_API_TOKEN` to client-side code.
- Do not grant the web UI direct Kubernetes API or Docker socket access.
- Keep deployment workers isolated from the public application process.
- Use namespace-scoped Kubernetes RBAC with the smallest practical permissions for production automation.
- Do not give the Kubernetes publisher host-level Docker access.
- Only publish URLs generated inside the configured Velclaw domain boundary.
- Validate GitHub repository URLs before queueing a deployment.
