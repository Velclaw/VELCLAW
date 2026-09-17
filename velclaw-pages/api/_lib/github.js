const repo=process.env.GITHUB_REPO||'zskbot/eve-pages';
const branch=process.env.GITHUB_BRANCH||'main';
const token=process.env.GITHUB_TOKEN||'';
const apiBase=`https://api.github.com/repos/${repo}`;
const headers=()=>({accept:'application/vnd.github+json','x-github-api-version':'2022-11-28',...(token?{authorization:`Bearer ${token}`}:{})});
export const githubConfigured=()=>Boolean(token);
export async function gh(path,options={}){const r=await fetch(`${apiBase}${path}`,{...options,headers:{...headers(),...(options.headers||{})}});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={message:text}}if(!r.ok)throw new Error(data.message||`GitHub API ${r.status}`);return data}
export async function tree(){const data=await gh(`/git/trees/${encodeURIComponent(branch)}?recursive=1`);return (data.tree||[]).filter(x=>x.type==='blob').map(x=>({name:x.path.split('/').pop(),path:x.path,type:'file'}))}
export async function readFile(filePath){const d=await gh(`/contents/${filePath.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`);return Buffer.from(d.content||'','base64').toString('utf8')}
export async function writeFile(filePath,content,message='chore(workspace): update file'){let sha;try{sha=(await gh(`/contents/${filePath.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`)).sha}catch{}const body={message,content:Buffer.from(content,'utf8').toString('base64'),branch};if(sha)body.sha=sha;return gh(`/contents/${filePath.split('/').map(encodeURIComponent).join('/')}`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}
export {repo,branch};