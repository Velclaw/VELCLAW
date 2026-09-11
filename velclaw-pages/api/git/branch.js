import { gh, githubConfigured, repo, branch } from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method Not Allowed'});
 if(!githubConfigured())return res.status(503).json({ok:false,configured:false,error:'GITHUB_TOKEN is not configured'});
 try{const name=String(req.body?.name||'').trim();if(!/^[A-Za-z0-9._/-]{1,120}$/.test(name)||name.startsWith('/')||name.endsWith('/'))return res.status(400).json({ok:false,error:'invalid branch name'});const ref=await gh(`/git/ref/heads/${encodeURIComponent(branch)}`);await gh('/git/refs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:`refs/heads/${name}`,sha:ref.object.sha})});return res.status(201).json({ok:true,branch:name,base:ref.object.sha,repo})}catch(e){return res.status(502).json({ok:false,error:e.message})}
}
