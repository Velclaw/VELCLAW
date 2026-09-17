import { Check, FileCode2, X } from 'lucide-react'
import type { AgentTask } from '../agent/types'
import { DiffView } from './DiffView'

const labels: Record<AgentTask['status'], string> = {
  idle: 'Idle', planning: 'Planning', executing: 'Executing', testing: 'Testing', review: 'Ready for review', complete: 'Complete', error: 'Error',
}

export function ReviewPanel({ task, onApprove, onReject }: { task: AgentTask; onApprove: () => void; onReject: () => void }) {
  return (
    <section className="review-panel">
      <div className="task-summary">
        <div>
          <span className="eyebrow">AGENT TASK</span>
          <h2>{task.prompt}</h2>
        </div>
        <span className="task-status">{labels[task.status]}</span>
      </div>
      <div className="review-grid">
        <div className="review-side">
          <span className="mini-label">PLAN</span>
          <ol>{task.plan.map(step => <li key={step}>{step}</li>)}</ol>
          <span className="mini-label">CHANGED FILES</span>
          <div className="changed-files">{task.changes.map(change => <div key={change.path}><FileCode2 size={15} /><span>{change.path}</span><small>{change.kind}</small></div>)}</div>
          <span className="mini-label">EXECUTION LOG</span>
          <div className="agent-log">{task.logs.map((log, i) => <div key={`${log}-${i}`}>{log}</div>)}</div>
        </div>
        <div className="review-diff">{task.changes.map(change => <DiffView change={change} key={change.path} />)}</div>
      </div>
      <div className="review-actions"><button className="secondary-btn" onClick={onReject}><X size={16} /> Reject</button><button className="primary-btn" onClick={onApprove}><Check size={16} /> Approve changes</button></div>
    </section>
  )
}
