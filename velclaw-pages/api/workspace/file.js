import {readFile,writeFile,githubConfigured,repo,branch} from '../_lib/github.js';
export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 const filePath=String(req.query?.path||'');
 if(!filePath||filePath.includes('..')||filePath.startsWith('/'))return res.status(400).json({error:'valid path is required'});
 try{
  if(req.method==='GET')return res.status(200).json({ok:true,path:filePath,content:await readFile(filePath),source:'github',repo,branch});
  if(req.method==='POST'||req.method==='PUT'){
   if(!githubConfigured())return res.status(503).json({ok:false,error:'GITHUB_TOKEN is required for persistent deployed edits'});
   if(typeof req.body?.content!=='string')return res.status(400).json({error:'content is required'});
   const result=await writeFile(filePath,req.body.content,req.body.message||`chore(workspace): update ${filePath}`);
   return res.status(200).json({ok:true,path:filePath,source:'github',commit:result.commit?.sha||null});
  }
  return res.status(405).json({error:'method not allowed'});
 }catch(e){return res.status(502).json({ok:false,error:e.message})}
}