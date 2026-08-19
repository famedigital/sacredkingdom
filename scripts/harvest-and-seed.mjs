/**
 * Upload old-site + generated images to Cloudinary, then seed Supabase.
 * Run: node scripts/harvest-and-seed.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv() {
  const file = path.join(root, '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const k = t.slice(0, i)
    const v = t.slice(i + 1)
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

const BASE = 'https://www.sacredhimalayatravel.com'
const FOLDER = 'sacred-himalaya'

const remote = [
  { id: 'logo', url: `${BASE}/img/logo.png` },
  { id: 'hero-1', url: `${BASE}/ServerImage/e3f1343e-1cf5-4593-bf1b-585473925955.jpg` },
  { id: 'hero-2', url: `${BASE}/ServerImage/cf45b6be-3089-4a0f-ac64-0c9b74b6bb17.jpg` },
  { id: 'hero-3', url: `${BASE}/ServerImage/0042db7e-6cc9-4aa0-8ff5-be4508697a7c.jpg` },
  { id: 'hero-4', url: `${BASE}/ServerImage/08435283-1bcc-48e9-9eaf-ff1abc4ab965.jpg` },
  { id: 'hero-5', url: `${BASE}/ServerImage/3a5d7976-e2b6-4a6d-ad4b-7f902b98598a.jpg` },
  { id: 'theme-heritage', url: `${BASE}/ServerImage/51dbe3e8-8265-4733-8a5a-b0ff9822954c.jpg` },
  { id: 'theme-festivals', url: `${BASE}/ServerImage/73ad749f-a492-49ab-9417-e48a342489f7.jpg` },
  { id: 'theme-trekkings', url: `${BASE}/ServerImage/8f566742-c5ad-4ea9-9dbb-2c299bcc1e88.jpg` },
  { id: 'theme-relaxation', url: `${BASE}/ServerImage/cd6a8fa5-30fa-443d-9aa7-2dab5fb36c56.jpg` },
  { id: 'tour-discover-bhutan', url: `${BASE}/ServerImage/d7e72b63-32c7-4ebc-b4b2-9d29b11ef1e7.jpg` },
  { id: 'tour-spiritual-journey', url: `${BASE}/ServerImage/180b65c2-b629-4843-847f-822a5f23b4e3.jpg` },
  { id: 'tour-natures-paradise', url: `${BASE}/ServerImage/23cebb14-405c-45e2-b162-02008f47be38.jpg` },
  { id: 'tour-himalayan-trekking', url: `${BASE}/ServerImage/54b2de42-c4b2-4010-ac63-84976bb0f61d.jpg` },
  { id: 'tour-cultural-splendors', url: `${BASE}/ServerImage/462baf6b-c863-4478-8531-eba72a8b3e8d.jpg` },
  { id: 'tour-festival-extravaganza', url: `${BASE}/ServerImage/59c9a361-0ec3-40c5-b488-0b51cb486904.jpg` },
  { id: 'tour-wellness-retreat', url: `${BASE}/ServerImage/df9d61fe-3599-4e28-b966-e05bc8b20dc9.jpg` },
  { id: 'place-taktsang', url: `${BASE}/ServerImage/2f9c5fd9-74cf-44d6-a112-111c9022b854.jpg` },
  { id: 'place-buddha', url: `${BASE}/ServerImage/b4c88602-370a-4dec-82a3-3ef96874deaf.jpg` },
  { id: 'place-dochula', url: `${BASE}/ServerImage/4ade02a1-064e-4184-99e6-f8a6a3b8d83f.jpg` },
  { id: 'place-phobjikha', url: `${BASE}/ServerImage/2ff74246-75c5-4d16-adf8-b0904ede27c3.jpg` },
  { id: 'place-haa', url: `${BASE}/ServerImage/9bc71abf-0d86-42f1-b504-b368306a9aba.jpg` },
  { id: 'place-manas', url: `${BASE}/ServerImage/ef93b82c-e0f9-4eeb-99ae-9aa6d6f9f366.jpg` },
  { id: 'place-punakha', url: `${BASE}/ServerImage/3dce9735-f4fa-45a3-985b-d1b295931133.jpg` },
  { id: 'special-tbt', url: `${BASE}/ServerImage/9e912764-4a71-4252-bda2-c409f7c5dad0.jpg` },
  { id: 'special-homestay', url: `${BASE}/ServerImage/d7c6c59a-23a1-4bb1-a802-b80f349e0662.jpg` },
  { id: 'special-womens', url: `${BASE}/ServerImage/2c893c22-e223-4ba5-9ffd-d13578158f1a.jpg` },
]

const localFiles = [
  {
    id: 'generated-taktsang',
    file: path.join(
      process.env.USERPROFILE || '',
      '.cursor/projects/c-GitHub-sacred-himalayan/assets/generated-taktsang.png'
    ),
  },
  {
    id: 'generated-punakha',
    file: path.join(
      process.env.USERPROFILE || '',
      '.cursor/projects/c-GitHub-sacred-himalayan/assets/generated-punakha.png'
    ),
  },
  {
    id: 'generated-dochula',
    file: path.join(
      process.env.USERPROFILE || '',
      '.cursor/projects/c-GitHub-sacred-himalayan/assets/generated-dochula.png'
    ),
  },
]

async function uploadRemote(item) {
  const result = await cloudinary.uploader.upload(item.url, {
    folder: FOLDER,
    public_id: item.id,
    overwrite: true,
    resource_type: 'image',
  })
  return { id: item.id, public_id: result.public_id, url: result.secure_url }
}

async function uploadLocal(item) {
  if (!fs.existsSync(item.file)) {
    console.warn('skip missing', item.file)
    return null
  }
  const result = await cloudinary.uploader.upload(item.file, {
    folder: FOLDER,
    public_id: item.id,
    overwrite: true,
    resource_type: 'image',
  })
  return { id: item.id, public_id: result.public_id, url: result.secure_url }
}

function img(map, id) {
  return map[id]
}

async function seed(map) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn('No Supabase keys — images uploaded only')
    return
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const logo = img(map, 'logo')
  const heroIds = ['hero-1', 'generated-taktsang', 'hero-3', 'generated-punakha', 'generated-dochula']
  const heroes = heroIds
    .map((id, i) => {
      const m = img(map, id)
      if (!m) return null
      return {
        title:
          i === 0
            ? 'Your Journey of a Lifetime'
            : i === 1
              ? 'Tiger’s Nest in summer light'
              : i === 2
                ? 'Valleys of the Thunder Dragon'
                : i === 3
                  ? 'Punakha, where two rivers meet'
                  : 'Prayer flags on the high pass',
        subtitle: 'Safety | Comfort | Happiness',
        image_public_id: m.public_id,
        image_url: m.url,
        cta_text: 'View packages',
        cta_link: '/tours',
        title_color: '#7EB8C9',
        slide_order: i,
        is_active: true,
      }
    })
    .filter(Boolean)

  const tours = [
    {
      title: 'Discover Bhutan — Thimphu, Paro, Punakha',
      slug: 'discover-bhutan',
      tagline: 'Seven days in the western valleys',
      description:
        'A private introduction to Bhutan’s capital, the old fortress town of Paro, and Punakha’s riverside dzong.',
      category: 'trekkings',
      duration: 7,
      duration_nights: 6,
      price: 1430,
      show_price: true,
      difficulty_level: 'easy',
      is_featured: true,
      is_active: true,
      is_published: true,
      sort_order: 1,
      image: 'tour-discover-bhutan',
    },
    {
      title: 'Spiritual Journey — Paro, Bumthang, Haa Valley',
      slug: 'spiritual-journey',
      tagline: 'Temples, valleys, and quiet days',
      description:
        'Ten days through sacred Paro, Bumthang’s temple heartland, and the open bowl of Haa.',
      category: 'heritage-culture',
      duration: 10,
      duration_nights: 9,
      price: 2525,
      show_price: true,
      difficulty_level: 'easy',
      is_featured: true,
      is_active: true,
      is_published: true,
      sort_order: 2,
      image: 'tour-spiritual-journey',
    },
    {
      title: "Nature's Paradise — Thimphu, Phobjikha, Haa Valley",
      slug: 'natures-paradise',
      tagline: 'Glacial valleys and black-necked cranes’ country',
      description:
        'Seven days among forests, high valleys, and the wide glacial bowl of Phobjikha.',
      category: 'trekkings',
      duration: 7,
      duration_nights: 6,
      price: 1430,
      show_price: true,
      difficulty_level: 'moderate',
      is_featured: true,
      is_active: true,
      is_published: true,
      sort_order: 3,
      image: 'tour-natures-paradise',
    },
    {
      title: "Himalayan Trekking Adventure — Tiger's Nest & Jomolhari",
      slug: 'himalayan-trekking-adventure',
      tagline: 'Cliff path and high camp',
      description:
        'Ten days that join the Tiger’s Nest climb with the classic Jomolhari approach.',
      category: 'trekkings',
      duration: 10,
      duration_nights: 9,
      price: 2900,
      show_price: true,
      difficulty_level: 'challenging',
      is_featured: true,
      is_active: true,
      is_published: true,
      sort_order: 4,
      image: 'tour-himalayan-trekking',
    },
    {
      title: 'Cultural Splendors — Thimphu, Punakha, Bumthang',
      slug: 'cultural-splendors',
      tagline: 'Dzongs, festivals of stone, and the central valleys',
      description:
        'Nine days through Bhutan’s cultural spine — capital, riverside fortress, and Bumthang.',
      category: 'heritage-culture',
      duration: 9,
      duration_nights: 8,
      price: 2160,
      show_price: true,
      difficulty_level: 'easy',
      is_featured: true,
      is_active: true,
      is_published: true,
      sort_order: 5,
      image: 'tour-cultural-splendors',
    },
    {
      title: 'Bhutan Festival Extravaganza — Thimphu',
      slug: 'bhutan-festival-extravaganza',
      tagline: 'Mask dances in the courtyard',
      description:
        'Eight days timed to Thimphu’s festival season, with room for temples and quiet evenings.',
      category: 'festivals',
      duration: 8,
      duration_nights: 7,
      price: 2840,
      show_price: true,
      difficulty_level: 'easy',
      is_featured: true,
      is_active: true,
      is_published: true,
      sort_order: 6,
      image: 'tour-festival-extravaganza',
    },
    {
      title: 'Wellness Retreat — Paro',
      slug: 'wellness-retreat',
      tagline: 'Hot stone, forest air, and rest',
      description:
        'Seven days in Paro for hot-stone baths, short walks, and time enough to arrive.',
      category: 'relaxation',
      duration: 7,
      duration_nights: 6,
      price: 1430,
      show_price: true,
      difficulty_level: 'easy',
      is_featured: true,
      is_active: true,
      is_published: true,
      sort_order: 7,
      image: 'tour-wellness-retreat',
    },
  ]

  const journal = [
    {
      title: 'Walking the Trans Bhutan Trail',
      slug: 'trans-bhutan-trail',
      excerpt:
        'Four hundred and three kilometres of an old path — trade, armies, pilgrimage — opened again for walkers.',
      content:
        'For generations the Trans Bhutan Trail carried traders, armies, and pilgrims. Today it is walked again, village to village, with the same ridgelines and the same hospitality.',
      category: 'Trail',
      tags: ['trans-bhutan-trail', 'trekking'],
      status: 'published',
      is_published: true,
      author_name: 'Sacred Himalaya Travel',
      published_at: new Date().toISOString(),
      image: 'special-tbt',
    },
    {
      title: 'Homestay to homestay, Paro to Phobjikha',
      slug: 'homestay-paro-phobjikha',
      excerpt:
        'Eight days of Bhutanese kitchens, hot-stone baths, and archery with neighbours.',
      content:
        'A slower road: farmhouses, red rice, and evenings by the stove. From Paro into Phobjikha, the welcome is the itinerary.',
      category: 'Homestay',
      tags: ['homestay', 'culture'],
      status: 'published',
      is_published: true,
      author_name: 'Sacred Himalaya Travel',
      published_at: new Date().toISOString(),
      image: 'special-homestay',
    },
    {
      title: 'A women’s journey from Paro to Bumthang',
      slug: 'womens-journey-paro-bumthang',
      excerpt:
        'Ten days led by a woman guide — games, designers, and Thimphu after dark.',
      content:
        'Built for the company of women: a Bhutanese guide, meetings with makers, and nights in the capital that are not on the standard coach list.',
      category: 'Special',
      tags: ['women', 'culture'],
      status: 'published',
      is_published: true,
      author_name: 'Sacred Himalaya Travel',
      published_at: new Date().toISOString(),
      image: 'special-womens',
    },
  ]

  const { error: heroErr } = await supabase.from('hero_slides').upsert(heroes, {
    onConflict: 'image_public_id',
    ignoreDuplicates: true,
  })
  if (heroErr) {
    const ins = await supabase.from('hero_slides').insert(heroes)
    if (ins.error) console.error('hero_slides', ins.error.message)
    else console.log('hero_slides inserted', heroes.length)
  } else console.log('hero_slides ok')

  for (const t of tours) {
    const m = img(map, t.image)
    const row = {
      title: t.title,
      slug: t.slug,
      tagline: t.tagline,
      description: t.description,
      category: t.category,
      duration: t.duration,
      duration_nights: t.duration_nights,
      price: t.price,
      show_price: t.show_price,
      difficulty_level: t.difficulty_level,
      is_featured: t.is_featured,
      is_active: t.is_active,
      is_published: t.is_published,
      sort_order: t.sort_order,
      hero_image_public_id: m?.public_id,
      hero_image_url: m?.url,
      thumbnail_public_id: m?.public_id,
      thumbnail_url: m?.url,
    }
    const { error } = await supabase.from('tours').upsert(row, { onConflict: 'slug' })
    if (error) console.error('tour', t.slug, error.message)
    else console.log('tour', t.slug)
  }

  for (const p of journal) {
    const m = img(map, p.image)
    const row = {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      tags: p.tags,
      status: p.status,
      is_published: p.is_published,
      author_name: p.author_name,
      published_at: p.published_at,
      featured_image_public_id: m?.public_id,
      featured_image_url: m?.url,
    }
    const { error } = await supabase.from('blog_posts').upsert(row, { onConflict: 'slug' })
    if (error) console.error('journal', p.slug, error.message)
    else console.log('journal', p.slug)
  }

  const testimonials = [
    {
      name: 'Steve Pigott',
      location: 'Traveller, 2022',
      text: 'Four weeks through Bhutan with Sacred Himalaya Travel felt effortless. Laxmi and Tshetem are knowledgeable and welcoming; the guides and drivers skilled, friendly, and professional. I cannot imagine a better way to see the country.',
      rating: 5,
      is_approved: true,
      is_featured: true,
      image_public_id: logo?.public_id || 'sacred-himalaya/logo',
      image_url: logo?.url || '',
    },
    {
      name: 'J. S.',
      location: 'Four-week guest',
      text: 'The care and knowledge of Sacred Himalaya’s staff and guides was tremendous. They know Bhutan, and they know what visitors need in order to arrive and settle. Some of the guides became friends.',
      rating: 5,
      is_approved: true,
      is_featured: true,
      image_public_id: logo?.public_id || 'sacred-himalaya/logo',
      image_url: logo?.url || '',
    },
  ]
  const { error: tErr } = await supabase.from('testimonials').insert(testimonials)
  if (tErr) console.error('testimonials', tErr.message)
  else console.log('testimonials ok')

  const faqs = [
    {
      question: 'Do I need a visa?',
      answer:
        'Yes for most visitors. We arrange the visa with your booking so you arrive ready to travel.',
      category: 'Planning',
      sort_order: 1,
      is_active: true,
    },
    {
      question: 'When should I go?',
      answer:
        'March–May and September–November bring clear skies. Festivals and treks run throughout the year.',
      category: 'Planning',
      sort_order: 2,
      is_active: true,
    },
    {
      question: 'What does a trip cost?',
      answer:
        'Listed packages start from the published rate per person, excluding flights. Season, group size, and route shape the final quote.',
      category: 'Planning',
      sort_order: 3,
      is_active: true,
    },
    {
      question: 'Is Bhutan safe?',
      answer:
        'It is among the safest places to travel in the region. Licensed guides and drivers stay with you throughout.',
      category: 'Planning',
      sort_order: 4,
      is_active: true,
    },
    {
      question: 'What is the SDF?',
      answer:
        'The Sustainable Development Fee supports Bhutan’s forests and culture. We include it clearly in your quote.',
      category: 'Planning',
      sort_order: 5,
      is_active: true,
    },
    {
      question: 'How do I fly in?',
      answer:
        'Most guests land in Paro. We time your arrival, handle transfers, and stay reachable on WhatsApp.',
      category: 'Planning',
      sort_order: 6,
      is_active: true,
    },
  ]
  const { error: fErr } = await supabase.from('faqs').upsert(faqs, { onConflict: 'question' })
  if (fErr) console.error('faqs', fErr.message)
  else console.log('faqs ok')

  const aboutImg = img(map, 'generated-punakha') || img(map, 'hero-2')
  const bhutanImg = img(map, 'generated-taktsang') || img(map, 'place-taktsang')

  const homeContent = {
    aboutBhutan: { image: bhutanImg?.url },
    aboutCompany: { image: aboutImg?.url },
  }
  const { error: homeErr } = await supabase.from('content_pages').upsert(
    {
      page_type: 'home',
      content: homeContent,
      is_active: true,
    },
    { onConflict: 'page_type' }
  )
  if (homeErr) console.error('content home', homeErr.message)
  else console.log('content home ok')

  if (logo) {
    await supabase.from('site_settings').upsert(
      {
        key: 'brand_logo',
        value: { url: logo.url, publicId: logo.public_id, height: 68 },
        category: 'general',
        is_public: true,
      },
      { onConflict: 'key' }
    )
  }
}

async function main() {
  const map = {}
  for (const item of remote) {
    try {
      const r = await uploadRemote(item)
      map[r.id] = r
      console.log('uploaded', r.id)
    } catch (err) {
      console.error('fail', item.id, err.message || err)
    }
  }
  for (const item of localFiles) {
    try {
      const r = await uploadLocal(item)
      if (r) {
        map[r.id] = r
        console.log('uploaded', r.id)
      }
    } catch (err) {
      console.error('fail local', item.id, err.message || err)
    }
  }
  fs.writeFileSync(path.join(__dirname, 'cloudinary-map.json'), JSON.stringify(map, null, 2))
  await seed(map)
  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
