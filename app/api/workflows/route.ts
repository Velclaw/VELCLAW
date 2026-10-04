import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { createWorkflowRun,listWorkflowRuns } from '@/lib/workflow/orchestrator'
import { recordObservabilityEvent } from '@/lib/observability'
export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function GET(request:Request){
  const session=await getServerSession();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401})
  const limit=Number(new URL(request.url).searchParams.get('limit')||50)
  return NextResponse.json({runs:await listWorkflowRuns(session.user.id,limit)})
}
export async function POST(request:Request){
  const session=await getServerSession();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await request.json().catch(()=>({})) as Record<string,unknown>
  const projectName=typeof body.projectName==='string'?body.projectName.trim():''
  const prompt=typeof body.prompt==='string'?body.prompt.trim():''
  if(!projectName||!prompt)return NextResponse.json({error:'projectName and prompt are required'},{status:400})
  const run=await createWorkflowRun({userId:session.user.id,projectName,prompt,repository:typeof body.repository==='string'?body.repository:null,taskId:typeof body.taskId==='string'?body.taskId:null})
  await recordObservabilityEvent({userId:session.user.id,service:'workflow',event:'workflow.created',metadata:{workflowId:run.id}})
  return NextResponse.json({run},{status:201})
}