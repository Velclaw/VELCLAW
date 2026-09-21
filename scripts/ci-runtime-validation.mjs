import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = ['package.json','pnpm-lock.yaml','next.config.ts','Dockerfile','deploy/docker-compose.selfhosted.yml','deploy/publisher.Dockerfile','deploy/runtime-publisher.mjs','deploy/kubernetes-publisher.mjs','deploy/kubernetes-publisher-v2.mjs','deploy/kubernetes-publisher.Dockerfile','deploy/kubernetes/namespace.yaml','deploy/kubernetes/publisher-rbac.yaml','deploy/kubernetes/velclaw.yaml','deploy/kubernetes/publisher.yaml','deploy/kubernetes/kustomization.yaml','deploy/traefik.yml','app','components','server','.github/workflows/kubeops-bootstrap-secrets.yml']
const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)))
if (missing.length) { console.error(`Runtime validation failed. Missing: ${missing.join(', ')}`); process.exit(1) }
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))
for (const name of ['build','type-check']) if (!pkg.scripts?.[name]) { console.error(`Runtime validation failed. Missing package script: ${name}`); process.exit(1) }
if (fs.existsSync(path.join(root,'vercel.json'))) { console.error('Runtime validation failed: legacy Vercel deployment configuration is not part of Velclaw self-hosted runtime.'); process.exit(1) }
const config = read('next.config.ts')
if (/output\s*:\s*['"]export['"]/.test(config)) { console.error('Runtime validation failed: Next.js static export is incompatible with Velclaw server/API routes.'); process.exit(1) }
const dockerfile = read('Dockerfile')
for (const token of ['FROM node:22-','pnpm install --frozen-lockfile','pnpm build','EXPOSE 3000','CMD ["pnpm", "start"]']) if (!dockerfile.includes(token)) { console.error(`Runtime validation failed: Dockerfile is missing required contract: ${token}`); process.exit(1) }
const compose = read('deploy/docker-compose.selfhosted.yml')
for (const token of ['velclaw-control-plane:','velclaw-publisher:','velclaw-proxy:','build:','velclaw-runtime']) if (!compose.includes(token)) { console.error(`Runtime validation failed: self-hosted compose is missing required contract: ${token}`); process.exit(1) }
const publisher = read('deploy/runtime-publisher.mjs')
if (!publisher.includes('VELCLAW_PUBLIC_DOMAIN') || !publisher.includes('traefik.http.routers.')) { console.error('Runtime validation failed: Docker fallback publisher is missing first-party domain or Traefik routing contract.'); process.exit(1) }
const k8sPublisher = read('deploy/kubernetes-publisher-v2.mjs')
for (const token of ['KUBERNETES_SERVICE_HOST','VELCLAW_DEPLOY_API_TOKEN','batch/v1','apps/v1','networking.k8s.io','gcr.io/kaniko-project/executor','velclaw-registry','velclaw-github','imagePullSecrets','operation === \'rollback\'']) if (!k8sPublisher.includes(token)) { console.error(`Runtime validation failed: Kubernetes publisher is missing required contract: ${token}`); process.exit(1) }
if (!k8sPublisher.includes('velclaw product domain') && !k8sPublisher.includes('Velclaw product domain')) { console.error('Runtime validation failed: Kubernetes publisher must enforce the Velclaw product-domain boundary.'); process.exit(1) }
const rbac = read('deploy/kubernetes/publisher-rbac.yaml')
for (const token of ['kind: ServiceAccount','kind: Role','kind: RoleBinding','resources: ["secrets"]','resources: ["pods"]','resources: ["deployments"]','resources: ["jobs"]','resources: ["services"]','resources: ["ingresses"]']) if (!rbac.includes(token)) { console.error(`Runtime validation failed: publisher RBAC is missing required least-privilege contract: ${token}`); process.exit(1) }
if (rbac.includes('resources: ["secrets", "configmaps", "services", "pods"]') || rbac.includes('verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]')) { console.error('Runtime validation failed: publisher RBAC still grants broad secret/resource mutation permissions.'); process.exit(1) }
const kustomization = read('deploy/kubernetes/kustomization.yaml')
for (const token of ['namespace.yaml','publisher-rbac.yaml','velclaw.yaml','publisher.yaml']) if (!kustomization.includes(token)) { console.error(`Runtime validation failed: Kubernetes kustomization is missing: ${token}`); process.exit(1) }
const claim = read('app/api/deployments/claim/route.ts')
for (const token of ['claimNextDeployment()','authorization','Unauthorized']) if (!claim.includes(token)) { console.error(`Runtime validation failed: deployment claim contract is missing: ${token}`); process.exit(1) }
const store = read('lib/deploy/store.ts')
for (const token of ["status='queued'","status='building'","SKIP LOCKED","interval '30 minutes'"]) if (!store.includes(token)) { console.error(`Runtime validation failed: deployment queue recovery is missing: ${token}`); process.exit(1) }
const rollback = read('app/api/deployments/[id]/rollback/route.ts')
for (const token of ['getServerSession','queueRollback','Unauthorized']) if (!rollback.includes(token)) { console.error(`Runtime validation failed: rollback authorization/queue contract is missing: ${token}`); process.exit(1) }
const deploymentApi = read('app/api/deployments/route.ts')
for (const token of ['github\\.com','velclaw\\.cfd','getServerSession','createHostingDeployment']) if (!deploymentApi.includes(token)) { console.error(`Runtime validation failed: deployment API contract is missing: ${token}`); process.exit(1) }
const bootstrap = read('.github/workflows/kubeops-bootstrap-secrets.yml')
for (const token of ['KUBEOPS_KUBECONFIG_B64','velclaw-runtime','velclaw-github','velclaw-registry','github.token','packages: write']) if (!bootstrap.includes(token)) { console.error(`Runtime validation failed: KubeOps secret bootstrap is missing required contract: ${token}`); process.exit(1) }
console.log('Runtime validation passed: Velclaw deployment queue, stale-claim recovery, rollback authorization, canonical Kubernetes publisher, domain isolation, private image pulls, secret bootstrap, and least-privilege RBAC contracts are present.')
