/**
 * Scrape sacredkingdom.travel trips (WP REST), upload images to Cloudinary,
 * then upsert complete tours into Supabase.
 *
 * Run: node scripts/sync-skt-trips.mjs
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const WP = 'https://sacredkingdom.travel'
const FOLDER = 'sacred-kingdom/tours'

const FEATURED_SLUGS = [
  'bhutan-himalayan-odyssey',
  'the-ultimate-himalayan-journey',
  'the-dragon-kingdoms-complete-journey',
  'drukpath-trek-cultural-immersion-8-nights-9-days',
  'bhutan-heartland-journey',
]

function loadEnv() {
  const file = path.join(root, '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (!process.env[k]) process.env[k] = v
  }
}

loadEnv()

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function decode(html) {
  return String(html || '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;|&#39;/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#038;/g, '&')
}

function strip(html) {
  return decode(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\n]+/g, ' ')
    .trim()
}

function firstParagraph(text, max = 280) {
  const para = String(text || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .find((p) => p.length > 40) || String(text || '').trim()
  if (para.length <= max) return para
  return `${para.slice(0, max - 1).trim()}…`
}

function listItems(html) {
  if (!html) return []
  if (Array.isArray(html)) return html.map((x) => strip(typeof x === 'string' ? x : x?.content || '')).filter(Boolean)
  return [...String(html).matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => strip(m[1]))
    .filter((t) => t.length > 2 && t.length < 400)
}

function hashId(url) {
  return createHash('sha1').update(url).digest('hex').slice(0, 12)
}

function isRasterUrl(url) {
  return /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(url)
}

function preferRaster(urls) {
  const list = urls.filter(Boolean)
  return (
    list.find((u) => /\.(jpe?g|png)(\?|$)/i.test(u)) ||
    list.find((u) => /\.webp(\?|$)/i.test(u)) ||
    list.find((u) => isRasterUrl(u)) ||
    list[0] ||
    null
  )
}

function pickFeaturedUrl(trip) {
  const media = trip._embedded?.['wp:featuredmedia']?.[0]
  const candidates = []
  if (media?.source_url) candidates.push(media.source_url)
  const sizes = media?.media_details?.sizes || {}
  for (const key of ['full', '1536x1536', 'large', 'trip-single-size', 'medium_large']) {
    if (sizes[key]?.source_url) candidates.push(sizes[key].source_url)
  }
  return preferRaster(candidates)
}

function galleryFromHtml(html, heroUrl) {
  const found = [...String(html || '').matchAll(/https:\/\/sacredkingdom\.travel\/wp-content\/uploads\/[^"'\\\s>]+/gi)]
    .map((m) => m[0].replace(/-\d+x\d+(?=\.(jpe?g|png|webp|avif))/i, ''))
  const unique = []
  const seen = new Set()
  for (const url of found) {
    if (!isRasterUrl(url)) continue
    if (/logo|favicon|sprite|icon|flag/i.test(url)) continue
    if (heroUrl && url === heroUrl) continue
    if (seen.has(url)) continue
    seen.add(url)
    unique.push(url)
    if (unique.length >= 4) break
  }
  return unique
}

function mapCategory(trip, title) {
  const types = (trip._embedded?.['wp:term'] || [])
    .flat()
    .filter((t) => t.taxonomy === 'trip_types')
    .map((t) => String(t.name || '').toLowerCase())
  const joined = types.join(' ')
  const slug = String(trip.slug || '')
  const text = `${title} ${slug}`.toLowerCase()
  if (joined.includes('wild')) return 'wildlife'
  if (joined.includes('festival')) return 'festivals'
  const isTrekName =
    /trek|snowman|jomolhari|drukpath|laya-lingshi/.test(text) ||
    /(^|[^a-z])laya([^a-z]|$)/.test(text) ||
    /(^|[^a-z])lingshi([^a-z]|$)/.test(text)
  if (isTrekName) return 'trekking'
  return 'cultural'
}

function mapDifficulty(trip, category) {
  const diff = (trip._embedded?.['wp:term'] || [])
    .flat()
    .find((t) => t.taxonomy === 'difficulty')
  const name = String(diff?.name || '').toLowerCase()
  if (name.includes('easy')) return 'easy'
  if (name.includes('moderate')) return 'moderate'
  if (name.includes('difficult') || name.includes('strenuous') || name.includes('challenging')) {
    return 'challenging'
  }
  if (category === 'trekking') return 'challenging'
  return 'easy'
}

function parseItinerary(trip) {
  const days = Array.isArray(trip.itineraries) ? trip.itineraries : []
  return days.map((day, i) => {
    const raw = strip(day.content || day.description || '')
    const overnight = raw.match(/overnight:\s*([^\n.]+)/i)?.[1]?.trim()
    const meals = raw.match(/meals?:\s*([^\n.]+)/i)?.[1]?.trim()
    let description = raw
      .replace(/overnight:\s*[^\n]+/gi, '')
      .replace(/meals?:\s*[^\n]+/gi, '')
      .replace(/\n{2,}/g, '\n')
      .trim()
    return {
      day: i + 1,
      title: strip(day.title || `Day ${i + 1}`),
      description,
      accommodation: overnight || undefined,
      meals: meals || undefined,
    }
  })
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SacredKingdomTravelSync/1.0' },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function fetchOgImage(slug) {
  const res = await fetch(`${WP}/trip/${slug}/`, {
    headers: { 'User-Agent': 'SacredKingdomTravelSync/1.0' },
  })
  if (!res.ok) return null
  const html = await res.text()
  const m =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)
  const url = m?.[1]?.replace(/-\d+x\d+(?=\.(jpe?g|png|webp|avif))/i, '') || null
  return url
}

const uploaded = new Map()

async function uploadImage(url, publicId) {
  if (!url) return null
  const cached = uploaded.get(url)
  if (cached) return cached
  const result = await cloudinary.uploader.upload(url, {
    folder: FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    unique_filename: false,
    use_filename: false,
  })
  const out = { public_id: result.public_id, url: result.secure_url }
  uploaded.set(url, out)
  return out
}

async function main() {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary credentials in .env.local')
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  console.log('Fetching trips from', WP)
  const trips = await fetchJson(`${WP}/wp-json/wp/v2/trip?per_page=50&_embed=1`)
  if (!Array.isArray(trips) || trips.length === 0) {
    throw new Error('No trips returned from WordPress')
  }
  console.log('Found', trips.length, 'trips')

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const featuredIndex = new Map(FEATURED_SLUGS.map((s, i) => [s, i + 1]))
  let nextOrder = FEATURED_SLUGS.length + 1
  const liveSlugs = []
  const rows = []

  for (const trip of trips) {
    const title = strip(trip.title?.rendered)
    const slug = trip.slug
    liveSlugs.push(slug)
    const longDescription = strip(trip.description || trip.excerpt?.rendered || '')
    const tagline = firstParagraph(longDescription, 160)
    const description = firstParagraph(longDescription, 420)
    const category = mapCategory(trip, title)
    const difficulty = mapDifficulty(trip, category)
    const duration = Number(trip.duration?.days) || parseItinerary(trip).length || null
    const nights = Number(trip.duration?.nights) || (duration ? duration - 1 : null)
    const locations = (trip._embedded?.['wp:term'] || [])
      .flat()
      .filter((t) => t.taxonomy === 'destination')
      .map((t) => t.name)
    const itinerary = parseItinerary(trip)
    const highlights = itinerary.slice(0, 8).map((d) => d.title)
    const faqs = Array.isArray(trip.faqs)
      ? trip.faqs
          .map((f) => ({ question: strip(f.title || f.question), answer: strip(f.content || f.answer) }))
          .filter((f) => f.question && f.answer)
      : []

    let heroUrl = pickFeaturedUrl(trip)
    if (!heroUrl) {
      console.log('  no featured media, fetching og:image for', slug)
      heroUrl = await fetchOgImage(slug)
    }
    const galleryUrls = galleryFromHtml(trip.content?.rendered, heroUrl)

    let hero = null
    if (heroUrl) {
      console.log('  cloudinary', slug, heroUrl.split('/').pop())
      try {
        hero = await uploadImage(heroUrl, `${slug}-hero`)
      } catch (err) {
        console.warn('  hero upload failed, retrying og:image', slug, err.message)
        const fallback = await fetchOgImage(slug)
        if (fallback && fallback !== heroUrl) {
          hero = await uploadImage(fallback, `${slug}-hero`)
        } else {
          throw err
        }
      }
    }

    const gallery = []
    const galleryPublicIds = []
    for (let i = 0; i < galleryUrls.length; i++) {
      try {
        const g = await uploadImage(galleryUrls[i], `${slug}-g${i + 1}`)
        if (g) {
          gallery.push(g.url)
          galleryPublicIds.push(g.public_id)
        }
      } catch (err) {
        console.warn('  gallery skip', galleryUrls[i], err.message)
      }
    }

    const sortOrder = featuredIndex.get(slug) || nextOrder++
    const isFeatured = featuredIndex.has(slug)

    rows.push({
      title,
      slug,
      tagline,
      description,
      long_description: longDescription.slice(0, 12000),
      category,
      duration,
      duration_nights: nights,
      price: 0,
      show_price: false,
      difficulty_level: difficulty,
      sort_order: sortOrder,
      hero_image_public_id: hero?.public_id || null,
      hero_image_url: hero?.url || null,
      thumbnail_public_id: hero?.public_id || null,
      thumbnail_url: hero?.url || null,
      gallery_urls: gallery,
      gallery_public_ids: galleryPublicIds,
      locations,
      highlights,
      itinerary,
      included_items: listItems(trip.cost_includes),
      excluded_items: listItems(trip.cost_excludes),
      faqs,
      meta_title: title,
      meta_description: description,
      is_featured: isFeatured,
      is_active: true,
      is_published: true,
    })
  }

  rows.sort((a, b) => a.sort_order - b.sort_order)

  const { data: existing, error: existingError } = await supabase.from('tours').select('id, slug')
  if (existingError) throw existingError
  const live = new Set(liveSlugs)
  const stale = (existing || []).filter((t) => t.slug && !live.has(t.slug))
  for (const t of stale) {
    const { error } = await supabase
      .from('tours')
      .update({ is_published: false, is_featured: false, is_active: false })
      .eq('id', t.id)
    if (error) throw error
    console.log('unpublished leftover', t.slug)
  }

  for (const row of rows) {
    const { error } = await supabase.from('tours').upsert(row, { onConflict: 'slug' })
    if (error) throw error
    console.log('upserted', row.sort_order, row.slug, row.category, row.duration, 'days', row.hero_image_url ? 'img' : 'NO IMG')
  }

  const { count } = await supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_published', true)
  console.log('published tours', count)
  console.log('cloudinary uploads', uploaded.size)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
