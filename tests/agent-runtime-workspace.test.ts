import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../velclaw-pages/agent-runtime.js', import.meta.url), 'utf8')

// Only the DOM surface used while opening the workspace is needed. The request
// stays pending so polling and later agent events cannot affect these assertions.
function element(id = '') {
  const classes = new Set<string>()
  return {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    className: '',
    dataset: {},
    disabled: false,
    scrollTop: 0,
    scrollHeight: 0,
    onclick: undefined as (() => void) | undefined,
    append() {},
    appendChild() {},
    classList: {
      add: (name: string) => classes.add(name),
      remove: (name: string) => classes.delete(name),
      contains: (name: string) => classes.has(name),
    },
  }
}

function openWorkspace(prompt: string, workspaceId = 'panel-build', withPreview = true) {
  const ids = [
    workspaceId,
    'panel-builder',
    'builderPrompt',
    'builderSendBtn',
    'workspaceName',
    'buildTitle',
    'buildStatus',
    'buildProgress',
    'buildChatStatus',
    'buildMessages',
    'buildActivity',
    ...(withPreview ? ['previewFrame', 'previewStatus'] : []),
  ]
  const elements = Object.fromEntries(ids.map((id) => [id, element(id)]))
  elements.builderPrompt.value = prompt
  elements['panel-builder'].classList.add('active')
  elements.buildMessages.innerHTML = 'Previous build messages'
  if (withPreview) elements.previewFrame.innerHTML = '<iframe src="/previous-preview"></iframe>'

  runInNewContext(
    source,
    {
      document: {
        readyState: 'complete',
        getElementById: (id: string) => elements[id] ?? null,
        querySelectorAll: () => [elements['panel-builder'], elements[workspaceId]],
        createElement: () => element(),
      },
      window: {},
      crypto: { randomUUID: () => 'synthetic-session' },
      fetch: () => new Promise(() => {}),
    },
    { timeout: 1_000 },
  )
  assert.ok(elements.builderSendBtn.onclick, 'runtime must register the send handler')
  elements.builderSendBtn.onclick()
  return elements
}

test('starting a build replaces the previous preview and resets workspace status', () => {
  const elements = openWorkspace('Build a documentation site')
  assert.equal(elements['panel-build'].classList.contains('active'), true)
  assert.equal(elements['panel-builder'].classList.contains('active'), false)
  assert.equal(elements['panel-builder'].classList.contains('building'), true)
  assert.equal(elements.workspaceName.textContent, 'Build')
  assert.equal(elements.buildTitle.textContent, 'Build a documentation site')
  assert.equal(elements.buildStatus.textContent, '● starting')
  assert.equal(elements.buildProgress.textContent, 'Planning')
  assert.equal(elements.buildChatStatus.textContent, 'working')
  assert.equal(elements.buildMessages.innerHTML, '')
  assert.equal(elements.previewStatus.textContent, 'Waiting for runtime…')
  assert.match(elements.previewFrame.innerHTML, /Building your project…/)
  assert.doesNotMatch(elements.previewFrame.innerHTML, /iframe|previous-preview/)
})

for (const length of [69, 70, 71]) {
  test(`workspace titles handle a ${length}-character prompt at the truncation boundary`, () => {
    const prompt = 'x'.repeat(length)
    const elements = openWorkspace(prompt)
    assert.equal(elements.buildTitle.textContent, length > 70 ? `${'x'.repeat(70)}…` : prompt)
  })
}

test('the alternate build workspace opens when optional preview elements are absent', () => {
  const elements = openWorkspace('Build a site', 'buildWorkspace', false)
  assert.equal(elements.buildWorkspace.classList.contains('active'), true)
  assert.equal(elements.buildStatus.textContent, '● starting')
  assert.equal(elements.buildTitle.textContent, 'Build a site')
})

test('blank prompts leave the previous workspace and preview untouched', () => {
  const elements = openWorkspace('   ')
  assert.equal(elements['panel-build'].classList.contains('active'), false)
  assert.equal(elements['panel-builder'].classList.contains('active'), true)
  assert.equal(elements.buildMessages.innerHTML, 'Previous build messages')
  assert.match(elements.previewFrame.innerHTML, /previous-preview/)
})
