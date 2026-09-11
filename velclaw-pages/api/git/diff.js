import { gh, githubConfigured, repo, branch } from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method Not Allowed'});
 if(!githubConfigured())return res.status(200).json({ok:true,configured:false,repo,branch,files:[]});
 try{const base=String(req.query?.base||branch);const head=String(req.query?.head||branch);const data=await gh(`/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`);return res.status(200).json({ok:true,configured:true,repo,base,head,status:data.status,ahead_by:data.ahead_by,behind_by:data.behind_by,files:(data.files||[]).map(f=>({filename:f.filename,status:f.status,additions:f.additions,deletions:f.deletions,changes:f.changes,patch:f.patch||''}))})}catch(e){return res.status(502).json({ok:false,error:e.message})}
}
