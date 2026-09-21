import Link from 'next/link'
import { ECOSYSTEM_LIFECYCLE, ECOSYSTEM_PROJECTS } from '@/lib/ecosystem/projects'

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-border pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-primary">VELCLAW / ECOSYSTEM</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Completed & active projects</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                Canonical project index for the Velclaw ecosystem. Each surface keeps its own runtime and repository boundary while
                sharing one workspace lifecycle and one visual language.
              </p>
            </div>
            <Link href="/docs/VELCLAW-INTEGRATION-CONTRACTS" className="border border-border px-4 py-2 font-mono text-xs transition hover:border-primary hover:text-primary">
              Read integration contracts ↗
            </Link>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-xs tracking-[0.16em] text-muted-foreground">PROJECT REGISTRY</h2>
            <span className="font-mono text-[11px] text-muted-foreground">{ECOSYSTEM_PROJECTS.length.toString().padStart(2, '0')} surfaces</span>
          </div>
          <div className="grid gap-px border border-border bg-border md:grid-cols-2">
            {ECOSYSTEM_PROJECTS.map((project) => {
              const external = project.status === 'external'
              const className = 'group bg-background p-5 transition hover:bg-accent/50'
              return external ? (
                <a key={project.id} href={project.href} target="_blank" rel="noreferrer" className={className}>
                  <ProjectCard project={project} />
                </a>
              ) : (
                <Link key={project.id} href={project.href} className={className}>
                  <ProjectCard project={project} />
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mt-10 border border-border p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-primary">CANONICAL LIFECYCLE</p>
              <h2 className="mt-2 text-xl font-medium">One delivery path, multiple specialized surfaces.</h2>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">v1 contract</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {ECOSYSTEM_LIFECYCLE.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="border border-border bg-card px-3 py-2 font-mono text-[11px]">{step}</span>
                {index < ECOSYSTEM_LIFECYCLE.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-border pt-5 font-mono text-[11px] text-muted-foreground">
          <span>velclaw.cfd / projects</span>
          <span>Repository boundaries remain explicit. Integration happens through contracts.</span>
        </footer>
      </div>
    </main>
  )
}

function ProjectCard({ project }: { project: (typeof ECOSYSTEM_PROJECTS)[number] }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[11px] text-primary">{project.id.toUpperCase()}</span>
        <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground">{project.status}</span>
      </div>
      <h3 className="mt-6 text-lg font-medium group-hover:text-primary">{project.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{project.role}</p>
      <p className="mt-6 font-mono text-[11px] text-muted-foreground">{project.path}</p>
    </>
  )
}
