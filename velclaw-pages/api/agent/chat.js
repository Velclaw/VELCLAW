export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='POST')return res.status(405).json({error:'method not allowed'});
 const agentUrl=(process.env.VELCLAW_AGENT_URL||'').replace(/\/$/,'');
 if(!agentUrl)return res.status(503).json({ok:false,configured:false,error:'VELCLAW_AGENT_URL is not configured'});
 try{
  const headers={'content-type':'application/json','accept':'application/json'};
  if(process.env.VELCLAW_AGENT_TOKEN)headers.authorization=`Bearer ${process.env.VELCLAW_AGENT_TOKEN}`;
  const upstream=await fetch(agentUrl,{method:'POST',headers,body:JSON.stringify(req.body||{}),signal:AbortSignal.timeout(120000)});
  const text=await upstream.text();let data;try{data=JSON.parse(text)}catch{data={response:text}};
  return res.status(upstream.status).json({ok:upstream.ok,configured:true,data:upstream.ok?data:undefined,error:upstream.ok?undefined:(data?.error||`agent returned ${upstream.status}`)});
 }catch(e){return res.status(502).json({ok:false,configured:true,error:e.message})}
}