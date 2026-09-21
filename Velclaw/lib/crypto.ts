import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const LEGACY_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 12
const LEGACY_IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

const getEncryptionKey = (): Buffer | null => {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    return null
  }
  const keyBuffer = Buffer.from(key, 'hex')
  if (keyBuffer.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY must be a 32-byte hex string (64 characters). Generate one with: openssl rand -hex 32',
    )
  }
  return keyBuffer
}

export const encrypt = (text: string): string => {
  if (!text) return text

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required for MCP encryption. Generate one with: openssl rand -hex 32',
    )
  }

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv, { authTagLength: AUTH_TAG_LENGTH })
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `v2:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (encryptedText: string): string => {
  if (!encryptedText) return encryptedText

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required for MCP decryption. Generate one with: openssl rand -hex 32',
    )
  }

  const parts = encryptedText.split(':')

  if (parts[0] === 'v2') {
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted text format')
    }

    const [, ivHex, authTagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid encrypted text format')
    }

    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv, { authTagLength: AUTH_TAG_LENGTH })
      decipher.setAuthTag(authTag)
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
      return decrypted.toString('utf8')
    } catch {
      throw new Error('Failed to decrypt authenticated value')
    }
  }

  // Backward compatibility for values encrypted before authenticated encryption was introduced.
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format')
  }

  const [ivHex, encryptedHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  if (iv.length !== LEGACY_IV_LENGTH) {
    throw new Error('Invalid encrypted text format')
  }

  try {
    const decipher = crypto.createDecipheriv(LEGACY_ALGORITHM, encryptionKey, iv)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch {
    throw new Error('Failed to decrypt legacy value')
  }
}
