/**
 * Favicon: 3D mark on transparent (browser tab).
 * PWA / Apple: clean 3D app icon — cobalt plate + lifted mark.
 *
 * Run: npm run icons:generate
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const source = join(root, 'public/brand/icon-3d-deep-blue.png')

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }

function pngToIco(png) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0)
  entry.writeUInt8(32, 1)
  entry.writeUInt8(0, 2)
  entry.writeUInt8(0, 3)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, png])
}

async function extractMark() {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const px = Buffer.from(data)

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i]
    const g = px[i + 1]
    const b = px[i + 2]
    const isBlackPlate = r < 28 && g < 28 && b < 32 && b - r < 18
    if (isBlackPlate) px[i + 3] = 0
  }

  let mark = await sharp(px, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()

  try {
    mark = await sharp(mark).trim({ threshold: 8 }).png().toBuffer()
  } catch {
    /* keep */
  }

  const meta = await sharp(mark).metadata()
  console.log(`source mark ${meta.width}×${meta.height}`)
  return mark
}

function plateSvg(size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="base" cx="38%" cy="28%" r="82%">
      <stop offset="0%" stop-color="#3d7ec4"/>
      <stop offset="38%" stop-color="#18558c"/>
      <stop offset="72%" stop-color="#0c2e54"/>
      <stop offset="100%" stop-color="#071422"/>
    </radialGradient>
    <radialGradient id="gloss" cx="32%" cy="16%" r="46%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34"/>
      <stop offset="42%" stop-color="#9ec8f0" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c5e4ff" stop-opacity="0.28"/>
      <stop offset="18%" stop-color="#c5e4ff" stop-opacity="0"/>
      <stop offset="78%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.38"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#base)"/>
  <rect width="${size}" height="${size}" fill="url(#gloss)"/>
  <rect width="${size}" height="${size}" fill="url(#rim)"/>
</svg>`)
}

async function resizeMark(mark, inner) {
  return sharp(mark)
    .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
    .png()
    .toBuffer()
}

async function markShadow(markPng, blur) {
  const { data, info } = await sharp(markPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const sil = Buffer.from(data)
  for (let i = 0; i < sil.length; i += 4) {
    const a = sil[i + 3]
    sil[i] = 4
    sil[i + 1] = 10
    sil[i + 2] = 22
    sil[i + 3] = Math.round(a * 0.42)
  }
  return sharp(sil, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .blur(blur)
    .png()
    .toBuffer()
}

async function makeTransparent(mark, size, paddingRatio) {
  const inner = Math.max(8, Math.round(size * (1 - paddingRatio * 2)))
  const resized = await resizeMark(mark, inner)
  return sharp({
    create: { width: size, height: size, channels: 4, background: TRANSPARENT },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function makePwa3d(mark, size, paddingRatio) {
  const inner = Math.max(16, Math.round(size * (1 - paddingRatio * 2)))
  const resized = await resizeMark(mark, inner)
  const blur = Math.max(2, Math.round(size * 0.018))
  const shadow = await markShadow(resized, blur)
  const drop = Math.round(size * 0.018)
  const plate = await sharp(plateSvg(size)).png().toBuffer()

  return sharp(plate)
    .composite([
      { input: shadow, gravity: 'centre', top: undefined, left: undefined },
      {
        input: shadow,
        top: Math.round((size - inner) / 2) + drop,
        left: Math.round((size - inner) / 2),
      },
      {
        input: resized,
        top: Math.round((size - inner) / 2) - Math.round(size * 0.006),
        left: Math.round((size - inner) / 2),
      },
    ])
    .png()
    .toBuffer()
}

async function writePng(rel, buffer) {
  const dest = join(root, rel)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buffer)
  const meta = await sharp(buffer).metadata()
  console.log(`✓ ${rel} (${meta.width}×${meta.height})`)
}

async function main() {
  const mark = await extractMark()

  const fav32 = await makeTransparent(mark, 32, 0.04)
  const fav48 = await makeTransparent(mark, 48, 0.04)
  const pwa192 = await makePwa3d(mark, 192, 0.16)
  const pwa512 = await makePwa3d(mark, 512, 0.16)
  const apple180 = await makePwa3d(mark, 180, 0.16)
  const maskable512 = await makePwa3d(mark, 512, 0.22)

  await writePng('public/favicon.png', fav48)
  await writePng('public/icons/icon-192.png', pwa192)
  await writePng('public/icons/icon-512.png', pwa512)
  await writePng('public/icons/apple-touch-icon.png', apple180)
  await writePng('public/icons/icon-512-maskable.png', maskable512)

  await writePng('public/admin-pwa/icons/icon-192.png', pwa192)
  await writePng('public/admin-pwa/icons/icon-512.png', pwa512)
  await writePng('public/admin-pwa/icons/icon-512-maskable.png', maskable512)
  await writePng('public/admin-pwa/icons/apple-touch-icon.png', apple180)

  await writePng('app/icon.png', fav48)
  await writePng('app/apple-icon.png', apple180)

  writeFileSync(join(root, 'public/favicon.ico'), pngToIco(fav32))
  console.log('✓ public/favicon.ico')
  console.log('\nPWA icons: clean 3D cobalt plate. Favicon stays transparent.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
