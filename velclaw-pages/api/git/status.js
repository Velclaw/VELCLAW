import {gh,githubConfigured,repo,branch} from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({error:'method not allowed'});
 if(!githubConfigured())return res.status(200).json({ok:true,configured:false,repo,branch,head:null,commits:[]});
 try{const [ref,commits]=await Promise.all([gh(`/git/ref/heads/${encodeURIComponent(branch)}`),gh(`/commits?sha=${encodeURIComponent(branch)}&per_page=8`)]);return res.status(200).json({ok:true,configured:true,repo,branch,head:ref.object.sha,commits:(commits||[]).map(c=>({sha:c.sha.slice(0,7),message:c.commit?.message?.split('\n')[0]||'',author:c.commit?.author?.name||c.author?.login||'unknown',date:c.commit?.author?.date||''}))})}catch(e){return res.status(502).json({ok:false,error:e.message})}
}