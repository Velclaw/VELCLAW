import assert from 'node:assert/strict'
import test from 'node:test'
import React, { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MainMenuDrawer } from '../ZsKai/src/components/MainMenuDrawer'

const noop = () => {}
const props: ComponentProps<typeof MainMenuDrawer> = {
  isOpen: false,
  onClose: noop,
  files: [],
  sessions: [],
  metrics: {
    nodeEfficiency: 92,
    queryLatencyMs: 14,
    anomaliesDetected: 0,
    aiConfidence: 0.992,
    recordsProcessed: 0,
    activeNodes: 1,
    statusText: 'Optimal',
  },
  user: { username: 'Test user', role: 'Developer', authProvider: 'guest', is2FAEnabled: false },
  cleanHomeMode: false,
  onToggleCleanHomeMode: noop,
  onSelectFile: noop,
  onSelectSession: noop,
  onExecuteCommand: noop,
  onExportPDF: noop,
  onExportMarkdown: noop,
  onExportCSV: noop,
  onNewSession: noop,
  onClearTerminal: noop,
  onOpenAuth: noop,
  onManualSync: noop,
  isSyncing: false,
}

test('a closed drawer renders nothing but still registers its tab state hook', (t) => {
  // Delegate to React's real hook; observe that the early return does not skip it.
  // SSR does not run effects or require a DOM or additional test dependencies.
  const state = t.mock.method(React, 'useState')
  assert.equal(renderToStaticMarkup(createElement(MainMenuDrawer, props)), '')
  assert.equal(state.mock.callCount(), 1)
  assert.deepEqual(state.mock.calls[0].arguments, ['utilities'])
})

test('open and closed drawers register the same tab state hook in the same order', (t) => {
  const state = t.mock.method(React, 'useState')
  for (const isOpen of [true, false, true, false]) {
    state.mock.resetCalls()
    const markup = renderToStaticMarkup(createElement(MainMenuDrawer, { ...props, isOpen }))
    assert.equal(state.mock.callCount(), 1)
    assert.deepEqual(state.mock.calls[0].arguments, ['utilities'])
    if (isOpen) {
      assert.match(markup, /Watson Main Menu/)
      assert.match(markup, /Tiện Ích/)
    } else {
      assert.equal(markup, '')
    }
  }
})
