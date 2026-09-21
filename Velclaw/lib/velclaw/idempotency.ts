const completed = new Map<string, string>()

export function getIdempotentResult(key: string): string | null {
  return completed.get(key) ?? null
}

export function setIdempotentResult(key: string, result: string): void {
  completed.set(key, result)
}
