import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)

// Node cannot load CSS modules. Stub only this component's stylesheet while
// loading it, then restore the loader. React, Next Link and icons remain real.
const stylesheet = require.resolve('../components/velclaw-landing.module.css')
const previousCssLoader = require.extensions['.css']
let VelclawLanding: typeof import('../components/velclaw-landing').VelclawLanding
try {
  require.extensions['.css'] = (module, filename) => {
    if (filename === stylesheet) {
      module.exports = {}
    } else if (previousCssLoader) {
      previousCssLoader(module, filename)
    } else {
      throw new Error('Unexpected stylesheet import in landing page test')
    }
  }
  ;({ VelclawLanding } = require('../components/velclaw-landing'))
} finally {
  if (previousCssLoader) require.extensions['.css'] = previousCssLoader
  else delete require.extensions['.css']
  delete require.cache[stylesheet]
}

function render(props: ComponentProps<typeof VelclawLanding> = {}) {
  return renderToStaticMarkup(createElement(VelclawLanding, props))
}

// These helpers inspect the component's static, non-nested sections and links;
// they deliberately avoid snapshots, CSS classes and serialized attribute order.
function text(markup: string) {
  return markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function elements(markup: string, tag: string) {
  return [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((match) => match[0])
}

function onlyElement(markup: string, tag: string) {
  const matches = elements(markup, tag)
  assert.equal(matches.length, 1, `Expected exactly one ${tag}`)
  return matches[0]
}

function links(markup: string) {
  return elements(markup, 'a').map((anchor) => {
    const href = anchor.match(/\bhref="([^"]*)"/)
    assert.ok(href, 'Every link must have a destination')
    return { label: text(anchor), href: href[1] }
  })
}

function section(markup: string, heading: string) {
  const matches = elements(markup, 'section').filter((candidate) =>
    elements(candidate, 'h2').some((h2) => text(h2) === heading),
  )
  assert.equal(matches.length, 1, `Expected section: ${heading}`)
  return matches[0]
}

const roles = [
  {
    role: 'platform',
    label: 'velclaw.app',
    descriptor: 'Platform & company',
    cta: 'Khám phá Platform',
    href: '/projects',
  },
  {
    role: 'developer',
    label: 'velclaw.dev',
    descriptor: 'Developer · IDE · Docs · API',
    cta: 'Mở Developer',
    href: '/builder',
  },
  {
    role: 'application',
    label: 'velclaw.app',
    descriptor: 'Application & services',
    cta: 'Mở Application',
    href: '/console',
  },
] as const

for (const { role, label, descriptor, cta, href } of roles) {
  test(`${role} landing pairs its branding with the correct primary action`, () => {
    const markup = render({ role })
    const hero = elements(markup, 'section')[0]
    assert.equal(text(onlyElement(hero, 'h1')), 'Build software. Give agents context.')
    assert.ok(text(hero).includes(`${descriptor.toUpperCase()} · AI-NATIVE SOFTWARE WORKSPACE`))
    assert.ok(text(hero).includes(`${label} · ${descriptor}`))
    assert.deepEqual(links(hero), [
      { label: cta, href },
      { label: 'Thử Builder', href: '/builder' },
    ])
    assert.equal(text(onlyElement(markup, 'footer')), `${label} AI-native software lifecycle workspace`)
    assert.doesNotMatch(markup, /velclaw\.site/)
  })
}

test('omitted and explicitly undefined roles both render the platform experience', () => {
  const platform = render({ role: 'platform' })
  assert.equal(render(), platform)
  assert.equal(render({ role: undefined }), platform)
})

test('rendering a different domain role does not leak its CTA into the default page', () => {
  render({ role: 'developer' })
  render({ role: 'application' })
  const hero = elements(render(), 'section')[0]
  assert.deepEqual(links(hero)[0], { label: 'Khám phá Platform', href: '/projects' })
  assert.doesNotMatch(hero, /Mở Developer|Mở Application|velclaw\.dev/)
})

test('desktop and mobile navigation expose the revised labels and Docs route', () => {
  const markup = render()
  const header = onlyElement(markup, 'header')
  const commonLinks = [
    { label: 'Nền tảng', href: '#platform' },
    { label: 'Console', href: '/console' },
    { label: 'Builder', href: '/builder' },
    { label: 'Workspace', href: '/velclaw' },
  ]
  const nav = onlyElement(header, 'nav')
  assert.match(nav, /aria-label="Velclaw navigation"/)
  assert.deepEqual(links(nav), [...commonLinks, { label: 'Docs', href: '/docs' }])
  const menu = onlyElement(header, 'details')
  assert.match(onlyElement(menu, 'summary'), /aria-label="Mở menu"/)
  assert.deepEqual(links(menu), [
    ...commonLinks,
    { label: 'Deploy', href: '/deploy' },
    { label: 'Docs', href: '/docs' },
    { label: 'Ecosystem', href: '/projects' },
  ])
  assert.ok(links(header).some(({ label, href }) => label === 'Đăng nhập' && href === '/auth/signin'))
  assert.match(section(markup, 'Một control plane cho toàn bộ vòng đời phần mềm.'), /id="platform"/)
})

test('the hero describes a unified workspace and previews the complete agent workflow in order', () => {
  const hero = elements(render(), 'section')[0]
  assert.equal(
    text(onlyElement(hero, 'p')),
    'Velclaw hợp nhất agent, code, project, build, runtime, review và deployment thành một workspace duy nhất — để ý tưởng đi thẳng tới software có thể vận hành.',
  )
  assert.match(hero, /aria-label="Velclaw browser builder preview"/)
  assert.ok(
    text(hero).includes(
      'VELCLAW / CONTROL PLANE READY $ velclaw run task agent workspace-agent source GitHub / branch runtime WebContainer ✓ context loaded ✓ workspace ready ✓ checks passed → build → review → deploy',
    ),
  )
})

test('product cards retain their destinations and display the revised capability descriptions', () => {
  const platform = section(render(), 'Một control plane cho toàn bộ vòng đời phần mềm.')
  const cards = elements(platform, 'a')
  const expected = [
    ['Builder', '/builder', 'Tạo, sửa, chạy và preview ứng dụng ngay trong trình duyệt.'],
    ['Tasks', '/tasks', 'Điều phối công việc, agent và trạng thái thực thi trong một luồng.'],
    ['Workspace', '/velclaw', 'Code, repo, context, review và runtime cùng một control plane.'],
    ['Deploy', '/deploy', 'Đưa software đã kiểm chứng từ branch tới production.'],
    ['MCP', '/mcp', 'Kết nối tools và context để agent hành động có kiểm soát.'],
    ['Plugins', '/plugins', 'Mở rộng năng lực workspace bằng các integration có thể tái sử dụng.'],
    ['Skills', '/skills', 'Chuẩn hoá năng lực agent theo workflow và domain.'],
    ['Ecosystem', '/projects', 'Một registry thống nhất cho các surface và dịch vụ của Velclaw.'],
  ]
  assert.deepEqual(
    cards.map((card) => [text(onlyElement(card, 'h3')), links(card)[0].href, text(onlyElement(card, 'p'))]),
    expected,
  )
})

test('the three product principles are explanatory articles with distinct headings and evidence', () => {
  const principles = section(render(), 'Không chỉ là AI coding. Đây là lớp vận hành phía sau agent.')
  const articles = elements(principles, 'article')
  assert.deepEqual(
    articles.map((article) => [text(onlyElement(article, 'h3')), text(onlyElement(article, 'p'))]),
    [
      ['Một workspace', 'Không tách agent, code, runtime và delivery thành những sản phẩm rời nhau.'],
      ['Có context', 'Agent làm việc trên project, file, repo, state và tooling thực tế.'],
      ['Có bằng chứng', 'Build, test, review và deployment tạo thành một chuỗi trạng thái có thể kiểm tra.'],
    ],
  )
  assert.deepEqual(links(principles), [], 'Principles must not inherit product-card navigation')
})

test('adding principles preserves section order and gives each section a distinct number', () => {
  const sections = elements(render(), 'section').slice(1)
  assert.deepEqual(
    sections.map((entry) => text(elements(entry, 'span')[0])),
    ['01 / PLATFORM', '02 / WHY VELCLAW', '03 / PIPELINE', '04 / UNIFIED WORKSPACE', '05 / START BUILDING'],
  )
})

test('the revised task-to-production pipeline ends at Deploy without a trailing arrow', () => {
  const pipeline = section(render(), 'Một đường đi rõ ràng từ task tới production.')
  assert.deepEqual(elements(pipeline, 'strong').map(text), ['Task', 'Agent', 'Build', 'Review', 'Deploy'])
  const arrows = elements(pipeline, 'span').filter((span) => text(span) === '→')
  assert.equal(arrows.length, 4)
  for (const arrow of arrows) assert.match(arrow, /aria-hidden="true"/)
  assert.ok(text(pipeline).endsWith('05 Deploy'))
})

test('Build & Delivery keeps the deployment route in the unified workspace', () => {
  const workspace = section(render(), 'Một cửa vào cho toàn bộ hiện trạng Velclaw.')
  assert.deepEqual(
    elements(workspace, 'a').map((card) => ({ label: text(onlyElement(card, 'strong')), href: links(card)[0].href })),
    [
      { label: 'Workspace & Agents', href: '/velclaw' },
      { label: 'Build & Delivery', href: '/deploy' },
      { label: 'Tools & Context', href: '/mcp' },
      { label: 'Builder & Preview', href: '/console' },
    ],
  )
})

test('the final workspace-building invitation opens Console for every domain role', () => {
  for (const { role } of roles) {
    const sections = elements(render({ role }), 'section')
    const invitation = sections[sections.length - 1]
    assert.equal(text(onlyElement(invitation, 'h3')), 'Build, review và ship software từ một workspace.')
    assert.equal(
      text(onlyElement(invitation, 'p')),
      'Không cần chuyển ngữ cảnh giữa agent, IDE, CI, review và deployment.',
    )
    assert.deepEqual(links(invitation), [{ label: 'Mở Console', href: '/console' }])
  }
})
