'use client'

import Link from 'next/link'
import styles from './velclaw-landing.module.css'

const features = [
  ['01', 'AI Agents', 'Agentic coding, review và automation trong cùng một workspace.'],
  ['02', 'Workspace', 'Một không gian duy nhất cho task, repository, project và runtime.'],
  ['03', 'Build', 'Build và kiểm tra ứng dụng với pipeline có thể quan sát được.'],
  ['04', 'Runtime', 'Sandbox và self-hosted runtime cho các workload của Velclaw.'],
  ['05', 'Storage', 'Lưu trữ dữ liệu ứng dụng và file một cách bền vững.'],
  ['06', 'GitHub', 'Tích hợp repository, code review và quy trình bàn giao.'],
] as const

const flow = [
  ['01', 'Issue / Task'],
  ['02', 'Agent + Developer'],
  ['03', 'Build + Runtime'],
  ['04', 'PR → Review → Merge'],
  ['05', 'Deployment'],
] as const

export function VelclawLanding() {
  return (
    <main className={styles.page}>
      <nav className={styles.topnav} aria-label="Velclaw navigation">
        <Link href="/" className={styles.brand} aria-label="Velclaw home">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 20L9 4M9 20L13 6M13 20L18 5M18 20L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
          velclaw
        </Link>
        <div className={styles.navlinks}>
          <a className={styles.active} href="#overview">Tổng quan</a>
          <Link href="/deploy">Deploy</Link>
          <Link href="/velclaw">Workspace</Link>
        </div>
      </nav>

      <section id="overview" className={styles.hero}>
        <div>
          <div className={styles.eyebrow}><span />github.com/Velclaw/Velclaw · phần mềm private</div>
          <h1>Không gian làm việc AI-native cho vòng đời phần mềm.</h1>
          <p className={styles.lead}>
            Velclaw gom agent, code, project, build, runtime, storage, review và deployment vào một workspace duy nhất — để agent lập trình và developer không phải nhảy qua lại giữa các công cụ rời rạc.
          </p>
          <div className={styles.ctas}>
            <a className={`${styles.btn} ${styles.primary}`} href="https://github.com/Velclaw/Velclaw" target="_blank" rel="noopener noreferrer">Xem trên GitHub</a>
            <Link className={`${styles.btn} ${styles.ghost}`} href="/deploy">Xem trang Deploy</Link>
          </div>
        </div>

        <div className={styles.terminal}>
          <div className={styles.terminalBar}><span /><span /><span /></div>
          <pre>{`$ velclaw task create
> repository: Velclaw/Velclaw
> agent: codex
> runtime: sandbox
> review: gito

✓ task accepted
✓ executor ready
✓ checks queued
→ PR → review → deployment`}</pre>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>AGENTS · WORKSPACE · BUILD · RUNTIME · STORAGE · REVIEW · GITHUB · DEPLOYMENT · AGENTS · WORKSPACE · BUILD · RUNTIME · STORAGE · REVIEW · GITHUB · DEPLOYMENT · </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>01 / PLATFORM</span>
          <h2>Một lớp điều phối thống nhất cho toàn bộ vòng đời software.</h2>
        </div>
        <div className={styles.features}>
          {features.map(([num, title, text]) => (
            <article className={styles.feature} key={num}>
              <div className={styles.num}>{num}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.k}>02 / PIPELINE</span>
          <h2>Task → execution → review → gate → GitHub → deployment.</h2>
        </div>
        <div className={styles.flow}>
          {flow.map(([num, title], index) => (
            <div className={styles.flowGroup} key={num}>
              <div className={styles.flowStep}>
                <div className={styles.flowNumber}>{num}</div>
                <h4>{title}</h4>
              </div>
              {index < flow.length - 1 && <div className={styles.arrow} aria-hidden="true">›</div>}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div>
          <h3>Đi từ task đến production mà không rời Velclaw.</h3>
          <p>Workspace hiện tại vẫn giữ nguyên tại /velclaw.</p>
        </div>
        <Link className={`${styles.btn} ${styles.primary}`} href="/new">Tạo Task</Link>
      </section>

      <footer>
        <span className={styles.mono}>velclaw.cfd</span>
        <span>AI-native software lifecycle workspace</span>
      </footer>
    </main>
  )
}
