export type EcosystemIntegration={id:string;name:string;category:'source-control'|'deployment'|'agent'|'protocol'|'communication';status:'configured'|'available'|'needs-configuration';capability:string}
export function getEcosystemIntegrations():EcosystemIntegration[]{
  const has=(name:string)=>Boolean(process.env[name])
  return [
    {id:'github',name:'GitHub',category:'source-control',status:has('GITHUB_TOKEN')?'configured':'available',capability:'Repositories, branches, pull requests, checks and webhooks'},
    {id:'mcp',name:'MCP',category:'protocol',status:'configured',capability:'Tool, resource and prompt discovery through the Velclaw registry'},
    {id:'vercel',name:'Vercel',category:'deployment',status:has('VERCEL_TOKEN')?'configured':'needs-configuration',capability:'Deployment provider and project control-plane adapter'},
    {id:'gitlab',name:'GitLab',category:'source-control',status:has('GITLAB_TOKEN')?'configured':'needs-configuration',capability:'Repository and CI/CD adapter boundary'},
    {id:'slack',name:'Slack',category:'communication',status:has('SLACK_WEBHOOK_URL')?'configured':'needs-configuration',capability:'Operational notifications and workflow events'},
    {id:'ollama',name:'Ollama',category:'agent',status:has('OLLAMA_BASE_URL')?'configured':'available',capability:'Local model execution adapter for private agent workflows'},
  ]
}
export function getEcosystemSummary(){const integrations=getEcosystemIntegrations();return{total:integrations.length,configured:integrations.filter(x=>x.status==='configured').length,needsConfiguration:integrations.filter(x=>x.status==='needs-configuration').length,integrations}}
