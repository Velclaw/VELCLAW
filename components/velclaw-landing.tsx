'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import type { VelclawDomainRole } from '@/lib/velclaw/domain-config'
import styles from './velclaw-landing.module.css'

const products = [
  ['01', 'Builder', 'Tạo, sửa, chạy và preview ứng dụng ngay trong trình duyệt.', '/builder'],
  ['02', 'Tasks', 'Điều phối công việc, agent và trạng thái thực thi trong một luồng.', '/tasks'],
  ['03', 'Workspace', 'Code, repo, context, review và runtime cùng một control plane.', '/velclaw'],
  ['04', 'Deploy', 'Đưa software đã kiểm chứng từ branch tới production.', '/deploy'],
  ['05', 'MCP', 'Kết nối tools và context để agent hành động có kiểm soát.', '/mcp'],
  ['06', 'Plugins', 'Mở rộng năng lực workspace bằng các integration có thể tái sử dụng.', '/plugins'],
  ['07', 'Skills', 'Chuẩn hoá năng lực agent theo workflow và domain.', '/skills'],
  ['08', 'Ecosystem', 'Một registry thống nhất cho các surface và dịch vụ của Velclaw.', '/projects'],
] as const

const flow = [
  ['01', 'Task'],
  ['02', 'Agent'],
  ['03', 'Build'],
  ['04', 'Review'],
  ['05', 'Deploy'],
] as const

const principles = [
  ['01', 'Một workspace', 'Không tách agent, code, runtime và delivery thành những sản phẩm rời nhau.'],
  ['02', 'Có context', 'Agent làm việc trên project, file, repo, state và tooling thực tế.'],
  ['03', 'Có bằng chứng', 'Build, test, review và deployment tạo thành một chuỗi trạng thái có thể kiểm tra.'],
] as const

const domainIdentity: Record<
  VelclawDomainRole,
  { label: string; descriptor: string; cta: string; ctaHref: string }
> = {
  platform: { label: 'velclaw.app', descriptor: 'Platform & company', cta: 'Khám phá Platform', ctaHref: '/projects' },
  developer: {
    label: 'velclaw.dev',
    descriptor: 'Developer · IDE · Docs · API',
    cta: 'Mở Developer',
    ctaHref: '/builder',
  },
  application: {
    label: 'velclaw.app',
    descriptor: 'Application & services',
    cta: 'Mở Application',
    ctaHref: '/console',
  },
}

/**
 * Renders the Velclaw product landing page. The role selects the displayed domain
 * identity and primary call to action, defaulting to the platform when omitted.
 */
export function VelclawLanding({ role = 'platform' }: { role?: VelclawDomainRole }) {
  const identity = domainIdentity[role]

  return (
    <main className={styles.page}>
      <header className={styles.topnav}>
        <details className={styles.mobileMenu}>
          <summary className={styles.menuButton} aria-label="Mở menu">
            <Menu aria-hidden="true" size={17} strokeWidth={1.8} />
          </summary>
          <div className={styles.mobilePanel}>
            <Link href="#platform">Nền tảng</Link>
            <Link href="/console">Console</Link>
            <Link href="/builder">Builder</Link>
            <Link href="/velclaw">Workspace</Link>
            <Link href="/deploy">Deploy</Link>
            <Link href="/docs/">Docs</Link>
            <Link href="/projects">Ecosystem</Link>
          </div>
        </details>

        <Link href="/" className={styles.brand} aria-label="Velclaw home">
          <img className={styles.brandLogo} src="/velclaw-mark.svg" alt="Velclaw" />
          <span className={styles.brandName}>velclaw</span>
        </Link>

        <nav className={styles.navlinks} aria-label="Velclaw navigation">
          <Link className={styles.active} href="#platform">Nền tảng</Link>
          <Link href="/console">Console</Link>
          <Link href="/builder">Builder</Link>
          <Link href="/velclaw">Workspace</Link>
          <Link href="/docs/">Docs</Link>
        </nav>

        <div className={styles.authActions}>
          <Link className={styles.signIn} href="/auth/signin">Đăng nhập</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span />
            {identity.descriptor.toUpperCase()} · AI-NATIVE SOFTWARE WORKSPACE
          </div>
          <h1>
            Build software.
            <br />
            <em>Give agents context.</em>
          </h1>
          <p className={styles.lead}>
            Velclaw hợp nhất agent, code, project, build, runtime, review và deployment thành một workspace duy nhất —
            để ý tưởng đi thẳng tới software có thể vận hành.
          </p>
          <div className={styles.ctas}>
            <Link className={`${styles.btn} ${styles.primary}`} href={identity.ctaHref}>
              {identity.cta}
            </Link>
            <Link className={`${styles.btn} ${styles.ghost}`} href="/builder">
              Thử Builder
            </Link>
          </div>
          <div className={styles.domainLine}>
            <span className={styles.statusDot} />
            <span>{identity.label}</span>
            <span className={styles.separator}>·</span>
            <span>{identity.descriptor}</span>
          </div>
        </div>

        <div className={styles.commandPanel} aria-label="Velclaw browser builder preview">
          <div className={styles.panelHeader}>
            <span>VELCLAW / CONTROL PLANE</span>
            <span className={styles.live}>READY</span>
          </div>
          <div className={styles.commandBody}>
            <div><span className={styles.prompt}>$</span> velclaw run task</div>
            <div className={styles.dim}>agent <b>workspace-agent</b></div>
            <div className={styles.dim}>source <b>GitHub / branch</b></div>
            <div className={styles.dim}>runtime <b>WebContainer</b></div>
            <div className={styles.divider} />
            <div><span className={styles.ok}>✓</span> context loaded</div>
            <div><span className={styles.ok}>✓</span> workspace ready</div>
            <div><span className={styles.ok}>✓</span> checks passed</div>
            <div><span className={styles.arrow}>→</span> build <span className={styles.arrow}>→</span> review <span className={styles.arrow}>→</span> deploy</div>
          </div>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>
          AGENTS · CONTEXT · BUILDER · TASKS · WORKSPACE · BUILD · RUNTIME · REVIEW · GITHUB · DEPLOYMENT · AGENTS ·
          CONTEXT · BUILDER · TASKS · WORKSPACE · BUILD · RUNTIME · REVIEW · GITHUB · DEPLOYMENT ·{' '}
        </div>
      </div>

      <section id="platform" className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>01 / PLATFORM</span>
          <h2>Một control plane cho toàn bộ vòng đời phần mềm.</h2>
        </div>
        <div className={styles.productGrid}>
          {products.map(([num, title, text, href]) => (
            <Link className={styles.productCard} href={href} key={num}>
              <div className={styles.cardTop}>
                <span>{num}</span>
                <span className={styles.cardArrow}>↗</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>02 / WHY VELCLAW</span>
          <h2>Không chỉ là AI coding. Đây là lớp vận hành phía sau agent.</h2>
        </div>
        <div className={styles.productGrid}>
          {principles.map(([num, title, text]) => (
            <article className={styles.productCard} key={num}>
              <div className={styles.cardTop}>
                <span>{num}</span>
                <span className={styles.cardArrow}>+</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>03 / PIPELINE</span>
          <h2>Một đường đi rõ ràng từ task tới production.</h2>
        </div>
        <div className={styles.flow}>
          {flow.map(([num, title], index) => (
            <div className={styles.flowGroup} key={num}>
              <div className={styles.flowStep}>
                <span>{num}</span>
                <strong>{title}</strong>
              </div>
              {index < flow.length - 1 && (
                <span className={styles.flowArrow} aria-hidden="true">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>04 / UNIFIED WORKSPACE</span>
          <h2>Một cửa vào cho toàn bộ hiện trạng Velclaw.</h2>
        </div>
        <div className={styles.integrationGrid}>
          <Link className={styles.integrationCard} href="/velclaw">
            <span>01</span>
            <strong>Workspace & Agents</strong>
            <p>Task, agent runtime, sandbox, review và GitHub PR trong cùng một luồng.</p>
            <b>Mở workspace ↗</b>
          </Link>
          <Link className={styles.integrationCard} href="/deploy">
            <span>02</span>
            <strong>Build & Delivery</strong>
            <p>Build, runtime evidence, deployment và rollback được nối vào lớp delivery.</p>
            <b>Mở delivery ↗</b>
          </Link>
          <Link className={styles.integrationCard} href="/mcp">
            <span>03</span>
            <strong>Tools & Context</strong>
            <p>MCP, plugins, skills và API keys cung cấp năng lực cho agent mà không tách rời sản phẩm.</p>
            <b>Mở tools ↗</b>
          </Link>
          <Link className={styles.integrationCard} href="/console">
            <span>04</span>
            <strong>Builder & Preview</strong>
            <p>Code, filesystem, preview và kiểm tra ứng dụng ngay trong browser.</p>
            <b>Mở console ↗</b>
          </Link>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div>
          <span className={styles.k}>05 / START BUILDING</span>
          <h3>Build, review và ship software từ một workspace.</h3>
          <p>Không cần chuyển ngữ cảnh giữa agent, IDE, CI, review và deployment.</p>
        </div>
        <Link className={`${styles.btn} ${styles.primary}`} href="/console">
          Mở Console
        </Link>
      </section>

      <footer>
        <span className={styles.mono}>{identity.label}</span>
        <span>AI-native software lifecycle workspace</span>
      </footer>
    </main>
  )
}
