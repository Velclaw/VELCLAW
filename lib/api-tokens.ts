import { createHash, randomBytes } from 'node:crypto'

const TOKEN_PREFIX = 'vk_live_'

export function generateApiToken() {
  const secret = randomBytes(32).toString('base64url')
  const token = `${TOKEN_PREFIX}${secret}`
  const tokenHash = hashApiToken(token)
  const tokenPrefix = token.slice(0, 16)
  return { token, tokenHash, tokenPrefix }
}

export function hashApiToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function isApiToken(value: string) {
  return value.startsWith(TOKEN_PREFIX) && value.length >= TOKEN_PREFIX.length + 32
}
