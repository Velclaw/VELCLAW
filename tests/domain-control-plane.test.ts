import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DomainControlPlane } from '../components/domain-control-plane'

function renderControlPlane() {
  return renderToStaticMarkup(createElement(DomainControlPlane))
}

test('domain control plane renders the complete initial inventory and health summary', () => {
  const markup = renderControlPlane()

  assert.match(markup, />3<\/div><div class="mt-1 text-\[11px\] text-zinc-600">All managed domains/)
  assert.match(markup, />2<\/div><div class="mt-1 text-\[11px\] text-zinc-600">DNS \+ SSL operational/)
  assert.match(markup, />16<\/div><div class="mt-1 text-\[11px\] text-zinc-600">Across all domains/)
  assert.match(markup, />1<\/div><div class="mt-1 text-\[11px\] text-zinc-600">Requires action/)

  for (const domain of ['velclaw.com', 'velclaw.app', 'velclaw.dev']) {
    assert.ok(markup.includes(domain), `missing seeded domain: ${domain}`)
  }
  assert.match(markup, /Needs attention/)
})

test('domain control plane initially selects the platform domain overview', () => {
  const markup = renderControlPlane()

  assert.match(markup, /2027-08-14/)
  assert.match(markup, /Auto-renew enabled/)
  assert.match(markup, /Production/)
  assert.match(markup, /2 active/)
  assert.match(markup, /SSL live/)
  assert.doesNotMatch(markup, /Registrar sync required/)
})

test('domain control plane exposes management navigation while keeping overlays closed initially', () => {
  const markup = renderControlPlane()

  for (const label of ['Add domain', 'overview', 'dns', 'Nameservers', 'settings']) {
    assert.ok(markup.includes(label), `missing control: ${label}`)
  }
  assert.doesNotMatch(markup, /Register a domain you already own/)
  assert.doesNotMatch(markup, /added to the Velclaw control plane/)
})
