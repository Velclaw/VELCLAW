import { gh, githubConfigured, repo, branch } from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method Not Allowed'});
 if(!githubConfigured())return res.status(200).json({ok:true,configured:false,repo,branch,runs:[]});
 try{const runs=await gh(`/actions/runs?branch=${encodeURIComponent(branch)}&per_page=10`);return res.status(200).json({ok:true,configured:true,repo,branch,runs:(runs.workflow_runs||[]).map(r=>({id:r.id,name:r.name,status:r.status,conclusion:r.conclusion,sha:r.head_sha,branch:r.head_branch,url:r.html_url,created_at:r.created_at,updated_at:r.updated_at}))})}catch(e){return res.status(502).json({ok:false,error:e.message})}
}
