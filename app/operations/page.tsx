import { getServerSession } from '@/lib/session/get-server-session'
import { listWorkflowRuns } from '@/lib/workflow/orchestrator'
import { getObservabilitySummary } from '@/lib/observability'
import { getEcosystemSummary } from '@/lib/ecosystem/registry'
import { listDeployments } from '@/lib/deploy/store'

export const dynamic = 'force-dynamic'

const stages = ['intake', 'plan', 'execute', 'validate', 'review', 'deliver', 'deploy', 'observe']

export default async function OperationsPage() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return <main className="mx-auto max-w-5xl px-6 py-16"><h1 className="text-2xl font-semibold">Operations</h1><p className="mt-2 text-muted-foreground">Sign in to inspect workflow and runtime operations.</p></main>
  }
  const [runs, observability, ecosystem, deployments] = await Promise.all([
    listWorkflowRuns(session.user.id, 12),
    getObservabilitySummary(),
    Promise.resolve(getEcosystemSummary()),
    listDeployments(session.user.id, 12),
  ])
  return <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
    <header className="space-y-2"><p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Velclaw control plane</p><h1 className="text-3xl font-semibold tracking-tight">Operations</h1><p className="max-w-3xl text-sm text-muted-foreground">One surface for agent workflow state, deployment delivery, production telemetry and ecosystem readiness.</p></header>
    <section className="grid gap-4 md:grid-cols-4">
      {[
        ['Workflows', runs.length, String(runs.filter((r) => r.status === 'running').length) + ' running'],
        ['Deployments', deployments.length, String(deployments.filter((d) => d.status === 'ready').length) + ' ready'],
        ['24h errors', observability.totals?.errors ?? 0, String(observability.totals?.total ?? 0) + ' events'],
        ['Integrations', String(ecosystem.configured) + '/' + String(ecosystem.total), String(ecosystem.needsConfiguration) + ' need setup'],
      ].map(([label, value, detail]) => <div key={String(label)} className="rounded-2xl border bg-card p-5 shadow-sm"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>)}
    </section>
    <section className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <div className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Agent workflow runs</h2><p className="text-sm text-muted-foreground">Auditable lifecycle from intake through observation.</p><div className="mt-5 space-y-3">{runs.length ? runs.map((run) => <div key={run.id} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-medium">{run.projectName}</p><p className="text-xs text-muted-foreground">{run.stage} · {run.status}</p></div><span className="text-sm font-medium">{run.progress}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground" style={{ width: run.progress + '%' }} /></div><p className="mt-2 text-xs text-muted-foreground">{run.currentAction || 'Waiting for worker'}</p></div>) : <p className="py-8 text-sm text-muted-foreground">No workflow runs yet.</p>}</div></div>
      <div className="space-y-6"><div className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Workflow contract</h2><div className="mt-4 space-y-2">{stages.map((stage, index) => <div key={stage} className="flex items-center gap-3 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">{index + 1}</span><span>{stage}</span></div>)}</div></div><div className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Runtime health</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm">{[['24h events', observability.totals?.total ?? 0], ['Avg duration', String(observability.totals?.avgDurationMs ?? 0) + ' ms'], ['Warnings', observability.totals?.warnings ?? 0], ['Errors', observability.totals?.errors ?? 0]].map(([label, value]) => <div key={String(label)}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div></div></div>
    </section>
  </main>
}