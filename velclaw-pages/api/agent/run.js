export default async function handler(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 const agentUrl=(process.env.VELCLAW_AGENT_URL||'').replace(/\/$/,'');
 if(!agentUrl)return res.status(503).json({ok:false,configured:false,error:'VELCLAW_AGENT_URL is not configured'});
 const url=new URL(req.url,'http://localhost');
 const taskId=url.searchParams.get('taskId');
 const action=url.searchParams.get('action');
 const coreUrl=(process.env.VELCLAW_CORE_URL||'').replace(/\/$/,'');
 try{
  const headers={'content-type':'application/json','accept':'application/json'};
  const bridgeToken=process.env.VELCLAW_AGENT_BRIDGE_TOKEN||process.env.VELCLAW_AGENT_TOKEN;
  if(bridgeToken)headers.authorization=`Bearer ${bridgeToken}`;
  if(req.headers.cookie)headers.cookie=req.headers.cookie;
  headers['x-velclaw-agent-mode']='build';

  if(req.method==='GET'){
   if(!taskId)return res.status(400).json({ok:false,error:'taskId is required'});
   const upstream=await fetch(`${agentUrl}?taskId=${encodeURIComponent(taskId)}`,{method:'GET',headers,signal:AbortSignal.timeout(120000)});
   const text=await upstream.text();let data;try{data=JSON.parse(text)}catch{data={response:text}};
   return res.status(upstream.status).json({ok:upstream.ok,configured:true,data:upstream.ok?data:undefined,task:data?.task,error:upstream.ok?undefined:(data?.error||`agent returned ${upstream.status}`)});
  }

  if(req.method==='DELETE'){
   if(!taskId)return res.status(400).json({ok:false,error:'taskId is required'});
   const upstream=await fetch(`${agentUrl}?taskId=${encodeURIComponent(taskId)}`,{method:'PATCH',headers,body:JSON.stringify({action:action||'stop'}),signal:AbortSignal.timeout(120000)});
   const text=await upstream.text();let data;try{data=JSON.parse(text)}catch{data={response:text}};
   return res.status(upstream.status).json({ok:upstream.ok,configured:true,data:upstream.ok?data:undefined,task:data?.task,error:upstream.ok?undefined:(data?.error||`agent returned ${upstream.status}`)});
  }

  if(req.method!=='POST')return res.status(405).json({ok:false,error:'method not allowed'});

  const incoming=req.body||{};
  if(incoming.taskId&&incoming.action==='followup'){
   if(!coreUrl)return res.status(503).json({ok:false,configured:false,error:'VELCLAW_CORE_URL is not configured'});
   const upstream=await fetch(`${coreUrl}/api/tasks/${encodeURIComponent(incoming.taskId)}/continue`,{method:'POST',headers:{'content-type':'application/json','accept':'application/json',...(req.headers.cookie?{cookie:req.headers.cookie}: {})},body:JSON.stringify({message:incoming.message}),signal:AbortSignal.timeout(120000)});
   const text=await upstream.text();let data;try{data=JSON.parse(text)}catch{data={response:text}};
   return res.status(upstream.status).json({ok:upstream.ok,configured:true,data:upstream.ok?data:undefined,taskId:incoming.taskId,error:upstream.ok?undefined:(data?.error||`core returned ${upstream.status}`)});
  }

  const body={...incoming,mode:'build',capabilities:{tool_calls:true,filesystem:true,terminal:true,runtime:true,preview:true,ci:true,git:true}};
  const upstream=await fetch(agentUrl,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});
  const contentType=upstream.headers.get('content-type')||'';
  if(contentType.includes('text/event-stream')&&upstream.body){
   res.status(upstream.status);res.setHeader('content-type','text/event-stream; charset=utf-8');res.setHeader('cache-control','no-cache, no-transform');res.setHeader('connection','keep-alive');
   const reader=upstream.body.getReader();
   try{while(true){const {done,value}=await reader.read();if(done)break;res.write(Buffer.from(value));}}finally{res.end();}
   return;
  }
  const text=await upstream.text();let data;try{data=JSON.parse(text)}catch{data={response:text}};
  const task=data?.task||data?.data?.task;
  return res.status(upstream.status).json({ok:upstream.ok,configured:true,data:upstream.ok?data:undefined,task,taskId:task?.id||data?.taskId||data?.data?.taskId,error:upstream.ok?undefined:(data?.error||`agent returned ${upstream.status}`)});
 }catch(e){return res.status(502).json({ok:false,configured:true,error:e.message})}
}
