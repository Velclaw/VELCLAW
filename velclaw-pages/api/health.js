export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method Not Allowed'});
 return res.status(200).json({ok:true,service:'velclaw-workspace',agentConfigured:Boolean(process.env.VELCLAW_AGENT_URL),githubConfigured:Boolean(process.env.GITHUB_TOKEN),time:new Date().toISOString()});
}
