import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import { decrypt, encrypt } from '@/lib/crypto'

const ORIGINAL_KEY = process.env.ENCRYPTION_KEY
const TEST_KEY = '11'.repeat(32)

test.before(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY
})

test.after(() => {
  if (ORIGINAL_KEY === undefined) {
    delete process.env.ENCRYPTION_KEY
  } else {
    process.env.ENCRYPTION_KEY = ORIGINAL_KEY
  }
})

test('encrypt/decrypt uses authenticated v2 format', () => {
  const plaintext = 'velclaw-secret'
  const encrypted = encrypt(plaintext)

  assert.match(encrypted, /^v2:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)
  assert.equal(decrypt(encrypted), plaintext)
})

test('authenticated ciphertext rejects tampering', () => {
  const encrypted = encrypt('velclaw-secret')
  const parts = encrypted.split(':')
  const ciphertext = parts[3]
  const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${ciphertext.slice(0, -2)}00`

  assert.throws(() => decrypt(tampered), /Failed to decrypt authenticated value/)
})

test('decrypt remains backward compatible with legacy CBC values', () => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(TEST_KEY, 'hex'), iv)
  const encrypted = Buffer.concat([cipher.update('legacy-check', 'utf8'), cipher.final()])
  const legacyValue = `${iv.toString('hex')}:${encrypted.toString('hex')}`

  assert.equal(decrypt(legacyValue), 'legacy-check')
})
