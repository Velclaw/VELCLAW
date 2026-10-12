import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { crc32, inflateSync } from 'node:zlib'

// PR #207 adds a base64 text asset, not an image served by a component.
const assetUrl = new URL('../dashboard-skeleton/assets/logo-white.png1', import.meta.url)
const readEncodedLogo = () => readFileSync(assetUrl, 'utf8').trim()
const readLogo = () => Buffer.from(readEncodedLogo(), 'base64')

function readChunks(png: Buffer) {
  const chunks: { type: string; data: Buffer; checksumInput: Buffer; checksum: number }[] = []
  let offset = 8
  while (offset < png.length) {
    assert.ok(png.length - offset >= 12, 'PNG must not end with a partial chunk header or checksum')
    const length = png.readUInt32BE(offset)
    const end = offset + 12 + length
    assert.ok(end <= png.length, 'PNG chunk data must not be truncated')
    const type = png.toString('ascii', offset + 4, offset + 8)
    chunks.push({
      type,
      data: png.subarray(offset + 8, end - 4),
      checksumInput: png.subarray(offset + 4, end - 4),
      checksum: png.readUInt32BE(end - 4),
    })
    offset = end
    if (type === 'IEND') break
  }
  assert.equal(offset, png.length, 'PNG must not contain trailing bytes after IEND')
  return chunks
}

test('dashboard logo is nonempty canonical base64 without silently ignored characters', () => {
  const encoded = readEncodedLogo()
  assert.ok(encoded.length > 0)
  // Buffer.from alone tolerates invalid characters and missing padding.
  assert.equal(Buffer.from(encoded, 'base64').toString('base64'), encoded)
})

test('dashboard logo decodes to a PNG with a valid RGBA image header', () => {
  const png = readLogo()
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const header = readChunks(png)[0]
  assert.equal(header.type, 'IHDR')
  assert.equal(header.data.length, 13)
  assert.ok(header.data.readUInt32BE(0) > 0, 'Image width must be positive')
  assert.ok(header.data.readUInt32BE(4) > 0, 'Image height must be positive')
  // Eight-bit RGBA, standard compression/filtering, and no interlacing.
  assert.deepEqual(header.data.subarray(8), Buffer.from([8, 6, 0, 0, 0]))
})

test('dashboard logo contains complete image chunks and an empty terminal IEND', () => {
  const chunks = readChunks(readLogo())
  assert.deepEqual(
    chunks.map(({ type }) => type),
    ['IHDR', 'IDAT', 'IEND'],
  )
  assert.ok(chunks[1].data.length > 0, 'Image data must not be empty')
  assert.equal(chunks[2].data.length, 0, 'IEND must not contain data')
})

test('dashboard logo chunk checksums detect corruption beyond the PNG signature', () => {
  for (const chunk of readChunks(readLogo())) {
    assert.equal(crc32(chunk.checksumInput), chunk.checksum, `${chunk.type} checksum must match its type and data`)
  }
})

test('dashboard logo image data decompresses into complete RGBA scanlines with valid filters', () => {
  const chunks = readChunks(readLogo())
  const width = chunks[0].data.readUInt32BE(0)
  const height = chunks[0].data.readUInt32BE(4)
  const compressed = Buffer.concat(chunks.filter(({ type }) => type === 'IDAT').map(({ data }) => data))
  const pixels = inflateSync(compressed, { maxOutputLength: 1024 * 1024 })
  const stride = 1 + width * 4 // One filter byte followed by RGBA bytes for each row.
  assert.equal(pixels.length, height * stride, 'Scanline length must match the image dimensions')
  for (let row = 0; row < height; row++) {
    assert.ok(pixels[row * stride] <= 4, 'Each scanline must use a defined PNG filter')
  }
})
