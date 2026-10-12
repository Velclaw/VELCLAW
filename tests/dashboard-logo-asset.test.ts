import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { crc32, inflateSync } from 'node:zlib'

// PR #207 adds a base64-encoded asset, so validate the decoded image without a server.
const encoded = readFileSync(new URL('../dashboard-skeleton/assets/logo-white.png1', import.meta.url), 'utf8').trim()
const png = Buffer.from(encoded, 'base64')

function readChunks() {
  const chunks: { type: string; data: Buffer; checksum: number }[] = []
  let offset = 8
  while (offset < png.length) {
    assert.ok(offset + 12 <= png.length, 'PNG chunk header and checksum must not be truncated')
    const length = png.readUInt32BE(offset)
    const end = offset + 12 + length
    assert.ok(end <= png.length, 'PNG chunk data must not be truncated')
    chunks.push({
      type: png.toString('ascii', offset + 4, offset + 8),
      data: png.subarray(offset + 8, end - 4),
      checksum: png.readUInt32BE(end - 4),
    })
    offset = end
  }
  return chunks
}

test('the dashboard logo contains complete, canonical base64 rather than silently ignored invalid characters', () => {
  assert.ok(encoded.length > 0, 'The asset must not be empty')
  assert.equal(encoded.length % 4, 0, 'Base64 must include complete padding')
  assert.equal(png.toString('base64'), encoded, 'Base64 must round-trip without losing characters or padding bits')
})

test('the decoded dashboard logo has a PNG signature and a supported RGBA image header', () => {
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const header = readChunks()[0]
  assert.equal(header.type, 'IHDR')
  assert.equal(header.data.length, 13)
  assert.ok(header.data.readUInt32BE(0) > 0, 'Image width must be positive')
  assert.ok(header.data.readUInt32BE(4) > 0, 'Image height must be positive')
  // Eight-bit RGBA, standard compression/filtering, and no interlacing.
  assert.deepEqual([...header.data.subarray(8)], [8, 6, 0, 0, 0])
})

test('the dashboard logo contains image data and terminates cleanly without trailing chunks', () => {
  const chunks = readChunks()
  assert.equal(chunks[0].type, 'IHDR')
  assert.equal(chunks.filter((chunk) => chunk.type === 'IHDR').length, 1)
  assert.ok(chunks.some((chunk) => chunk.type === 'IDAT' && chunk.data.length > 0))
  assert.equal(chunks.filter((chunk) => chunk.type === 'IEND').length, 1)
  assert.equal(chunks[chunks.length - 1].type, 'IEND')
  assert.equal(chunks[chunks.length - 1].data.length, 0)
})

test('every dashboard logo PNG chunk passes its integrity checksum', () => {
  for (const chunk of readChunks()) {
    const actual = crc32(Buffer.concat([Buffer.from(chunk.type, 'ascii'), chunk.data]))
    assert.equal(actual, chunk.checksum, `${chunk.type} checksum must match its type and data`)
  }
})

test('the dashboard logo decompresses into complete RGBA scanlines with valid PNG filters', () => {
  const chunks = readChunks()
  const header = chunks[0].data
  const width = header.readUInt32BE(0)
  const height = header.readUInt32BE(4)
  const compressed = Buffer.concat(chunks.filter((chunk) => chunk.type === 'IDAT').map((chunk) => chunk.data))
  // Keep the zlib checksum enabled: valid base64 and PNG headers alone do not ensure a usable image.
  const pixels = inflateSync(compressed, { maxOutputLength: 1024 * 1024 })
  const scanlineLength = 1 + width * 4
  assert.equal(pixels.length, height * scanlineLength, 'Every row needs a filter byte and four bytes per pixel')
  for (let row = 0; row < height; row++) {
    assert.ok(pixels[row * scanlineLength] <= 4, 'Each scanline must use a defined PNG filter')
  }
})
