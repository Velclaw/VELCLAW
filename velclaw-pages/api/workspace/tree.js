import {tree,githubConfigured,repo,branch} from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({error:'method not allowed'});
 try{return res.status(200).json({ok:true,tree:await tree(),source:githubConfigured()?'github':'deployment',repo,branch})}
 catch(e){return res.status(502).json({ok:false,error:e.message})}
}