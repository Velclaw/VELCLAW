import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)

function loadLanding() {
  // Node cannot load CSS modules. Stub only the landing stylesheet while loading
  // the real component; restore the loader before any tests or other imports run.
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

function contents(markup: string, tag: string) {
  return Array.from(markup.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g')), (match) => match[1])
}

function text(markup: string) {
  return markup
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function section(markup: string, label: string) {
  const matches = contents(markup, 'section').filter((content) => text(content).includes(label))
  assert.equal(matches.length, 1, `expected one section for ${label}`)
  return matches[0]
}

function links(markup: string) {
  return Array.from(markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g), (match) => {
    const href = match[1].match(/\bhref="([^"]*)"/)
    assert.ok(href, 'link must have a destination')
    return { href: href[1], label: text(match[2]), content: match[2] }
  })
}

function destinations(markup: string) {
  return links(markup).map(({ href, label }) => ({ href, label }))
}

const identities = [
  {
    role: 'platform',
    domain: 'velclaw.app',
    descriptor: 'Platform & company',
    cta: 'Khám phá Platform',
    href: '/projects',
  },
  {
    role: 'developer',
    domain: 'velclaw.dev',
    descriptor: 'Developer · IDE · Docs · API',
    cta: 'Mở Developer',
    href: '/builder',
  },
  {
    role: 'application',
    domain: 'velclaw.app',
    descriptor: 'Application & services',
    cta: 'Mở Application',
    href: '/console',
  },
] as const

for (const identity of identities) {
  test(`${identity.role} branding keeps its descriptor and primary CTA paired with the correct route`, () => {
    const markup = renderLanding({ role: identity.role })
    const hero = contents(markup, 'section')[0]
    const heroText = text(hero)

    assert.ok(heroText.includes(`${identity.descriptor.toUpperCase()} · AI-NATIVE SOFTWARE WORKSPACE`))
    assert.ok(heroText.includes(`${identity.domain} · ${identity.descriptor}`))
    assert.deepEqual(destinations(hero), [
      { href: identity.href, label: identity.cta },
      { href: '/builder', label: 'Thử Builder' },
    ])
    assert.deepEqual(contents(markup, 'footer').map(text), [
      `${identity.domain} AI-native software lifecycle workspace`,
    ])
    for (const other of identities.filter(({ role }) => role !== identity.role)) {
      assert.ok(!heroText.includes(other.cta), `unexpected ${other.role} CTA`)
      assert.ok(!heroText.includes(other.descriptor), `unexpected ${other.role} descriptor`)
    }
  })
}

test('omitted and explicitly undefined roles both default to the updated platform identity', () => {
  const platform = renderLanding({ role: 'platform' })
  assert.equal(renderLanding(), platform)
  assert.equal(renderLanding({ role: undefined }), platform)
  assert.doesNotMatch(platform, /velclaw\.site|Mở Platform/)
})

test('switching roles between renders does not retain the previous domain identity', () => {
  for (const role of ['developer', 'application', 'platform', 'developer'] as const) {
    const identity = identities.find((item) => item.role === role)!
    const hero = contents(renderLanding({ role }), 'section')[0]
    assert.deepEqual(destinations(hero)[0], { href: identity.href, label: identity.cta })
    assert.ok(text(hero).includes(`${identity.domain} · ${identity.descriptor}`))
  }
})

test('desktop and mobile navigation expose the revised labels and documentation route', () => {
  const markup = renderLanding()
  const common = [
    { href: '#platform', label: 'Nền tảng' },
    { href: '/console', label: 'Console' },
    { href: '/builder', label: 'Builder' },
    { href: '/velclaw', label: 'Workspace' },
  ]
  const [desktop] = contents(markup, 'nav')
  const [mobile] = contents(markup, 'details')
  // Next Link renders the documentation URL without its trailing slash.
  assert.deepEqual(destinations(desktop), [...common, { href: '/docs', label: 'Docs' }])
  assert.deepEqual(destinations(mobile), [
    ...common,
    { href: '/deploy', label: 'Deploy' },
    { href: '/docs', label: 'Docs' },
    { href: '/projects', label: 'Ecosystem' },
  ])
  assert.match(markup, /<nav\b[^>]*aria-label="Velclaw navigation"/)
  assert.match(mobile, /<summary\b[^>]*aria-label="Mở menu"/)
  assert.match(markup, /<section\b[^>]*id="platform"/)
  assert.doesNotMatch(mobile, /href="\/(?:skills|plugins)"/)
})

test('the hero presents the software workspace message and emphasizes agent context', () => {
  const markup = renderLanding()
  const hero = contents(markup, 'section')[0]
  assert.deepEqual(contents(markup, 'h1').map(text), ['Build software. Give agents context.'])
  assert.deepEqual(contents(hero, 'em').map(text), ['Give agents context.'])
  assert.deepEqual(contents(hero, 'p').map(text), [
    'Velclaw hợp nhất agent, code, project, build, runtime, review và deployment thành một workspace duy nhất — để ý tưởng đi thẳng tới software có thể vận hành.',
  ])
})

test('the command preview shows task context, readiness evidence and delivery in order', () => {
  const hero = contents(renderLanding(), 'section')[0]
  assert.match(hero, /aria-label="Velclaw browser builder preview"/)
  assert.ok(
    text(hero).includes(
      'VELCLAW / CONTROL PLANE READY $ velclaw run task agent workspace-agent source GitHub / branch runtime WebContainer ✓ context loaded ✓ workspace ready ✓ checks passed → build → review → deploy',
    ),
  )
  assert.doesNotMatch(hero, /velclaw builder|environment|filesystem ready|node runtime ready/)
})

test('all product cards retain their destinations alongside the revised product descriptions', () => {
  const platform = section(renderLanding(), '01 / PLATFORM')
  assert.deepEqual(contents(platform, 'h2').map(text), ['Một control plane cho toàn bộ vòng đời phần mềm.'])
  assert.deepEqual(
    links(platform).map(({ href, content }) => ({
      href,
      title: contents(content, 'h3').map(text),
      description: contents(content, 'p').map(text),
    })),
    [
      ['/builder', 'Builder', 'Tạo, sửa, chạy và preview ứng dụng ngay trong trình duyệt.'],
      ['/tasks', 'Tasks', 'Điều phối công việc, agent và trạng thái thực thi trong một luồng.'],
      ['/velclaw', 'Workspace', 'Code, repo, context, review và runtime cùng một control plane.'],
      ['/deploy', 'Deploy', 'Đưa software đã kiểm chứng từ branch tới production.'],
      ['/mcp', 'MCP', 'Kết nối tools và context để agent hành động có kiểm soát.'],
      ['/plugins', 'Plugins', 'Mở rộng năng lực workspace bằng các integration có thể tái sử dụng.'],
      ['/skills', 'Skills', 'Chuẩn hoá năng lực agent theo workflow và domain.'],
      ['/projects', 'Ecosystem', 'Một registry thống nhất cho các surface và dịch vụ của Velclaw.'],
    ].map(([href, title, description]) => ({ href, title: [title], description: [description] })),
  )
})

test('the new principles render as three informative articles without navigation links', () => {
  const principles = section(renderLanding(), '02 / WHY VELCLAW')
  assert.deepEqual(contents(principles, 'h2').map(text), [
    'Không chỉ là AI coding. Đây là lớp vận hành phía sau agent.',
  ])
  assert.deepEqual(contents(principles, 'article').map(text), [
    '01 + Một workspace Không tách agent, code, runtime và delivery thành những sản phẩm rời nhau.',
    '02 + Có context Agent làm việc trên project, file, repo, state và tooling thực tế.',
    '03 + Có bằng chứng Build, test, review và deployment tạo thành một chuỗi trạng thái có thể kiểm tra.',
  ])
  assert.deepEqual(destinations(principles), [])
})

test('inserting the principles keeps section numbering unique and the task pipeline in order', () => {
  const markup = renderLanding()
  const numberedSections = contents(markup, 'section').slice(1)
  assert.deepEqual(
    numberedSections.map((content) => text(contents(content, 'span')[0])),
    ['01 / PLATFORM', '02 / WHY VELCLAW', '03 / PIPELINE', '04 / UNIFIED WORKSPACE', '05 / START BUILDING'],
  )
  const pipeline = section(markup, '03 / PIPELINE')
  assert.deepEqual(contents(pipeline, 'h2').map(text), ['Một đường đi rõ ràng từ task tới production.'])
  assert.deepEqual(contents(pipeline, 'strong').map(text), ['Task', 'Agent', 'Build', 'Review', 'Deploy'])
  assert.equal(contents(pipeline, 'span').filter((content) => text(content) === '→').length, 4)
  assert.ok(text(pipeline).endsWith('05 Deploy'), 'the final deploy step must not have a trailing arrow')
})

test('the renamed delivery card remains connected to the deploy surface', () => {
  const workspace = section(renderLanding(), '04 / UNIFIED WORKSPACE')
  assert.deepEqual(contents(workspace, 'h2').map(text), ['Một cửa vào cho toàn bộ hiện trạng Velclaw.'])
  const delivery = links(workspace).filter(({ content }) =>
    contents(content, 'strong').map(text).includes('Build & Delivery'),
  )
  assert.equal(delivery.length, 1)
  assert.equal(delivery[0].href, '/deploy')
  assert.deepEqual(contents(delivery[0].content, 'p').map(text), [
    'Build, runtime evidence, deployment và rollback được nối vào lớp delivery.',
  ])
  assert.doesNotMatch(workspace, /Build &amp; Autoship|&amp;amp;/)
})

test('the final call to action promotes a unified workspace and still opens Console', () => {
  const cta = section(renderLanding(), '05 / START BUILDING')
  assert.deepEqual(contents(cta, 'h3').map(text), ['Build, review và ship software từ một workspace.'])
  assert.deepEqual(contents(cta, 'p').map(text), [
    'Không cần chuyển ngữ cảnh giữa agent, IDE, CI, review và deployment.',
  ])
  assert.deepEqual(destinations(cta), [{ href: '/console', label: 'Mở Console' }])
  assert.doesNotMatch(cta, /điện thoại|server/)
})

test('the context marquee remains hidden from assistive technology', () => {
  const markup = renderLanding()
  assert.match(markup, /<div\b[^>]*aria-hidden="true"><div>\s*AGENTS · CONTEXT · BUILDER/)
})
