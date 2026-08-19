import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PAGES = [
  { id: 6340, slug: 'punakha' },
  { id: 6317, slug: 'zhemgang' },
  { id: 6312, slug: 'wangdue' },
  { id: 6301, slug: 'trongsa' },
  { id: 6283, slug: 'thimphu' },
  { id: 6288, slug: 'trashigang' },
  { id: 6243, slug: 'trashiyangtse' },
  { id: 6235, slug: 'paro' },
  { id: 6224, slug: 'mongar' },
  { id: 6216, slug: 'lhuntse' },
  { id: 6193, slug: 'haa' },
  { id: 6167, slug: 'gasa' },
  { id: 6096, slug: 'bumthang' },
]

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
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractHeadline(html) {
  const h3 = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
  if (h3) return strip(h3[1])
  const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
  if (h2) return strip(h2[1])
  return ''
}

function extractIntro(html) {
  const em = html.match(/<em[^>]*>([\s\S]*?)<\/em>/i)
  if (em) return strip(em[1])
  const p = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (p) return strip(p[1])
  return ''
}

function extractAttractions(html) {
  const items = []
  const details = [...html.matchAll(/<summary[\s\S]*?<\/summary>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)]
  for (const m of html.matchAll(/<summary[\s\S]*?<\/summary>/gi)) {
    const title = strip(m[0])
    items.push({ title, body: '' })
  }
  if (items.length) {
    let i = 0
    for (const m of html.matchAll(/<details[\s\S]*?<\/details>/gi)) {
      const title = strip((m[0].match(/<summary[\s\S]*?<\/summary>/i) || [''])[0])
      const body = strip((m[0].match(/<p[^>]*>([\s\S]*?)<\/p>/i) || ['', ''])[1])
      if (title) {
        items[i] = { title, body }
        i += 1
      }
    }
    return items.filter((a) => a.title && a.title.length > 2)
  }

  // Fallback: strong titles followed by a paragraph
  const fallback = []
  for (const m of html.matchAll(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const title = strip(m[1])
    const body = strip(m[2])
    if (title && body && title.length < 120) fallback.push({ title, body })
  }
  return fallback
}

async function main() {
  const out = []
  for (const page of PAGES) {
    const res = await fetch(
      `https://sacredkingdom.travel/wp-json/wp/v2/pages/${page.id}?_fields=slug,title,content,excerpt,link`
    )
    if (!res.ok) throw new Error(`${page.slug} ${res.status}`)
    const data = await res.json()
    const html = data.content?.rendered || ''
    const dest = {
      slug: page.slug,
      wpSlug: data.slug,
      wpLink: data.link,
      name: strip(data.title?.rendered).replace(/ Attractions$/i, ''),
      headline: extractHeadline(html),
      intro: extractIntro(html),
      attractions: extractAttractions(html).slice(0, 12),
    }
    out.push(dest)
    console.log(dest.slug, dest.headline.slice(0, 80), 'attractions', dest.attractions.length)
  }
  const dest = path.join(__dirname, 'skt-attractions.json')
  fs.writeFileSync(dest, JSON.stringify(out, null, 2))
  console.log('wrote', dest)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
