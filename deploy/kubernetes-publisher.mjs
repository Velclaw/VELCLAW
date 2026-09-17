import process from 'node:process'

const API = process.env.VELCLAW_DEPLOY_API || 'http://velclaw.velclaw-production.svc.cluster.local'
const TOKEN = process.env.VELCLAW_DEPLOY_API_TOKEN || ''
const NAMESPACE = process.env.VELCLAW_RUNTIME_NAMESPACE || 'velclaw-production'
const DOMAIN = (process.env.VELCLAW_PUBLIC_DOMAIN || 'velclaw.cfd').trim().toLowerCase()
const REGISTRY = (process.env.VELCLAW_IMAGE_REGISTRY || 'ghcr.io/velclaw').replace(/\/$/, '')
const POLL_MS = Math.max(1000, Number(process.env.VELCLAW_DEPLOY_POLL_MS || 3000))
const JOB_TIMEOUT_MS = Math.max(120_000, Number(process.env.VELCLAW_K8S_JOB_TIMEOUT_MS || 900_000))
const ROLLOUT_TIMEOUT_MS = Math.max(60_000, Number(process.env.VELCLAW_K8S_ROLLOUT_TIMEOUT_MS || 600_000))
const LOG_LIMIT = 500

if (!TOKEN) throw new Error('VELCLAW_DEPLOY_API_TOKEN is required')
if (!/^[a-z0-9.-]+$/.test(DOMAIN)) throw new Error('Invalid VELCLAW_PUBLIC_DOMAIN')

const fs = await import('node:fs/promises')
const k8sToken = await fs.readFile('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8').catch(() => '')
const k8sHost = process.env.KUBERNETES_SERVICE_HOST
const k8sPort = process.env.KUBERNETES_SERVICE_PORT_HTTPS || '443'
if (!k8sHost || !k8sToken) throw new Error('In-cluster Kubernetes credentials are required')
const K8S = `https://${k8sHost}:${k8sPort}`

function name(value, fallback = 'app') {
  const normalized = String(value || fallback).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  return (normalized || fallback).slice(0, 50).replace(/-+$/g, '')
}
function appName(job) { return `vc-${name(job.projectName)}-${name(job.id.replace(/-/g, '').slice(0, 8))}` }
function hostname(job) {
  if (job.customDomain) return job.customDomain
  return `${name(job.projectName)}-${name(job.id.replace(/-/g, '').slice(0, 8))}.${DOMAIN}`
}
function imageName(job) { return `${REGISTRY}/${name(job.projectName)}:${job.id}` }

async function control(pathname, options = {}) {
  const response = await fetch(`${API}${pathname}`, {
    ...options,
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', ...(options.headers || {}) },
  })
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
  return response.status === 204 ? null : response.json()
}

async function k8s(pathname, options = {}) {
  const headers = { authorization: `Bearer ${k8sToken}`, 'content-type': 'application/json', ...(options.headers || {}) }
  const response = await fetch(`${K8S}${pathname}`, { ...options, headers })
  if (!response.ok && response.status !== 404) throw new Error(`Kubernetes ${response.status}: ${await response.text()}`)
  return { status: response.status, data: response.status === 204 || response.status === 404 ? null : await response.json() }
}

function apiBase(apiVersion, plural) {
  const parts = apiVersion.split('/')
  if (parts.length === 1) return `/api/${parts[0]}/namespaces/${NAMESPACE}/${plural}`
  return `/apis/${parts[0]}/${parts[1]}/namespaces/${NAMESPACE}/${plural}`
}

async function apply(resource) {
  const plural = { Secret: 'secrets', ConfigMap: 'configmaps', Job: 'jobs', Deployment: 'deployments', Service: 'services', Ingress: 'ingresses' }[resource.kind]
  if (!plural) throw new Error(`Unsupported Kubernetes resource kind: ${resource.kind}`)
  const base = apiBase(resource.apiVersion, plural)
  const existing = await k8s(`${base}/${resource.metadata.name}`)
  if (existing.status === 404) {
    await k8s(base, { method: 'POST', body: JSON.stringify(resource) })
  } else {
    const next = { ...resource, metadata: { ...resource.metadata, resourceVersion: existing.data.metadata.resourceVersion } }
    await k8s(`${base}/${resource.metadata.name}`, { method: 'PUT', body: JSON.stringify(next) })
  }
}

async function buildJob(job) {
  const app = appName(job)
  const image = imageName(job)
  const gitUrl = String(job.repoUrl).replace(/\.git$/i, '') + '.git'
  return {
    apiVersion: 'batch/v1', kind: 'Job',
    metadata: { name: `${app}-build`, namespace: NAMESPACE, labels: { 'app.kubernetes.io/part-of': 'velclaw', 'velclaw.deployment': job.id } },
    spec: {
      backoffLimit: 0,
      ttlSecondsAfterFinished: 900,
      activeDeadlineSeconds: Math.ceil(JOB_TIMEOUT_MS / 1000),
      template: {
        metadata: { labels: { 'app.kubernetes.io/name': app, 'velclaw.deployment': job.id } },
        spec: {
          restartPolicy: 'Never',
          securityContext: { seccompProfile: { type: 'RuntimeDefault' } },
          volumes: [
            { name: 'source', emptyDir: {} },
            { name: 'docker-config', secret: { secretName: 'velclaw-registry', optional: false, items: [{ key: '.dockerconfigjson', path: 'config.json' }] } },
          ],
          initContainers: [
            {
              name: 'checkout', image: 'alpine/git:2.47.2',
              command: ['sh', '-ec'], args: [`git -c http.extraheader="AUTHORIZATION: Bearer $GITHUB_TOKEN" clone --depth 1 --branch '${String(job.branch).replace(/[^A-Za-z0-9._/-]/g, '')}' '${gitUrl}' /workspace/src${job.commitSha ? ` && cd /workspace/src && git fetch --depth 1 origin '${job.commitSha}' && git checkout --detach '${job.commitSha}'` : ''}`],
              env: [{ name: 'GITHUB_TOKEN', valueFrom: { secretKeyRef: { name: 'velclaw-github', key: 'token', optional: false } } }],
              volumeMounts: [{ name: 'source', mountPath: '/workspace' }],
              securityContext: { runAsUser: 1000, runAsGroup: 1000, runAsNonRoot: true, allowPrivilegeEscalation: false, capabilities: { drop: ['ALL'] } },
            },
            {
              name: 'prepare', image: 'node:22-alpine',
              command: ['node', '-e'], args: [`const fs=require('fs'),x=JSON.parse(fs.readFileSync('/workspace/src/package.json','utf8')); const s=x.scripts||{}; const has=(f)=>fs.existsSync('/workspace/src/'+f); const manager=has('pnpm-lock.yaml')?'pnpm':has('yarn.lock')?'yarn':'npm'; const install=manager==='pnpm'?'corepack enable && pnpm install --frozen-lockfile':manager==='yarn'?'corepack enable && yarn install --immutable':has('package-lock.json')?'npm ci':'npm install'; if(!s.build) throw new Error('No build script and no supported Dockerfile'); const start=s.start?'CMD ["'+manager+'","start"]':'CMD ["node","-e","require(\\\"http\\\").createServer((_,r)=>r.end(\\\"Velclaw app\\\")).listen(3000,\\\"0.0.0.0\\\")"]'; const docker=has('Dockerfile')?null:'FROM node:22-alpine\\nWORKDIR /app\\nCOPY package.json '+(has('pnpm-lock.yaml')?'pnpm-lock.yaml':has('yarn.lock')?'yarn.lock':has('package-lock.json')?'package-lock.json':'package.json')+' ./\\nRUN '+install+'\\nCOPY . .\\nRUN '+manager+' run build\\nENV NODE_ENV=production\\nENV PORT=3000\\nEXPOSE 3000\\n'+start+'\\n'; if(docker)fs.writeFileSync('/workspace/src/Dockerfile',docker);`],
              volumeMounts: [{ name: 'source', mountPath: '/workspace' }],
              securityContext: { runAsUser: 1000, runAsGroup: 1000, runAsNonRoot: true, allowPrivilegeEscalation: false, capabilities: { drop: ['ALL'] } },
            },
          ],
          containers: [{
            name: 'kaniko', image: 'gcr.io/kaniko-project/executor:v1.23.2-debug',
            args: [`--context=dir:///workspace/src`, '--dockerfile=/workspace/src/Dockerfile', `--destination=${image}`, '--cache=true', '--cache-ttl=24h'],
            volumeMounts: [{ name: 'source', mountPath: '/workspace' }, { name: 'docker-config', mountPath: '/kaniko/.docker' }],
            securityContext: { runAsUser: 0, allowPrivilegeEscalation: false, capabilities: { drop: ['ALL'] } },
          }],
        },
      },
    },
  }
}

async function waitJob(jobName) {
  const deadline = Date.now() + JOB_TIMEOUT_MS
  while (Date.now() < deadline) {
    const result = await k8s(`/apis/batch/v1/namespaces/${NAMESPACE}/jobs/${jobName}`)
    if (result.status === 404) throw new Error('Build job disappeared')
    const status = result.data.status || {}
    if ((status.succeeded || 0) >= 1) return
    if ((status.failed || 0) >= 1) throw new Error(`Kubernetes build job failed (failed=${status.failed})`)
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
  throw new Error(`Kubernetes build job timed out after ${JOB_TIMEOUT_MS}ms`)
}

async function waitDeployment(app) {
  const deadline = Date.now() + ROLLOUT_TIMEOUT_MS
  while (Date.now() < deadline) {
    const result = await k8s(`/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${app}`)
    if (result.status === 404) throw new Error('Application Deployment disappeared during rollout')
    const status = result.data.status || {}
    const desired = Number(result.data.spec?.replicas || 1)
    const available = Number(status.availableReplicas || 0)
    const updated = Number(status.updatedReplicas || 0)
    const unavailable = Number(status.unavailableReplicas || 0)
    if (available >= desired && updated >= desired && unavailable === 0) return
    const failed = (status.conditions || []).find((condition) => condition.type === 'Progressing' && condition.reason === 'ProgressDeadlineExceeded')
    if (failed) throw new Error(`Application rollout exceeded Kubernetes progress deadline: ${app}`)
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
  throw new Error(`Application rollout timed out after ${ROLLOUT_TIMEOUT_MS}ms`)
}

function appResources(job) {
  const app = appName(job)
  const host = hostname(job)
  const image = imageName(job)
  const env = Object.fromEntries(Object.entries(job.env || {}).filter(([k, v]) => /^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(k) && typeof v === 'string' && !/[\r\n]/.test(v)).map(([k, v]) => [k, v.slice(0, 8192)]))
  const secret = { apiVersion: 'v1', kind: 'Secret', metadata: { name: `${app}-env`, namespace: NAMESPACE, labels: { 'velclaw.deployment': job.id } }, type: 'Opaque', stringData: env }
  const deployment = { apiVersion: 'apps/v1', kind: 'Deployment', metadata: { name: app, namespace: NAMESPACE, labels: { 'app.kubernetes.io/part-of': 'velclaw', 'app.kubernetes.io/name': app, 'velclaw.deployment': job.id } }, spec: { replicas: 1, revisionHistoryLimit: 3, progressDeadlineSeconds: 600, strategy: { type: 'RollingUpdate', rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } }, selector: { matchLabels: { 'app.kubernetes.io/name': app } }, template: { metadata: { labels: { 'app.kubernetes.io/name': app, 'velclaw.deployment': job.id } }, spec: { containers: [{ name: 'web', image, imagePullPolicy: 'Always', ports: [{ name: 'http', containerPort: 3000 }], envFrom: [{ secretRef: { name: `${app}-env` } }], resources: { requests: { cpu: '100m', memory: '128Mi' }, limits: { cpu: '1', memory: '1Gi' } }, securityContext: { runAsNonRoot: true, runAsUser: 10001, runAsGroup: 10001, allowPrivilegeEscalation: false, capabilities: { drop: ['ALL'] }, seccompProfile: { type: 'RuntimeDefault' } }, readinessProbe: { httpGet: { path: '/', port: 'http' }, initialDelaySeconds: 10, periodSeconds: 10, timeoutSeconds: 3, failureThreshold: 6 }, livenessProbe: { httpGet: { path: '/', port: 'http' }, initialDelaySeconds: 30, periodSeconds: 20, timeoutSeconds: 3, failureThreshold: 6 }] } } } }
  const service = { apiVersion: 'v1', kind: 'Service', metadata: { name: app, namespace: NAMESPACE, labels: { 'velclaw.deployment': job.id } }, spec: { selector: { 'app.kubernetes.io/name': app }, ports: [{ name: 'http', port: 80, targetPort: 'http' }] } }
  const ingress = { apiVersion: 'networking.k8s.io/v1', kind: 'Ingress', metadata: { name: app, namespace: NAMESPACE, annotations: { 'cert-manager.io/cluster-issuer': 'letsencrypt-prod', 'nginx.ingress.kubernetes.io/ssl-redirect': 'true' }, labels: { 'velclaw.deployment': job.id } }, spec: { ingressClassName: 'nginx', tls: [{ hosts: [host], secretName: `${app}-tls` }], rules: [{ host, http: { paths: [{ path: '/', pathType: 'Prefix', backend: { service: { name: app, port: { name: 'http' } } } }] } }] } }
  return [secret, deployment, service, ingress]
}

async function publish(job) {
  const logs = [...(job.logs || []), 'Kubernetes publisher started']
  try {
    const app = appName(job)
    const build = await buildJob(job)
    await apply(build)
    logs.push(`Created Kubernetes build job ${build.metadata.name}`)
    await waitJob(build.metadata.name)
    logs.push('Build job completed and image pushed to registry')
    for (const resource of appResources(job)) await apply(resource)
    logs.push(`Applied Deployment/Service/Ingress for ${app}`)
    await waitDeployment(app)
    logs.push(`Deployment ${app} passed readiness rollout verification`)
    const url = `https://${hostname(job)}`
    await control(`/api/deployments/${job.id}/runtime`, { method: 'POST', body: JSON.stringify({ status: 'ready', url, logs: logs.slice(-LOG_LIMIT) }) })
  } catch (error) {
    logs.push(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
    await control(`/api/deployments/${job.id}/runtime`, { method: 'POST', body: JSON.stringify({ status: 'failed', logs: logs.slice(-LOG_LIMIT), error: error instanceof Error ? error.message : String(error) }) }).catch(() => {})
  }
}

console.log(`Velclaw Kubernetes publisher active: namespace=${NAMESPACE}, registry=${REGISTRY}`)
while (true) {
  try {
    const { deployment } = await control('/api/deployments/claim', { method: 'POST' })
    if (deployment) await publish(deployment)
  } catch (error) {
    console.error(`[k8s-publisher] ${error instanceof Error ? error.message : String(error)}`)
  }
  await new Promise((resolve) => setTimeout(resolve, POLL_MS))
}
