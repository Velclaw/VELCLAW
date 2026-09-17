import { gh, githubConfigured, repo, branch } from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method Not Allowed'});
 if(!githubConfigured())return res.status(503).json({ok:false,configured:false,error:'GITHUB_TOKEN is not configured'});
 try{const {head,title,body=''}=req.body||{};if(!head||!title)return res.status(400).json({ok:false,error:'head and title are required'});const pr=await gh('/pulls',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({head,base:branch,title,body})});return res.status(201).json({ok:true,number:pr.number,url:pr.html_url,state:pr.state,head,base:branch,repo})}catch(e){return res.status(502).json({ok:false,error:e.message})}
}
