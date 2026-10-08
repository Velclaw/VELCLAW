import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MainMenuDrawer } from '../ZsKai/src/components/MainMenuDrawer'
import { TerminalOutput } from '../ZsKai/src/components/TerminalOutput'

function drawerProps(isOpen: boolean): ComponentProps<typeof MainMenuDrawer> {
  const unexpectedCallback = () => assert.fail('rendering must not trigger an action callback')
  return {
    isOpen,
    files: [],
    sessions: [],
    metrics: {
      nodeEfficiency: 92,
      queryLatencyMs: 14,
      anomaliesDetected: 0,
      aiConfidence: 0.95,
      recordsProcessed: 0,
      activeNodes: 1,
      statusText: 'Optimal',
    },
    user: { username: 'test-user', role: 'developer', authProvider: 'guest', is2FAEnabled: false },
    cleanHomeMode: false,
    isSyncing: false,
    onClose: unexpectedCallback,
    onToggleCleanHomeMode: unexpectedCallback,
    onSelectFile: unexpectedCallback,
    onSelectSession: unexpectedCallback,
    onExecuteCommand: unexpectedCallback,
    onExportPDF: unexpectedCallback,
    onExportMarkdown: unexpectedCallback,
    onExportCSV: unexpectedCallback,
    onNewSession: unexpectedCallback,
    onClearTerminal: unexpectedCallback,
    onOpenAuth: unexpectedCallback,
    onManualSync: unexpectedCallback,
  }
}

test('the drawer renders nothing when closed after initializing its state', () => {
  assert.equal(renderToStaticMarkup(createElement(MainMenuDrawer, drawerProps(false))), '')
})

test('the open drawer initially renders utilities even with empty files and sessions', () => {
  const markup = renderToStaticMarkup(createElement(MainMenuDrawer, drawerProps(true)))
  assert.match(markup, /<aside\b/)
  assert.match(markup, /watson run-analysis/)
  assert.match(markup, /watson optimize --dry-run/)
  assert.doesNotMatch(markup, /Tệp Cấu Hình &amp; Logs Dự Án|Lịch Sử Phiên Chạy/)
})

test('terminal diff examples preserve literal quoted HTML without inserting executable elements', () => {
  const markup = renderToStaticMarkup(
    createElement(TerminalOutput, {
      history: [],
      outputEndRef: { current: null },
      activeNavTab: 'diff',
    }),
  )
  for (const snippet of [
    '&lt;div className=&quot;legacy-sidebar&quot;&gt;Old Nav&lt;/div&gt;',
    '&lt;div className=&quot;watson-clean-header&quot;&gt;IETF Technical Header&lt;/div&gt;',
    '&lt;nav className=&quot;nav-tabs&quot;&gt;',
    '&lt;html lang=&quot;vi&quot;&gt;',
  ]) {
    assert.ok(markup.includes(snippet), snippet)
  }
  assert.doesNotMatch(markup, /<div className="legacy-sidebar"|<nav className="nav-tabs"|<html lang="vi"/)
  assert.doesNotMatch(markup, /&amp;quot;/)
})
