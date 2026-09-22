import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DomainControlPlane } from '../components/domain-control-plane'

function renderControlPlane() {
  return renderToStaticMarkup(createElement(DomainControlPlane))
}

test('domain control plane renders the primary AI domain and the two service domains', () => {
  const markup = renderControlPlane()

  assert.match(markup, />3<\/div><div class="mt-1 text-\[11px\] text-zinc-600">All managed domains/)
  assert.match(markup, />0<\/div><div class="mt-1 text-\[11px\] text-zinc-600">DNS \+ SSL operational/)
  assert.match(markup, />0<\/div><div class="mt-1 text-\[11px\] text-zinc-600">Across all domains/)
  assert.match(markup, />0<\/div><div class="mt-1 text-\[11px\] text-zinc-600">Requires action/)

  for (const domain of ['velclaw.site', 'velclaw.app', 'velclaw.dev']) {
    assert.ok(markup.includes(domain), `missing seeded domain: ${domain}`)
  }

  assert.match(markup, /Pending verification/)
})

test('domain control plane initially selects the primary AI platform domain', () => {
  const markup = renderControlPlane()

  assert.match(markup, /velclaw\.ai/)
  assert.match(markup, /Platform/)
  assert.match(markup, /SSL pending/)
  assert.doesNotMatch(markup, /velclaw\.com/)
})

test('domain control plane exposes management navigation while keeping overlays closed initially', () => {
  const markup = renderControlPlane()

  for (const label of ['Add domain', 'overview', 'dns', 'Nameservers', 'settings']) {
    assert.ok(markup.includes(label), `missing control: ${label}`)
  }

  assert.doesNotMatch(markup, /added to the Velclaw control plane/)
})
