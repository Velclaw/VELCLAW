import { describe, expect, it } from 'vitest'
import postcss from 'postcss'

describe('PostCSS dependency compatibility', () => {
  it('keeps cloned nested declarations independent of their original stylesheet', () => {
    const css = '@media screen { .card { color: red !important; --label: "a;b" } }'
    const original = postcss.parse(css, { from: 'input.css' })
    const cloned = original.clone()
    cloned.walkDecls('color', (declaration) => {
      declaration.value = 'blue'
    })
    cloned.walkDecls('--label', (declaration) => declaration.remove())
    expect(original.toString()).toBe(css)
    const rule = cloned.first.first
    expect(rule.nodes).toHaveLength(1)
    expect(rule.first.value).toBe('blue')
    expect(rule.first.important).toBe(true)
    expect(rule.first.parent).toBe(rule)
    expect(rule.parent.parent).toBe(cloned)
    expect(postcss.parse(cloned.toString()).first.first.first.value).toBe('blue')
  })

  it('preserves nested rules, custom properties, comments and quoted delimiters', async () => {
    const css =
      '/* theme */\n@layer components { .card { --label: "a;b}c"; color: var(--ink, #123); &:hover { color: red } } }'
    const result = await postcss([]).process(css, { from: undefined })
    expect(result.css).toBe(css)
    const root = postcss.parse(result.css)
    expect(root.first.type).toBe('comment')
    const card = root.last.first
    expect(card.selector).toBe('.card')
    expect(card.first.value).toBe('"a;b}c"')
    expect(card.last.selector).toBe('&:hover')
  })

  it('runs asynchronous plugins and preserves important declarations and source maps', async () => {
    const plugin = {
      postcssPlugin: 'test-color-transform',
      async Once(root) {
        await Promise.resolve()
        root.walkDecls('color', (decl) => {
          decl.value = 'blue'
        })
      },
    }
    const result = await postcss([plugin]).process('a { color: red !important }', {
      from: 'input.css',
      to: 'output.css',
      map: { inline: false },
    })
    expect(result.css).toContain('color: blue !important')
    expect(result.map.toJSON().sources).toEqual(['input.css'])
    expect(result.map.toJSON().sourcesContent).toEqual(['a { color: red !important }'])
    expect(result.warnings()).toEqual([])
  })

  it.each(['a { color: red', "a { color: 'red }", '/* unclosed'])(
    'reports malformed CSS with source location: %j',
    (css) => {
      expect(() => postcss.parse(css, { from: 'invalid.css' })).toThrow(
        expect.objectContaining({ name: 'CssSyntaxError', line: 1, column: expect.any(Number) }),
      )
    },
  )

  it('accepts empty stylesheets', async () => {
    const result = await postcss([]).process('', { from: undefined })
    expect(result.css).toBe('')
    expect(result.root.nodes).toEqual([])
  })

  it('propagates asynchronous plugin failures without publishing partial CSS', async () => {
    const failure = new Error('synthetic plugin failure')
    let downstreamRan = false
    const result = postcss([
      {
        postcssPlugin: 'test-rejecting-plugin',
        async Once() {
          await Promise.resolve()
          throw failure
        },
      },
      {
        postcssPlugin: 'test-downstream-plugin',
        Once() {
          downstreamRan = true
        },
      },
    ]).process('a { color: red }', { from: undefined })
    await expect(result).rejects.toBe(failure)
    expect(downstreamRan).toBe(false)
  })

  it('preserves plugin warnings and their declaration source positions', async () => {
    const result = await postcss([
      {
        postcssPlugin: 'test-warning-plugin',
        Declaration(declaration, { result }) {
          if (declaration.prop === 'color') declaration.warn(result, 'synthetic warning')
        },
      },
    ]).process('a {\n  color: red;\n}', { from: 'input.css' })
    expect(result.css).toBe('a {\n  color: red;\n}')
    expect(result.warnings()).toEqual([
      expect.objectContaining({
        plugin: 'test-warning-plugin',
        text: 'synthetic warning',
        line: 2,
        column: 3,
      }),
    ])
  })
})
