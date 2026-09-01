export type MdnReference = {
  query: string
  url: string
}

const MDN_BASE = 'https://developer.mozilla.org/en-US/docs/'

const REFERENCES: Record<string, string> = {
  fetch: 'Web/API/Window/fetch',
  'fetch api': 'Web/API/Fetch_API',
  javascript: 'JavaScript',
  html: 'Web/HTML',
  css: 'Web/CSS',
  http: 'Web/HTTP',
  'web api': 'Web/API',
  'web apis': 'Web/API',
}

/**
 * Resolves common Web Platform concepts to canonical MDN references.
 * It deliberately does not scrape or mirror MDN content.
 */
export function resolveMdnReference(query: string): MdnReference | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return null

  const path = REFERENCES[normalized]
  if (!path) return null

  return {
    query,
    url: new URL(path, MDN_BASE).toString(),
  }
}

export function mdnSearchUrl(query: string): string {
  const normalized = query.trim()
  if (!normalized) throw new Error('MDN search query is required')

  return `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(normalized)}`
}
