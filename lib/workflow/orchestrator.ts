import postgres from 'postgres'
import { randomUUID } from 'node:crypto'

export const WORKFLOW_STAGES = ['intake','plan','execute','validate','review','deliver','deploy','observe'] as const
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number]
export type WorkflowStatus = 'queued'|'running'|'blocked'|'succeeded'|'failed'|'cancelled'
export type WorkflowRun = {
  id:string; userId:string; taskId:string|null; projectName:string; repository:string|null; prompt:string
  stage:WorkflowStage; status:WorkflowStatus; progress:number; currentAction:string|null; error:string|null
  createdAt:string; updatedAt:string
}
const sql=postgres(process.env.POSTGRES_URL||'',{max:5})
let initialized=false
async function ensureStore(){
  if(initialized)return
  if(!process.env.POSTGRES_URL)throw new Error('POSTGRES_URL environment variable is required')
  await sql`CREATE TABLE IF NOT EXISTS velclaw_workflow_runs(
    id text PRIMARY KEY,user_id text NOT NULL,task_id text,project_name text NOT NULL,repository text,
    prompt text NOT NULL,stage text NOT NULL DEFAULT 'intake',status text NOT NULL DEFAULT 'queued',
    progress integer NOT NULL DEFAULT 0,current_action text,error text,created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now())`
  await sql`CREATE TABLE IF NOT EXISTS velclaw_workflow_events(
    id text PRIMARY KEY,workflow_id text NOT NULL REFERENCES velclaw_workflow_runs(id) ON DELETE CASCADE,
    stage text NOT NULL,status text NOT NULL,message text NOT NULL,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now())`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_workflow_runs_user_idx ON velclaw_workflow_runs(user_id,created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_workflow_events_workflow_idx ON velclaw_workflow_events(workflow_id,created_at ASC)`
  initialized=true
}
const columns=sql`id,user_id as "userId",task_id as "taskId",project_name as "projectName",repository,prompt,stage,status,progress,current_action as "currentAction",error,created_at as "createdAt",updated_at as "updatedAt"`
export async function createWorkflowRun(input:{userId:string;projectName:string;repository?:string|null;prompt:string;taskId?:string|null}){
  await ensureStore();const id=randomUUID()
  const rows=await sql<WorkflowRun[]>`INSERT INTO velclaw_workflow_runs(id,user_id,task_id,project_name,repository,prompt,stage,status,progress,current_action)
    VALUES(${id},${input.userId},${input.taskId||null},${input.projectName},${input.repository||null},${input.prompt},'intake','queued',0,'Workflow accepted') RETURNING ${columns}`
  await appendWorkflowEvent(id,'intake','queued','Workflow accepted',{source:'workspace'});return rows[0]
}
export async function listWorkflowRuns(userId:string,limit=50){await ensureStore();return sql<WorkflowRun[]>`SELECT ${columns} FROM velclaw_workflow_runs WHERE user_id=${userId} ORDER BY created_at DESC LIMIT ${Math.min(Math.max(limit,1),100)}`}
export async function getWorkflowRun(id:string,userId:string){await ensureStore();const r=await sql<WorkflowRun[]>`SELECT ${columns} FROM velclaw_workflow_runs WHERE id=${id} AND user_id=${userId} LIMIT 1`;return r[0]||null}
export async function listWorkflowEvents(id:string,userId:string){
  await ensureStore();const owner=await sql`SELECT id FROM velclaw_workflow_runs WHERE id=${id} AND user_id=${userId} LIMIT 1`
  if(!owner.length)return null
  return sql`SELECT id,stage,status,message,metadata,created_at as "createdAt" FROM velclaw_workflow_events WHERE workflow_id=${id} ORDER BY created_at ASC`
}
export async function transitionWorkflow(id:string,userId:string,input:{stage:WorkflowStage;status:WorkflowStatus;progress:number;action?:string|null;error?:string|null}){
  await ensureStore();const progress=Math.min(Math.max(Math.round(input.progress),0),100)
  const r=await sql<WorkflowRun[]>`UPDATE velclaw_workflow_runs SET stage=${input.stage},status=${input.status},progress=${progress},current_action=${input.action||null},error=${input.error||null},updated_at=now() WHERE id=${id} AND user_id=${userId} RETURNING ${columns}`
  const run=r[0];if(!run)return null
  await appendWorkflowEvent(id,input.stage,input.status,input.action||`Workflow ${input.status}`,{progress,error:input.error||null});return run
}
async function appendWorkflowEvent(id:string,stage:WorkflowStage,status:WorkflowStatus,message:string,metadata:Record<string,unknown>){
  await sql`INSERT INTO velclaw_workflow_events(id,workflow_id,stage,status,message,metadata) VALUES(${randomUUID()},${id},${stage},${status},${message},${JSON.stringify(metadata)}::jsonb)`
}
