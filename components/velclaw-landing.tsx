'use client'

import Link from 'next/link'
import styles from './velclaw-landing.module.css'

const products = [
  ['01', 'Builder', 'Tạo, sửa, chạy và preview ứng dụng ngay trong trình duyệt.', '/builder'],
  ['02', 'Tasks', 'Tạo và điều phối công việc cho agent.', '/tasks'],
  ['03', 'Workspace', 'Code, repo, review và runtime trong một nơi.', '/velclaw'],
  ['04', 'Deploy', 'Đưa ứng dụng từ GitHub tới production.', '/deploy'],
  ['05', 'MCP', 'Kết nối tools và context cho agent.', '/mcp'],
  ['06', 'Plugins', 'Mở rộng workspace bằng hệ sinh thái plugin.', '/plugins'],
  ['07', 'Skills', 'Chuẩn hoá năng lực agent theo workflow.', '/skills'],
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
        <Link href="/" className={styles.brand} aria-label="Velclaw home"><span className={styles.brandMark} aria-hidden="true">V</span><span>velclaw</span></Link>
        <div className={styles.navlinks}><Link className={styles.active} href="#platform">Platform</Link><Link href="/builder">Builder</Link><Link href="/deploy">Deploy</Link><Link href="/velclaw">Workspace</Link></div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span />AI-NATIVE SOFTWARE WORKSPACE</div>
          <h1>Build. Review. Deploy.<br /><em>With Velclaw.</em></h1>
          <p className={styles.lead}>Một workspace duy nhất để agent và developer đi từ task đến production — code, project, build, runtime, review và deployment nằm trong cùng một vòng đời.</p>
          <div className={styles.ctas}><Link className={`${styles.btn} ${styles.primary}`} href="/builder">Mở Builder</Link><Link className={`${styles.btn} ${styles.ghost}`} href="/velclaw">Mở Workspace</Link></div>
          <div className={styles.domainLine}><span className={styles.statusDot} /><span>velclaw.cfd</span><span className={styles.separator}>·</span><span>Browser-first development</span></div>
        </div>
        <div className={styles.commandPanel} aria-label="Velclaw browser builder preview">
          <div className={styles.panelHeader}><span>VELCLAW / BUILDER</span><span className={styles.live}>READY</span></div>
          <div className={styles.commandBody}><div><span className={styles.prompt}>$</span> velclaw builder</div><div className={styles.dim}>runtime <b>WebContainer</b></div><div className={styles.dim}>environment <b>browser</b></div><div className={styles.dim}>source <b>GitHub</b></div><div className={styles.divider} /><div><span className={styles.ok}>✓</span> filesystem ready</div><div><span className={styles.ok}>✓</span> node runtime ready</div><div><span className={styles.arrow}>→</span> edit <span className={styles.arrow}>→</span> preview <span className={styles.arrow}>→</span> deploy</div></div>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true"><div>AGENTS · BUILDER · TASKS · WORKSPACE · BUILD · RUNTIME · REVIEW · GITHUB · DEPLOYMENT · AGENTS · BUILDER · TASKS · WORKSPACE · BUILD · RUNTIME · REVIEW · GITHUB · DEPLOYMENT · </div></div>

      <section id="platform" className={styles.section}><div className={styles.sectionHead}><span className={styles.k}>01 / PLATFORM</span><h2>Mọi thứ agent cần để ship software, không cần nhảy giữa nhiều công cụ.</h2></div><div className={styles.productGrid}>{products.map(([num, title, text, href]) => <Link className={styles.productCard} href={href} key={num}><div className={styles.cardTop}><span>{num}</span><span className={styles.cardArrow}>↗</span></div><h3>{title}</h3><p>{text}</p></Link>)}</div></section>

      <section className={styles.section}><div className={styles.sectionHead}><span className={styles.k}>02 / PIPELINE</span><h2>Một đường đi rõ ràng từ ý tưởng tới production.</h2></div><div className={styles.flow}>{flow.map(([num, title], index) => <div className={styles.flowGroup} key={num}><div className={styles.flowStep}><span>{num}</span><strong>{title}</strong></div>{index < flow.length - 1 && <span className={styles.flowArrow} aria-hidden="true">→</span>}</div>)}</div></section>

      <section className={styles.ctaBand}><div><span className={styles.k}>03 / BUILD</span><h3>Build ngay trên điện thoại bằng trình duyệt.</h3><p>Velclaw Builder chạy Node.js và preview trong browser; không cần biến điện thoại thành server.</p></div><Link className={`${styles.btn} ${styles.primary}`} href="/builder">Mở Builder</Link></section>

      <footer><span className={styles.mono}>velclaw.cfd</span><span>AI-native software lifecycle workspace</span></footer>
    </main>
  )
}
