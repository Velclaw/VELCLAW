import { repo, branch, githubConfigured } from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method Not Allowed'});
 return res.status(200).json({ok:true,configured:githubConfigured(),repo,branch,capabilities:['tree','file-read','file-write','diff','branch','commit','pull-request','ci']});
}
