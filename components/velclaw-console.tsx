import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  Bot,
  Box,
  Boxes,
  CircleCheck,
  CircleDot,
  Clock3,
  Code2,
  GitBranch,
  Layers3,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Rocket,
  Search,
  Settings2,
  TerminalSquare,
  Workflow,
} from 'lucide-react'
import styles from './velclaw-console.module.css'

const nav = [
  ['Overview', Activity, '/console'],
  ['Projects', Boxes, '/repos/Velclaw/VELCLAW'],
  ['Agents', Bot, '/skills'],
  ['Code Space', Code2, '/builder'],
  ['Workflows', Workflow, '/tasks'],
  ['Deployments', Rocket, '/deploy'],
  ['Runtime', TerminalSquare, '/hosting'],
] as const

const projects = [
  { name: 'Velclaw Core', repo: 'VELCLAW', state: 'Healthy', updated: '2 min ago', progress: 92, href: '/repos/Velclaw/VELCLAW' },
  { name: 'Agent Runtime', repo: 'agent-runtime', state: 'Building', updated: '8 min ago', progress: 68, href: '/builder' },
  { name: 'Web Platform', repo: 'web-platform', state: 'Ready', updated: '31 min ago', progress: 100, href: '/deploy' },
]

const activity = [
  ['Deployment completed', 'Production runtime is healthy', '2 min ago', CircleCheck],
  ['Agent run finished', 'Review snapshot is ready', '8 min ago', Bot],
  ['Build started', 'Agent Runtime · main', '14 min ago', Play],
  ['Workspace updated', 'Environment variables synchronized', '31 min ago', Settings2],
] as const

export function VelclawConsole() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <button className={styles.iconButton} aria-label="Open navigation">
            <Menu size={18} />
          </button>
          <Link href="/" className={styles.brand}>
            <img src="/velclaw-mark.svg" alt="" />
            <span>velclaw</span>
          </Link>
          <span className={styles.divider} />
          <button className={styles.workspaceButton}>production <span>⌄</span></button>
        </div>
        <div className={styles.topActions}>
          <button className={styles.searchButton} aria-label="Search workspace"><Search size={16} /><span>Search</span><kbd>⌘ K</kbd></button>
          <button className={styles.iconButton} aria-label="Settings"><Settings2 size={17} /></button>
          <div className={styles.avatar} aria-label="Velclaw workspace">V</div>
        </div>
      </header>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <span className={styles.sectionLabel}>WORKSPACE</span>
            <span className={styles.online}><CircleDot size={10} /> <span>Online</span></span>
          </div>
          <nav className={styles.nav} aria-label="Console navigation">
            {nav.map(([label, Icon, href], index) => (
              <Link key={label} href={href} className={index === 0 ? styles.active : styles.navItem}>
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>
            <Link href="/hosting"><Layers3 size={16} /> <span>Environments</span></Link>
            <Link href="/settings"><Settings2 size={16} /> <span>Workspace settings</span></Link>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>WORKSPACE / PRODUCTION</span>
              <h1>Overview</h1>
              <p>Build, orchestrate and operate software from one workspace.</p>
            </div>
            <div className={styles.headerActions}>
              <Link className={styles.secondary} href="/repos/Velclaw/VELCLAW"><Search size={15} /> Find project</Link>
              <Link className={styles.primary} href="/builder"><Plus size={16} /> New project</Link>
            </div>
          </div>

          <div className={styles.metrics}>
            <article className={styles.metricCard}><div><span>Active projects</span><b>12</b></div><Boxes size={19} /></article>
            <article className={styles.metricCard}><div><span>Agent runs</span><b>48</b></div><Bot size={19} /></article>
            <article className={styles.metricCard}><div><span>Deployments</span><b>23</b></div><Rocket size={19} /></article>
            <article className={styles.metricCard}><div><span>Availability</span><b>99.98%</b></div><CircleCheck size={19} /></article>
          </div>

          <div className={styles.mainGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div><span className={styles.panelKicker}>PROJECTS</span><h2>Active work</h2></div>
                <Link href="/repos/Velclaw/VELCLAW">View all <ArrowUpRight size={14} /></Link>
              </div>
              <div className={styles.projectList}>
                {projects.map(project => (
                  <Link href={project.href} className={styles.projectRow} key={project.name}>
                    <div className={styles.projectIcon}><Box size={17} /></div>
                    <div className={styles.projectInfo}><strong>{project.name}</strong><span><GitBranch size={12} /> {project.repo}</span></div>
                    <div className={styles.projectState}><span className={project.state === 'Building' ? styles.building : styles.healthy}>{project.state}</span><small>{project.updated}</small></div>
                    <div className={styles.progress}><i style={{ width: `${project.progress}%` }} /></div>
                    <MoreHorizontal size={17} className={styles.more} />
                  </Link>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>RUNTIME</span><h2>System state</h2></div><span className={styles.live}>LIVE</span></div>
              <div className={styles.runtime}><div className={styles.runtimeRing}><span>98%</span></div><div><strong>All systems operational</strong><p>Agents, builds and deployment workers are responding normally.</p></div></div>
              <div className={styles.runtimeStats}><div><span>Workers</span><b>8 / 8</b></div><div><span>Queue</span><b>03</b></div><div><span>Latency</span><b>142ms</b></div></div>
            </section>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><span className={styles.panelKicker}>ACTIVITY</span><h2>Recent operations</h2></div><Link href="/tasks">Open activity <ArrowUpRight size={14} /></Link></div>
            <div className={styles.activityList}>
              {activity.map(([title, detail, time, Icon]) => (
                <div className={styles.activityRow} key={title}>
                  <div className={styles.activityIcon}><Icon size={15} /></div>
                  <div><strong>{title}</strong><span>{detail}</span></div>
                  <time><Clock3 size={13} /> {time}</time>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
