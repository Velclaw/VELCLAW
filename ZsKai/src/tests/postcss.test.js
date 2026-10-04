import { describe, expect, it } from 'vitest'
import postcss from 'postcss'

describe('PostCSS dependency compatibility', () => {
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

  it('propagates asynchronous plugin failures to the caller', async () => {
    const failure = new Error('synthetic plugin failure')
    const plugin = {
      postcssPlugin: 'test-rejection',
      async Once() {
        await Promise.resolve()
        throw failure
      },
    }
    await expect(postcss([plugin]).process('a { color: red }', { from: undefined })).rejects.toBe(failure)
  })

  it('retains plugin attribution and source positions for declaration warnings', async () => {
    const css = 'a {\n  color: red;\n}'
    const plugin = {
      postcssPlugin: 'test-warning',
      Declaration(declaration, { result }) {
        declaration.warn(result, 'Synthetic warning')
      },
    }
    const result = await postcss([plugin]).process(css, { from: 'input.css' })
    expect(result.css).toBe(css)
    expect(result.warnings()).toHaveLength(1)
    expect(result.warnings()[0]).toMatchObject({
      type: 'warning',
      plugin: 'test-warning',
      text: 'Synthetic warning',
      line: 2,
      column: 3,
    })
  })
})
