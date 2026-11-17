import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)

function loadLanding() {
  // The Node runner does not bundle CSS modules. Stub only this component's
  // stylesheet while loading it, then restore the loader for other imports.
  const stylesheet = require.resolve('../components/velclaw-landing.module.css')
  const previousLoader = require.extensions['.css']
  require.extensions['.css'] = (module, filename) => {
    assert.equal(filename, stylesheet)
    module.exports = {}
  }
  try {
    return require('../components/velclaw-landing') as typeof import('../components/velclaw-landing')
  } finally {
    if (previousLoader) require.extensions['.css'] = previousLoader
    else delete require.extensions['.css']
    delete require.cache[stylesheet]
  }
}

const { VelclawLanding } = loadLanding()

function renderLanding(props: ComponentProps<typeof VelclawLanding> = {}) {
  return renderToStaticMarkup(createElement(VelclawLanding, props))
}

// These helpers inspect the real rendered HTML without tying assertions to CSS
// module hashes or adding a DOM dependency for this static component.
function text(markup: string) {
  return markup
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function elements(markup: string, tag: string) {
  return [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((match) => match[1])
}

function section(markup: string, label: string) {
  const matches = elements(markup, 'section').filter((content) => text(content).includes(label))
  assert.equal(matches.length, 1, `expected one section containing ${label}`)
  return matches[0]
}

function links(markup: string) {
  return [...markup.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => ({
    href: match[1],
    label: text(match[2]),
  }))
}

test('omitted and explicitly undefined roles both render the platform landing page', () => {
  const platform = renderLanding({ role: 'platform' })
  assert.equal(renderLanding(), platform)
  assert.equal(renderLanding({ role: undefined }), platform)
  assert.ok(links(section(platform, 'Build software.')).some((link) => link.label === 'Khám phá Platform'))
})

const identities = [
  ['platform', 'velclaw.app', 'Platform & company', 'Khám phá Platform', '/projects'],
  ['developer', 'velclaw.dev', 'Developer · IDE · Docs · API', 'Mở Developer', '/builder'],
  ['application', 'velclaw.app', 'Application & services', 'Mở Application', '/console'],
] as const

for (const [role, domain, descriptor, cta, href] of identities) {
  test(`${role} retains its own identity and primary destination alongside the new Builder CTA`, () => {
    const markup = renderLanding({ role })
    const hero = section(markup, 'Build software.')
    assert.deepEqual(links(hero), [
      { href, label: cta },
      { href: '/builder', label: 'Thử Builder' },
    ])
    assert.ok(text(hero).includes(`${descriptor.toUpperCase()} · AI-NATIVE SOFTWARE WORKSPACE`))
    assert.ok(text(hero).includes(`${domain} · ${descriptor}`))
    assert.deepEqual(elements(markup, 'footer').map(text), [`${domain} AI-native software lifecycle workspace`])
    assert.doesNotMatch(markup, /velclaw\.site/)
    for (const [otherRole, , , otherCta] of identities) {
      if (otherRole !== role) assert.ok(!text(hero).includes(otherCta))
    }
  })
}

test('hero presents the software workspace and agent context positioning', () => {
  const markup = renderLanding()
  assert.deepEqual(elements(markup, 'h1').map(text), ['Build software. Give agents context.'])
  assert.deepEqual(elements(section(markup, 'Build software.'), 'p').map(text), [
    'Velclaw hợp nhất agent, code, project, build, runtime, review và deployment thành một workspace duy nhất — để ý tưởng đi thẳng tới software có thể vận hành.',
  ])
})

test('desktop and mobile navigation expose the revised labels and Docs destination', () => {
  const markup = renderLanding()
  const [header] = elements(markup, 'header')
  const [desktop] = elements(header, 'nav')
  const [mobile] = elements(header, 'details')
  const common = [
    { href: '#platform', label: 'Nền tảng' },
    { href: '/console', label: 'Console' },
    { href: '/builder', label: 'Builder' },
    { href: '/velclaw', label: 'Workspace' },
  ]
  // Next Link normalizes the source's /docs/ destination to /docs.
  assert.deepEqual(links(desktop), [...common, { href: '/docs', label: 'Docs' }])
  assert.deepEqual(links(mobile), [
    ...common,
    { href: '/deploy', label: 'Deploy' },
    { href: '/docs', label: 'Docs' },
    { href: '/projects', label: 'Ecosystem' },
  ])
  assert.match(header, /<nav\b[^>]*aria-label="Velclaw navigation"/)
  assert.match(mobile, /<summary\b[^>]*aria-label="Mở menu"/)
  assert.equal([...markup.matchAll(/\bid="platform"/g)].length, 1, 'both platform links need a unique target')
})

const products = [
  ['Builder', '/builder', 'Tạo, sửa, chạy và preview ứng dụng ngay trong trình duyệt.'],
  ['Tasks', '/tasks', 'Điều phối công việc, agent và trạng thái thực thi trong một luồng.'],
  ['Workspace', '/velclaw', 'Code, repo, context, review và runtime cùng một control plane.'],
  ['Deploy', '/deploy', 'Đưa software đã kiểm chứng từ branch tới production.'],
  ['MCP', '/mcp', 'Kết nối tools và context để agent hành động có kiểm soát.'],
  ['Plugins', '/plugins', 'Mở rộng năng lực workspace bằng các integration có thể tái sử dụng.'],
  ['Skills', '/skills', 'Chuẩn hoá năng lực agent theo workflow và domain.'],
  ['Ecosystem', '/projects', 'Một registry thống nhất cho các surface và dịch vụ của Velclaw.'],
] as const

test('platform retains all eight product destinations in order under its new heading', () => {
  const platform = section(renderLanding(), '01 / PLATFORM')
  assert.deepEqual(elements(platform, 'h2').map(text), ['Một control plane cho toàn bộ vòng đời phần mềm.'])
  assert.deepEqual(
    elements(platform, 'h3').map(text),
    products.map(([title]) => title),
  )
  assert.deepEqual(
    links(platform).map(({ href }) => href),
    products.map(([, href]) => href),
  )
})

for (const [index, [title, href, description]] of products.entries()) {
  test(`${title} card associates its description and number with the correct route`, () => {
    const platform = section(renderLanding(), '01 / PLATFORM')
    const cards = elements(platform, 'a')
    const card = cards[index]
    assert.deepEqual(elements(card, 'h3').map(text), [title])
    assert.deepEqual(elements(card, 'p').map(text), [description])
    assert.equal(text(elements(card, 'span')[0]), String(index + 1).padStart(2, '0'))
    assert.equal(links(platform)[index].href, href)
  })
}

test('new principles are three numbered informational articles, not product links', () => {
  const principles = section(renderLanding(), '02 / WHY VELCLAW')
  assert.deepEqual(elements(principles, 'h2').map(text), [
    'Không chỉ là AI coding. Đây là lớp vận hành phía sau agent.',
  ])
  const articles = elements(principles, 'article')
  assert.equal(articles.length, 3)
  assert.deepEqual(
    articles.map((article) => elements(article, 'h3').map(text)),
    [['Một workspace'], ['Có context'], ['Có bằng chứng']],
  )
  assert.deepEqual(
    articles.map((article) => elements(article, 'p').map(text)),
    [
      ['Không tách agent, code, runtime và delivery thành những sản phẩm rời nhau.'],
      ['Agent làm việc trên project, file, repo, state và tooling thực tế.'],
      ['Build, test, review và deployment tạo thành một chuỗi trạng thái có thể kiểm tra.'],
    ],
  )
  assert.deepEqual(
    articles.map((article) => text(elements(article, 'span')[0])),
    ['01', '02', '03'],
  )
  assert.deepEqual(links(principles), [])
  assert.doesNotMatch(principles, /<(?:button|input)\b/)
})

test('inserting principles leaves subsequent sections numbered consecutively without duplicates', () => {
  const sections = elements(renderLanding(), 'section')
  assert.equal(sections.length, 6, 'hero followed by five numbered sections')
  assert.deepEqual(
    sections.slice(1).map((content) => text(elements(content, 'span')[0])),
    ['01 / PLATFORM', '02 / WHY VELCLAW', '03 / PIPELINE', '04 / UNIFIED WORKSPACE', '05 / START BUILDING'],
  )
  const pipeline = section(renderLanding(), '03 / PIPELINE')
  assert.deepEqual(elements(pipeline, 'h2').map(text), ['Một đường đi rõ ràng từ task tới production.'])
  assert.deepEqual(elements(pipeline, 'strong').map(text), ['Task', 'Agent', 'Build', 'Review', 'Deploy'])
})

test('command preview presents task context and successful checks before build, review and deploy', () => {
  const hero = section(renderLanding(), 'Build software.')
  assert.match(hero, /aria-label="Velclaw browser builder preview"/)
  assert.ok(
    text(hero).includes(
      'VELCLAW / CONTROL PLANE READY $ velclaw run task agent workspace-agent source GitHub / branch runtime WebContainer ✓ context loaded ✓ workspace ready ✓ checks passed → build → review → deploy',
    ),
  )
  assert.doesNotMatch(hero, /velclaw builder|filesystem ready|node runtime ready/)
})

test('decorative lifecycle marquee includes context in both repetitions and stays hidden from assistive technology', () => {
  const markup = renderLanding()
  const marquee = markup.match(/<div\b[^>]*aria-hidden="true"[^>]*>([\s\S]*?)<\/div>/)
  assert.ok(marquee)
  const cycle = 'AGENTS · CONTEXT · BUILDER · TASKS · WORKSPACE · BUILD · RUNTIME · REVIEW · GITHUB · DEPLOYMENT ·'
  assert.equal(text(marquee[1]), `${cycle} ${cycle}`)
})

test('renamed Build & Delivery card still sends visitors to Deploy', () => {
  const workspace = section(renderLanding(), '04 / UNIFIED WORKSPACE')
  assert.deepEqual(elements(workspace, 'h2').map(text), ['Một cửa vào cho toàn bộ hiện trạng Velclaw.'])
  const delivery = links(workspace).filter(({ label }) => label.includes('Build & Delivery'))
  assert.deepEqual(delivery, [
    {
      href: '/deploy',
      label:
        '02 Build & Delivery Build, runtime evidence, deployment và rollback được nối vào lớp delivery. Mở delivery ↗',
    },
  ])
  assert.doesNotMatch(workspace, /Autoship/)
})

test('closing workspace CTA uses the new message and keeps Console as its destination', () => {
  const cta = section(renderLanding(), '05 / START BUILDING')
  assert.deepEqual(elements(cta, 'h3').map(text), ['Build, review và ship software từ một workspace.'])
  assert.deepEqual(elements(cta, 'p').map(text), [
    'Không cần chuyển ngữ cảnh giữa agent, IDE, CI, review và deployment.',
  ])
  assert.deepEqual(links(cta), [{ href: '/console', label: 'Mở Console' }])
  assert.doesNotMatch(cta, /điện thoại/)
})
