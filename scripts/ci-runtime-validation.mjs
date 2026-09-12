import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = ['package.json','pnpm-lock.yaml','next.config.ts','Dockerfile','deploy/docker-compose.selfhosted.yml','deploy/publisher.Dockerfile','deploy/runtime-publisher.mjs','deploy/kubernetes-publisher.mjs','deploy/kubernetes-publisher.Dockerfile','deploy/kubernetes/namespace.yaml','deploy/kubernetes/publisher-rbac.yaml','deploy/kubernetes/velclaw.yaml','deploy/kubernetes/publisher.yaml','deploy/kubernetes/kustomization.yaml','deploy/traefik.yml','app','components','server']
const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)))
if (missing.length) { console.error(`Runtime validation failed. Missing: ${missing.join(', ')}`); process.exit(1) }
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
for (const name of ['build','type-check']) if (!pkg.scripts?.[name]) { console.error(`Runtime validation failed. Missing package script: ${name}`); process.exit(1) }
if (fs.existsSync(path.join(root,'vercel.json'))) { console.error('Runtime validation failed: legacy Vercel deployment configuration is not part of Velclaw self-hosted runtime.'); process.exit(1) }
const config = fs.readFileSync(path.join(root,'next.config.ts'),'utf8')
if (/output\s*:\s*['"]export['"]/.test(config)) { console.error('Runtime validation failed: Next.js static export is incompatible with Velclaw server/API routes.'); process.exit(1) }
const dockerfile = fs.readFileSync(path.join(root,'Dockerfile'),'utf8')
for (const token of ['FROM node:22-','pnpm install --frozen-lockfile','pnpm build','EXPOSE 3000','CMD ["pnpm", "start"]']) if (!dockerfile.includes(token)) { console.error(`Runtime validation failed: Dockerfile is missing required contract: ${token}`); process.exit(1) }
const compose = fs.readFileSync(path.join(root,'deploy/docker-compose.selfhosted.yml'),'utf8')
for (const token of ['velclaw-control-plane:','velclaw-publisher:','velclaw-proxy:','build:','velclaw-runtime']) if (!compose.includes(token)) { console.error(`Runtime validation failed: self-hosted compose is missing required contract: ${token}`); process.exit(1) }
const publisher = fs.readFileSync(path.join(root,'deploy/runtime-publisher.mjs'),'utf8')
if (!publisher.includes('VELCLAW_PUBLIC_DOMAIN') || !publisher.includes('traefik.http.routers.')) { console.error('Runtime validation failed: Docker fallback publisher is missing first-party domain or Traefik routing contract.'); process.exit(1) }
const k8sPublisher = fs.readFileSync(path.join(root,'deploy/kubernetes-publisher.mjs'),'utf8')
for (const token of ['KUBERNETES_SERVICE_HOST','VELCLAW_DEPLOY_API_TOKEN','batch/v1','apps/v1','networking.k8s.io','gcr.io/kaniko-project/executor','velclaw-registry','velclaw-github']) if (!k8sPublisher.includes(token)) { console.error(`Runtime validation failed: Kubernetes publisher is missing required contract: ${token}`); process.exit(1) }
const rbac = fs.readFileSync(path.join(root,'deploy/kubernetes/publisher-rbac.yaml'),'utf8')
for (const token of ['kind: ServiceAccount','kind: Role','kind: RoleBinding','resources: ["secrets"]','verbs: ["get"]','resources: ["deployments"]','resources: ["jobs"]','resources: ["services"]','resources: ["ingresses"]']) if (!rbac.includes(token)) { console.error(`Runtime validation failed: publisher RBAC is missing required least-privilege contract: ${token}`); process.exit(1) }
if (rbac.includes('resources: ["secrets", "configmaps", "services", "pods"]') || rbac.includes('verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]')) { console.error('Runtime validation failed: publisher RBAC still grants broad secret/resource mutation permissions.'); process.exit(1) }
const kustomization = fs.readFileSync(path.join(root,'deploy/kubernetes/kustomization.yaml'),'utf8')
for (const token of ['namespace.yaml','publisher-rbac.yaml','velclaw.yaml','publisher.yaml']) if (!kustomization.includes(token)) { console.error(`Runtime validation failed: Kubernetes kustomization is missing: ${token}`); process.exit(1) }
console.log('Runtime validation passed: Velclaw Docker fallback + Kubernetes publisher + domain routing + least-privilege RBAC contracts are present.')
