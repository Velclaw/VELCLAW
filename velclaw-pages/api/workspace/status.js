export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({error:'method not allowed'});
 const agentUrl=(process.env.VELCLAW_AGENT_URL||'').replace(/\/$/,'');
 return res.status(200).json({ok:true,workspace:process.env.GITHUB_REPO||'zskbot/eve-pages',agent:{configured:Boolean(agentUrl),url:agentUrl?new URL(agentUrl).origin:null},github:{configured:Boolean(process.env.GITHUB_TOKEN),repo:process.env.GITHUB_REPO||'zskbot/eve-pages',branch:process.env.GITHUB_BRANCH||'main'},ci:{endpoint:'/api/ci/status'},sourceControl:{status:'/api/git/status',diff:'/api/git/diff',branch:'/api/git/branch',commit:'/api/git/commit',pullRequest:'/api/git/pr'},server:{platform:'vercel',node:process.version},time:new Date().toISOString()});
}