const OWNER = process.env.GITHUB_OWNER || 'zskbot';
const REPO = process.env.GITHUB_REPO || 'eve-pages';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN || '';

function headers() {
  return { accept: 'application/vnd.github+json', 'content-type': 'application/json', ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}) };
}
function configured() { return Boolean(TOKEN); }
async function gh(path, options = {}) {
  const r = await fetch(`https://api.github.com${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const text = await r.text(); let data; try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!r.ok) throw new Error(data.message || `GitHub API ${r.status}`);
  return data;
}
export async function gitStatus() {
  if (!configured()) return { configured: false, owner: OWNER, repo: REPO, branch: BRANCH };
  const [repo, branch, commits] = await Promise.all([
    gh(`/repos/${OWNER}/${REPO}`),
    gh(`/repos/${OWNER}/${REPO}/branches/${encodeURIComponent(BRANCH)}`),
    gh(`/repos/${OWNER}/${REPO}/commits?sha=${encodeURIComponent(BRANCH)}&per_page=10`)
  ]);
  return { configured: true, repository: `${OWNER}/${REPO}`, branch: branch.name, protected: Boolean(branch.protected), head: branch.commit.sha, commits: commits.map(c => ({ sha:c.sha, message:c.commit?.message?.split('\n')[0] || '', author:c.commit?.author?.name || c.author?.login || '', date:c.commit?.author?.date || '' })), html_url: repo.html_url };
}
export async function createBranch(name) {
  if (!configured()) throw new Error('GITHUB_TOKEN is not configured');
  const ref = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${encodeURIComponent(BRANCH)}`);
  await gh(`/repos/${OWNER}/${REPO}/git/refs`, { method:'POST', body:JSON.stringify({ ref:`refs/heads/${name}`, sha:ref.object.sha }) });
  return { ok:true, branch:name, base:ref.object.sha };
}
export async function createCommit({ branch=BRANCH, message, files=[] }) {
  if (!configured()) throw new Error('GITHUB_TOKEN is not configured');
  if (!message) throw new Error('commit message is required');
  const base = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${encodeURIComponent(branch)}`);
  const parent = base.object.sha;
  const commit = await gh(`/repos/${OWNER}/${REPO}/git/commits/${parent}`);
  const treeEntries = [];
  for (const f of files) {
    if (!f?.path || typeof f.content !== 'string') continue;
    const blob = await gh(`/repos/${OWNER}/${REPO}/git/blobs`, { method:'POST', body:JSON.stringify({ content:f.content, encoding:'utf-8' }) });
    treeEntries.push({ path:f.path, mode:'100644', type:'blob', sha:blob.sha });
  }
  if (!treeEntries.length) throw new Error('no files to commit');
  const tree = await gh(`/repos/${OWNER}/${REPO}/git/trees`, { method:'POST', body:JSON.stringify({ base_tree:commit.tree.sha, tree:treeEntries }) });
  const next = await gh(`/repos/${OWNER}/${REPO}/git/commits`, { method:'POST', body:JSON.stringify({ message, tree:tree.sha, parents:[parent] }) });
  await gh(`/repos/${OWNER}/${REPO}/git/refs/heads/${encodeURIComponent(branch)}`, { method:'PATCH', body:JSON.stringify({ sha:next.sha, force:false }) });
  return { ok:true, branch, sha:next.sha, message };
}
export async function createPullRequest({ branch, title, body='' }) {
  if (!configured()) throw new Error('GITHUB_TOKEN is not configured');
  if (!branch || !title) throw new Error('branch and title are required');
  return gh(`/repos/${OWNER}/${REPO}/pulls`, { method:'POST', body:JSON.stringify({ title, head:branch, base:BRANCH, body }) });
}
