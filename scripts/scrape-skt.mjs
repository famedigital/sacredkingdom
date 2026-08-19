import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.env.TEMP || '/tmp', 'skt')

function strip(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const pages = JSON.parse(fs.readFileSync(path.join(dir, 'pages.json'), 'utf8'))
const trips = JSON.parse(fs.readFileSync(path.join(dir, 'trips.json'), 'utf8'))

console.log('TRIPS', trips.length)
for (const t of trips) {
  console.log(
    JSON.stringify({
      id: t.id,
      slug: t.slug,
      link: t.link,
      title: strip(t.title?.rendered),
      excerpt: strip(t.excerpt?.rendered).slice(0, 400),
      duration: t.trip_duration || t.meta?.trip_duration || t.duration || null,
      price: t.price || t.sale_price || t.meta?.price || null,
      featured_media: t.featured_media,
      types: t['trip-types'] || [],
    })
  )
}

const postsPath = path.join(dir, 'posts.json')
if (fs.existsSync(postsPath)) {
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'))
  console.log('\nPOSTS', posts.length)
  for (const p of posts) {
    console.log(
      JSON.stringify({
        slug: p.slug,
        title: strip(p.title?.rendered),
        excerpt: strip(p.excerpt?.rendered).slice(0, 280),
        date: p.date,
      })
    )
  }
}
