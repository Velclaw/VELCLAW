import http from 'node:http'
import crypto from 'node:crypto'

const PORT = Number(process.env.PORT || 10000)
const REPO = process.env.GITHUB_REPOSITORY || 'Velclaw/Velclaw'
const TOKEN = process.env.GITHUB_TOKEN || ''
const CONTROL_SECRET = process.env.VELCLAW_OPS_SECRET || ''
const WEBHOOK_SECRET = process.env.VELCLAW_GITHUB_WEBHOOK_SECRET || ''
const WORKFLOW = process.env.VELCLAW_CI_WORKFLOW || 'ci-release.yml'
const BRANCH = process.env.VELCLAW_CI_BRANCH || 'main'
const API = 'https://api.github.com'

function json(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(payload) })
  res.end(payload)
}

function authorized(req) {
  if (!CONTROL_SECRET) return false
  return (req.headers.authorization || '') === `Bearer ${CONTROL_SECRET}`
}

function verifyWebhook(req, body) {
  if (!WEBHOOK_SECRET) return false
  const signature = req.headers['x-hub-signature-256'] || ''
  const expected = `sha256=${crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')}`
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

async function github(path, options = {}) {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is not configured')
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${TOKEN}`,
      'x-github-api-version': '2026-03-10',
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = { raw: text } }
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${JSON.stringify(data)}`)
  return data
}

async function status() {
  const [workflows, runs] = await Promise.all([
    github(`/repos/${REPO}/actions/workflows?per_page=100`),
    github(`/repos/${REPO}/actions/runs?branch=${encodeURIComponent(BRANCH)}&per_page=20`),
  ])
  return {
    repo: REPO,
    branch: BRANCH,
    workflows: workflows.workflows?.map((w) => ({ id: w.id, name: w.name, path: w.path, state: w.state })) || [],
    runs: runs.workflow_runs?.map((r) => ({ id: r.id, name: r.name, status: r.status, conclusion: r.conclusion, sha: r.head_sha, url: r.html_url, created_at: r.created_at })) || [],
  }
}

async function dispatch() {
  await github(`/repos/${REPO}/actions/workflows/${encodeURIComponent(WORKFLOW)}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({ ref: BRANCH }),
  })
  return { ok: true, workflow: WORKFLOW, branch: BRANCH }
}

async function rerunFailed(runId) {
  await github(`/repos/${REPO}/actions/runs/${encodeURIComponent(runId)}/rerun-failed-jobs`, { method: 'POST' })
  return { ok: true, runId }
}

async function handleWebhook(req, res, body) {
  if (!verifyWebhook(req, body)) return json(res, 401, { error: 'invalid_webhook_signature' })
  const event = req.headers['x-github-event'] || 'unknown'
  let payload = {}
  try { payload = JSON.parse(body) } catch { return json(res, 400, { error: 'invalid_json' }) }
  if (event === 'workflow_run' && payload.action === 'completed' && payload.workflow_run?.conclusion === 'failure') {
    const runId = payload.workflow_run.id
    try {
      await rerunFailed(runId)
      return json(res, 202, { ok: true, action: 'rerun_failed_jobs', runId })
    } catch (error) {
      return json(res, 502, { ok: false, action: 'recovery_failed', runId, error: error instanceof Error ? error.message : String(error) })
    }
  }
  return json(res, 202, { ok: true, ignored: true, event, action: payload.action || null })
}

function page() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Velclaw Ops</title><style>body{margin:0;background:#08060d;color:#f7f3fb;font:14px ui-monospace,monospace}main{max-width:1100px;margin:auto;padding:28px}h1{font-size:22px;margin:0 0 8px}.muted{color:#aaa2b5}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0}.card{border:1px solid #2b2434;background:#0f0b16;padding:16px}.btn{background:#a855f7;color:#fff;border:0;padding:10px 14px;font:inherit;cursor:pointer}.row{border-top:1px solid #2b2434;padding:12px 0}.ok{color:#c084fc}.bad{color:#fb7185}@media(max-width:700px){.grid{grid-template-columns:1fr}}</style></head><body><main><h1>VELCLAW / OPS CONTROL PLANE</h1><div class="muted">CI, workflow dispatch, failure recovery and deployment control.</div><div class="grid"><div class="card"><b>Repository</b><br>Velclaw/Velclaw</div><div class="card"><b>Branch</b><br>main</div><div class="card"><b>Control</b><br><button class="btn" onclick="dispatch()">RUN CI</button></div></div><div id="out" class="card">Loading…</div></main><script>async function load(){const r=await fetch('/api/status');const d=await r.json();document.querySelector('#out').innerHTML='<b>Recent runs</b>'+d.runs.map(x=>'<div class="row"><b>'+x.name+'</b> · '+x.status+' · <span class="'+(x.conclusion==='success'?'ok':x.conclusion==='failure'?'bad':'')+'">'+(x.conclusion||'running')+'</span><br><span class="muted">'+x.sha.slice(0,12)+'</span> · <a style="color:#c084fc" href="'+x.url+'" target="_blank">GitHub</a></div>').join('')}</script><script>async function dispatch(){await fetch('/api/dispatch',{method:'POST',headers:{'authorization':prompt('Ops token')}});await load()}</script></body></html>`
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/healthz') return json(res, 200, { ok: true, service: 'velclaw-ops' })
    if (req.method === 'GET' && req.url === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(page()) }
    if (req.url === '/api/status' && req.method === 'GET') return json(res, 200, await status())
    if (req.method === 'POST' && req.url === '/api/github/webhook') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      return handleWebhook(req, res, Buffer.concat(chunks).toString('utf8'))
    }
    if ((req.url === '/api/dispatch' || req.url === '/api/rerun') && !authorized(req)) return json(res, 401, { error: 'unauthorized' })
    if (req.url === '/api/dispatch' && req.method === 'POST') return json(res, 200, await dispatch())
    if (req.url?.startsWith('/api/rerun/') && req.method === 'POST') return json(res, 200, await rerunFailed(req.url.split('/').pop()))
    return json(res, 404, { error: 'not_found' })
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) })
  }
})

server.listen(PORT, '0.0.0.0', () => console.log(`Velclaw Ops listening on ${PORT}`))
