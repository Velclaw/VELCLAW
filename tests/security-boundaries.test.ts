import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function readProjectFile(relativePath: string) {
  return readFile(path.join(ROOT, relativePath), 'utf8')
}

test('connector API never serializes decrypted connector secrets', async () => {
  const source = await readProjectFile('app/api/connectors/route.ts')

  assert.doesNotMatch(source, /\bdecrypt\s*\(/)
  assert.doesNotMatch(source, /oauthClientSecret\s*:/)
  assert.doesNotMatch(source, /\benv\s*:/)
  assert.match(source, /Cache-Control['\"]:\s*['\"]private, no-store['\"]/)
})

test('connector server action keeps stored secrets server-side', async () => {
  const source = await readProjectFile('lib/actions/connectors.ts')

  assert.doesNotMatch(source, /import \{ encrypt, decrypt \}/)
  assert.doesNotMatch(source, /oauthClientSecret:\s*connector\.oauthClientSecret\s*\?\s*decrypt/)
  assert.doesNotMatch(source, /env:\s*connector\.env\s*\?\s*JSON\.parse\(decrypt/)
  assert.match(
    source,
    /oauthClientSecret:\s*oauthClientSecret\s*\?\s*encrypt\(oauthClientSecret\)\s*:\s*existingConnector\.oauthClientSecret/,
  )
  assert.match(
    source,
    /env:\s*envJson\s*\?\s*encrypt\(JSON\.stringify\(validatedData\.env\)\)\s*:\s*existingConnector\.env/,
  )
})
