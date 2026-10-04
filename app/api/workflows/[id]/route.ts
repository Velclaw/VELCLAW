import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getWorkflowRun,listWorkflowEvents,transitionWorkflow,WORKFLOW_STAGES } from '@/lib/workflow/orchestrator'
import { z } from 'zod'
export const dynamic='force-dynamic'
export const runtime='nodejs'
const schema=z.object({stage:z.enum(WORKFLOW_STAGES),status:z.enum(['queued','running','blocked','succeeded','failed','cancelled']),progress:z.number().min(0).max(100),action:z.string().max(500).nullable().optional(),error:z.string().max(2000).nullable().optional()})
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){
  const session=await getServerSession();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {id}=await context.params;const run=await getWorkflowRun(id,session.user.id);if(!run)return NextResponse.json({error:'Workflow not found'},{status:404})
  return NextResponse.json({run,events:await listWorkflowEvents(id,session.user.id)})
}
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  const session=await getServerSession();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {id}=await context.params;const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400})
  const run=await transitionWorkflow(id,session.user.id,parsed.data);if(!run)return NextResponse.json({error:'Workflow not found'},{status:404})
  return NextResponse.json({run})
}