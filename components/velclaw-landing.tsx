'use client'

import Link from 'next/link'
import styles from './velclaw-landing.module.css'

const products = [
  ['01', 'Tasks', 'Tạo và điều phối công việc cho agent.', '/tasks'],
  ['02', 'Workspace', 'Code, repo, review và runtime trong một nơi.', '/velclaw'],
  ['03', 'Deploy', 'Đưa ứng dụng từ GitHub tới production.', '/deploy'],
  ['04', 'MCP', 'Kết nối tools và context cho agent.', '/mcp'],
  ['05', 'Plugins', 'Mở rộng workspace bằng hệ sinh thái plugin.', '/plugins'],
  ['06', 'Skills', 'Chuẩn hoá năng lực agent theo workflow.', '/skills'],
] as const

const flow = [
  ['01', 'Task'],
  ['02', 'Agent'],
  ['03', 'Build'],
  ['04', 'Review'],
  ['05', 'Deploy'],
] as const

export function VelclawLanding() {
  return (
    <main className={styles.page}>
      <nav className={styles.topnav} aria-label="Velclaw navigation">
        <Link href="/" className={styles.brand} aria-label="Velclaw home">
          <span className={styles.brandMark} aria-hidden="true">V</span>
          <span>velclaw</span>
        </Link>
        <div className={styles.navlinks}>
          <Link className={styles.active} href="#platform">Platform</Link>
          <Link href="/deploy">Deploy</Link>
          <Link href="/velclaw">Workspace</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span />AI-NATIVE SOFTWARE WORKSPACE</div>
          <h1>Build. Review. Deploy.<br /><em>With Velclaw.</em></h1>
          <p className={styles.lead}>
            Một workspace duy nhất để agent và developer đi từ task đến production — code, project, build, runtime, review và deployment nằm trong cùng một vòng đời.
          </p>
          <div className={styles.ctas}>
            <Link className={`${styles.btn} ${styles.primary}`} href="/new">Tạo Task</Link>
            <Link className={`${styles.btn} ${styles.ghost}`} href="/velclaw">Mở Workspace</Link>
          </div>
          <div className={styles.domainLine}>
            <span className={styles.statusDot} />
            <span>velclaw.cfd</span>
            <span className={styles.separator}>·</span>
            <span>AI-native software lifecycle</span>
          </div>
        </div>

        <div className={styles.commandPanel} aria-label="Velclaw execution preview">
          <div className={styles.panelHeader}>
            <span>VELCLAW / EXECUTION</span>
            <span className={styles.live}>READY</span>
          </div>
          <div className={styles.commandBody}>
            <div><span className={styles.prompt}>$</span> velclaw task create</div>
            <div className={styles.dim}>repository <b>Velclaw/Velclaw</b></div>
            <div className={styles.dim}>agent <b>codex</b></div>
            <div className={styles.dim}>runtime <b>sandbox</b></div>
            <div className={styles.dim}>review <b>gito</b></div>
            <div className={styles.divider} />
            <div><span className={styles.ok}>✓</span> executor ready</div>
            <div><span className={styles.ok}>✓</span> checks queued</div>
            <div><span className={styles.arrow}>→</span> PR <span className={styles.arrow}>→</span> review <span className={styles.arrow}>→</span> deployment</div>
          </div>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>AGENTS · TASKS · WORKSPACE · BUILD · RUNTIME · REVIEW · GITHUB · DEPLOYMENT · AGENTS · TASKS · WORKSPACE · BUILD · RUNTIME · REVIEW · GITHUB · DEPLOYMENT · </div>
      </div>

      <section id="platform" className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>01 / PLATFORM</span>
          <h2>Mọi thứ agent cần để ship software, không cần nhảy giữa nhiều công cụ.</h2>
        </div>
        <div className={styles.productGrid}>
          {products.map(([num, title, text, href]) => (
            <Link className={styles.productCard} href={href} key={num}>
              <div className={styles.cardTop}><span>{num}</span><span className={styles.cardArrow}>↗</span></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>02 / PIPELINE</span>
          <h2>Một đường đi rõ ràng từ ý tưởng tới production.</h2>
        </div>
        <div className={styles.flow}>
          {flow.map(([num, title], index) => (
            <div className={styles.flowGroup} key={num}>
              <div className={styles.flowStep}>
                <span>{num}</span>
                <strong>{title}</strong>
              </div>
              {index < flow.length - 1 && <span className={styles.flowArrow} aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div>
          <span className={styles.k}>03 / START</span>
          <h3>Đưa task đầu tiên vào Velclaw.</h3>
          <p>Workspace hiện tại vẫn giữ nguyên tại /velclaw.</p>
        </div>
        <Link className={`${styles.btn} ${styles.primary}`} href="/new">Bắt đầu</Link>
      </section>

      <footer>
        <span className={styles.mono}>velclaw.cfd</span>
        <span>AI-native software lifecycle workspace</span>
      </footer>
    </main>
  )
}
