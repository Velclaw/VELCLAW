import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ConfigGenerator } from '../Autoship/src/components/ConfigGenerator'
import { PipelineVisualizer } from '../Autoship/src/components/PipelineVisualizer'
import { WebhookManager } from '../Autoship/src/components/WebhookManager'
import type { BuildRun, DeploymentProject } from '../Autoship/src/types'
import { TerminalOutput } from '../ZsKai/src/components/TerminalOutput'

const project: DeploymentProject = {
  id: 'test-project',
  name: 'Docs "preview" <script> & site',
  repoUrl: 'https://github.com/example/docs',
  branch: 'main',
  target: 'static-server',
  webhookSecret: '',
  autoDeployOnPush: false,
  notifyOnSuccess: false,
  notifyOnFailure: false,
  framework: 'react-vite',
  buildCommand: 'npm run build',
  startCommand: 'npm start',
  envVariables: [],
  createdAt: '2026-01-01T00:00:00Z',
  totalBuilds: 0,
}

test('integration instructions preserve quoted project names and escape user-controlled markup', () => {
  const markup = renderToStaticMarkup(createElement(ConfigGenerator, { project }))
  assert.match(markup, /&quot;Docs &quot;preview&quot; &lt;script&gt; &amp; site&quot;/)
  assert.match(markup, /git commit -m &quot;ci: add automated deploy&quot;/)
  assert.doesNotMatch(markup, /<script>|&amp;quot;/)
})

test('the empty pipeline prompt renders its quoted action label without double escaping', () => {
  const markup = renderToStaticMarkup(createElement(PipelineVisualizer, { currentRun: null }))
  assert.match(markup, /&quot;Kích Hoạt Deploy&quot;/)
  assert.doesNotMatch(markup, /&amp;quot;/)
})

for (const commitMessage of ['', 'Fix "docs" <script>alert(1)</script> & deploy']) {
  test(`pipeline commit quotes remain text for ${commitMessage ? 'HTML-like' : 'empty'} messages`, () => {
    const currentRun: BuildRun = {
      id: 'test-run',
      projectId: project.id,
      projectName: project.name,
      commitHash: 'abcdef0',
      commitMessage,
      author: 'test-user',
      branch: 'main',
      status: 'queued',
      startedAt: '2026-01-01T00:00:00Z',
      stages: [],
      triggeredBy: 'manual',
    }
    const markup = renderToStaticMarkup(createElement(PipelineVisualizer, { currentRun }))
    if (commitMessage) {
      assert.match(markup, /&quot;Fix &quot;docs&quot; &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; deploy&quot;/)
    } else {
      assert.match(markup, /&quot;&quot; bởi/)
    }
    assert.doesNotMatch(markup, /<script>|&amp;quot;/)
  })
}

test('the webhook simulator retains the quoted Git Push heading', (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://autoship.example.test' } },
  })
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  })
  const markup = renderToStaticMarkup(createElement(WebhookManager, { project, onPipelineTriggered: () => {} }))
  assert.match(markup, /Giả Lập Sự Kiện &quot;Git Push&quot;/)
  assert.doesNotMatch(markup, /&amp;quot;/)
})

test('terminal diff examples display quoted HTML as code instead of creating HTML elements', () => {
  const markup = renderToStaticMarkup(
    createElement(TerminalOutput, { history: [], outputEndRef: { current: null }, activeNavTab: 'diff' }),
  )
  for (const className of ['legacy-sidebar', 'watson-clean-header', 'nav-tabs']) {
    assert.ok(markup.includes(`className=&quot;${className}&quot;`))
    assert.ok(!markup.includes(`class="${className}"`))
  }
  assert.match(markup, /&lt;html lang=&quot;vi&quot;&gt;/)
  assert.doesNotMatch(markup, /<html lang="vi">|&amp;quot;/)
})
