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
})
