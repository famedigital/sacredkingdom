import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv() {
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
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

const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'cloudinary-map.json'), 'utf8'))
const img = (id) => map[id]

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function throwIf(error) {
  if (error) throw error
}

async function main() {
  throwIf((await supabase.from('hero_slides').delete().gte('slide_order', 0)).error)
  const heroIds = ['hero-1', 'generated-taktsang', 'hero-3', 'generated-punakha', 'generated-dochula']
  const titles = [
    'Experience Bhutan like never before',
    'Tiger’s Nest in summer light',
    'Valleys of the Thunder Dragon',
    'Punakha, where two rivers meet',
    'Prayer flags on the high pass',
  ]
  const heroes = []
  for (let i = 0; i < heroIds.length; i++) {
    const m = img(heroIds[i])
    if (!m) continue
    heroes.push({
      title: titles[i],
      subtitle: 'Authentic journeys, tailored just for you',
      image_public_id: m.public_id,
      image_url: m.url,
      cta_text: 'Plan your Trip',
      cta_link: '/contact#contact-form',
      title_color: '#E8D5A3',
      slide_order: i,
      is_active: true,
    })
  }
  throwIf((await supabase.from('hero_slides').insert(heroes)).error)
  console.log('heroes')

  throwIf((await supabase.from('tours').update({ is_published: false, is_featured: false, is_active: false }).neq('slug', '__none__')).error)

  // Featured homepage packages first, then remaining trips from sacredkingdom.travel
  const tours = [
    ['Bhutan Himalayan Odyssey', 'bhutan-himalayan-odyssey', 'Culture, spirituality, and western valleys', 'A signature 6-day package through Thimphu, Punakha, and Paro, culminating in Tiger’s Nest — the perfect balance of culture and Himalayan scenery.', 'cultural', 6, 5, 0, 'easy', 1, 'tour-discover-bhutan', true],
    ['The Ultimate Himalayan Journey', 'the-ultimate-himalayan-journey', 'Culture, nature, and adventure combined', 'An immersive 8-day Bhutan journey for travellers who want more than sightseeing — a deeper connection to the Land of the Thunder Dragon.', 'cultural', 8, 7, 0, 'easy', 2, 'tour-cultural-splendors', true],
    ['The Dragon Kingdom’s Complete Journey', 'the-dragon-kingdoms-complete-journey', 'West to east across Bhutan', 'A 12-day cross-country odyssey from Paro, Thimphu, and Punakha to Bumthang, Mongar, and Trashigang.', 'cultural', 12, 11, 0, 'moderate', 3, 'tour-spiritual-journey', true],
    ['Drukpath Trek & Cultural Immersion', 'drukpath-trek-cultural-immersion', 'High trail between Thimphu and Paro', 'Nine days combining the legendary Drukpath Trek with sacred landmarks, glacial lakes, and Himalayan ridges.', 'trekking', 9, 8, 0, 'challenging', 4, 'tour-himalayan-trekking', true],
    ['Bhutan Heartland Journey', 'bhutan-heartland-journey', 'Pilgrimage through the spiritual core', 'Ten days beyond the western valleys into Bhutan’s sacred heartlands — culture and spirit in equal measure.', 'cultural', 10, 9, 0, 'easy', 5, 'tour-natures-paradise', true],
    ['Bhutan Himalayan Journey: Monasteries, Valleys & the Tiger’s Nest', 'bhutan-himalayan-journey-monasteries-valleys-the-tigers-nest', 'Classic 7-day western circuit', 'Thimphu, Punakha Dzong, and the hike to Tiger’s Nest — cultural discovery with Himalayan landscapes.', 'cultural', 7, 6, 0, 'easy', 6, 'generated-taktsang', false],
    ['Bhutan Spiritual & Wellness Retreat Tour', 'bhutan-spiritual-wellness-retreat-tour', 'Mind, body, and the land of happiness', 'Ten days of meditation, nature immersion, and cultural exploration for travellers seeking peace and mindful rest.', 'relaxation', 10, 9, 0, 'easy', 7, 'tour-wellness-retreat', false],
    ['Thimphu Tshechu Festival Tour 2026', 'thimphu-tshechu-festival-tour-2026', 'Mask dances in the capital', 'Eight days timed to Thimphu Tshechu — Paro, Thimphu, and Punakha with sacred rituals and courtyard dances.', 'festivals', 8, 7, 0, 'easy', 8, 'tour-festival-extravaganza', false],
    ['Bhutan Festival Tour 2027', 'bhutan-festival-tour-2027', 'Paro Tshechu 2027', 'Eleven days around Paro Tshechu — authentic culture, sacred rituals, and the valleys of Paro, Thimphu, and Punakha.', 'festivals', 11, 10, 0, 'easy', 9, 'theme-festivals', false],
    ['Bhutan International Marathon 2026', 'bhutan-international-marathon-2026', 'Run Punakha Valley · 7 March 2026', 'Seven days blending the world’s most peaceful marathon with fitness, culture, and spiritual exploration.', 'festivals', 7, 6, 0, 'moderate', 10, 'place-punakha', false],
    ['Jomolhari Trek & Himalayan Cultural Journey', 'jomolhari-trek-himalayan-cultural-journey', 'High-altitude trail and western culture', 'Thirteen days joining the Jomolhari Trek with Paro, Thimphu, and Punakha.', 'trekking', 13, 12, 0, 'challenging', 11, 'theme-trekkings', false],
    ['Laya-Lingshi Trek & Himalayan Cultural Odyssey', 'laya-lingshi-trek-himalayan-cultural-odyssey', 'Remote 19-day Himalayan expedition', 'High-altitude trekking through untouched landscapes with cultural days in Paro, Thimphu, and Punakha.', 'trekking', 19, 18, 0, 'challenging', 12, 'theme-heritage', false],
    ['Snowman Trek – The Ultimate Himalayan Challenge', 'snowman-trek-the-ultimate-himalayan-challenge', 'Bhutan’s legendary remote trail', 'Nineteen days across some of the kingdom’s most remote regions, with culture in Paro, Thimphu, and Punakha.', 'trekking', 19, 18, 0, 'challenging', 13, 'theme-trekkings', false],
    ['Bhutan Nature & Wildlife Conservation Tour', 'bhutan-nature-wildlife-conservation-tour', 'Forests, parks, and living sanctuary', 'Eighteen days in a kingdom where more than 70% of the land remains forested and conservation is woven into Gross National Happiness.', 'wildlife', 18, 17, 0, 'moderate', 14, 'place-manas', false],
  ]
  const tourRows = tours.map((t) => {
    const m = img(t[10])
    return {
      title: t[0],
      slug: t[1],
      tagline: t[2],
      description: t[3],
      category: t[4],
      duration: t[5],
      duration_nights: t[6],
      price: t[7],
      difficulty_level: t[8],
      sort_order: t[9],
      hero_image_public_id: m?.public_id,
      hero_image_url: m?.url,
      thumbnail_public_id: m?.public_id,
      thumbnail_url: m?.url,
      is_featured: t[11],
      is_active: true,
      is_published: true,
      show_price: false,
    }
  })
  throwIf((await supabase.from('tours').upsert(tourRows, { onConflict: 'slug' })).error)
  for (const t of tours) console.log('tour', t[1])

  throwIf((await supabase.from('blog_posts').update({ is_published: false, status: 'draft' }).neq('slug', '__none__')).error)

  const posts = [
    ['Bhutan: A Journey into the Last Himalayan Kingdom', 'bhutan-a-journey-into-the-last-himalayan-kingdom', 'Tucked away in the Eastern Himalayas, Bhutan offers a rare blend of mountains, living Buddhist culture, and Gross National Happiness.', 'Tucked away in the heart of the Eastern Himalayas, Bhutan is a destination unlike any other. Known as the Last Himalayan Kingdom, it offers travelers a rare blend of pristine landscapes and vibrant culture.', 'Journal', 'special-tbt'],
    ['Why Travel Bhutan', 'why-travel-bhutan', 'Pristine Himalayan landscapes, festivals, Gross National Happiness, and sustainable tourism that few countries can match.', 'Bhutan is worth traveling to because it offers pristine Himalayan landscapes, vibrant cultural festivals, a unique philosophy of Gross National Happiness, and a sustainable tourism model.', 'Journal', 'special-homestay'],
    ['Top 5 places to visit in Bhutan in 2026', 'top-5-places-to-visit-in-bhutan-in-2026', 'Planning a trip to the Land of the Thunder Dragon? Start with the valleys and monasteries that define a first journey.', 'Planning a trip to the Land of the Thunder Dragon? Bhutan offers an unparalleled blend of pristine natural beauty, ancient Buddhist culture, and sustainable tourism.', 'Journal', 'special-womens'],
  ]
  const postRows = posts.map((p) => {
    const m = img(p[5])
    return {
      title: p[0],
      slug: p[1],
      excerpt: p[2],
      content: p[3],
      category: p[4],
      tags: ['journal'],
      status: 'published',
      is_published: true,
      author_name: 'Sacred Kingdom Travel',
      published_at: new Date().toISOString(),
      featured_image_public_id: m?.public_id,
      featured_image_url: m?.url,
    }
  })
  throwIf((await supabase.from('blog_posts').upsert(postRows, { onConflict: 'slug' })).error)
  for (const p of posts) console.log('journal', p[1])

  throwIf((await supabase.from('testimonials').delete().neq('name', '__none__')).error)
  const logo = img('logo')
  throwIf(
    (
      await supabase.from('testimonials').insert([
        {
          name: 'Louise07',
          location: 'TripAdvisor',
          text: 'We had an absolutely wonderful trip to Bhutan. Everything was beautifully organized and the hospitality exceeded our expectations.',
          rating: 5,
          is_approved: true,
          is_featured: true,
          image_public_id: logo?.public_id,
          image_url: logo?.url,
        },
        {
          name: 'Angie',
          location: 'TripAdvisor',
          text: 'Our Bhutan experience was seamless from beginning to end. The guides were incredibly thoughtful and knowledgeable.',
          rating: 5,
          is_approved: true,
          is_featured: true,
          image_public_id: logo?.public_id,
          image_url: logo?.url,
        },
        {
          name: 'Saraaaaaaaa',
          location: 'TripAdvisor',
          text: 'The team made our Bhutan trip effortless and memorable. Highly recommended for anyone seeking authentic Bhutan experiences.',
          rating: 5,
          is_approved: true,
          is_featured: true,
          image_public_id: logo?.public_id,
          image_url: logo?.url,
        },
      ])
    ).error
  )
  console.log('testimonials')

  const faqs = [
    ['Do I need a visa?', 'Yes for most visitors. As a licensed Bhutan tour operator we arrange the visa with your booking.', 1],
    ['When should I go?', 'March–May and September–November bring clear skies. Festival dates and treks run throughout the year.', 2],
    ['Can you tailor the trip?', 'Yes. Every itinerary is customizable — adventure, rest, culture, or a mix — around how you like to travel.', 3],
    ['Is Bhutan safe?', 'It is among the safest places to travel in the region. Local guides and drivers stay with you throughout.', 4],
    ['What is the SDF?', 'The Sustainable Development Fee supports Bhutan’s forests and culture. We include it clearly in your quote.', 5],
    ['How do I fly in?', 'Most guests land in Paro. We time your arrival, handle transfers, and stay reachable by phone and email.', 6],
  ]
  for (const f of faqs) {
    throwIf(
      (
        await supabase.from('faqs').upsert(
          { question: f[0], answer: f[1], category: 'Planning', sort_order: f[2], is_active: true },
          { onConflict: 'question' }
        )
      ).error
    )
  }
  console.log('faqs')

  const aboutImg = img('generated-punakha') || img('hero-2')
  const bhutanImg = img('generated-taktsang') || img('place-taktsang')
  const home = {
    aboutBhutan: {
      eyebrow: 'The kingdom',
      title: 'Best tourist spots in Bhutan',
      titleColor: '#0A2744',
      body: 'Bhutan is filled with peaceful valleys, ancient monasteries, scenic mountain views, and charming villages. Every destination offers a unique mix of culture, nature, and unforgettable experiences — from Tiger’s Nest to Punakha Dzong, high passes, and the world’s only carbon-negative country.',
      image: bhutanImg?.url,
    },
    aboutCompany: {
      eyebrow: 'Locally owned',
      title: 'Sacred Kingdom Travel',
      titleColor: '#0A2744',
      body: 'Sacred Kingdom Travel Bhutan creates meaningful, personalized journeys that show Bhutan’s culture, nature, and spiritual heritage. As a locally owned tour operator licensed in 2022, we plan authentic days — Tiger’s Nest, festivals, treks, and wildlife — with local expert guides and seamless planning from Thimphu.',
      image: aboutImg?.url,
    },
    featured: {
      eyebrow: 'Holiday tour packages',
      title: 'Journeys through the last Shangri-La',
      titleColor: '#0A2744',
      subtitle: 'Signature itineraries from a six-day western circuit to treks, festivals, and the far east.',
    },
    journal: {
      eyebrow: 'Journal',
      title: 'Notes from the kingdom',
      subtitle: 'Why travel Bhutan, where to go in 2026, and the last Himalayan kingdom.',
    },
  }
  throwIf(
    (
      await supabase.from('content_pages').upsert(
        { page_type: 'home', content: home, is_active: true },
        { onConflict: 'page_type' }
      )
    ).error
  )
  console.log('home content')

  throwIf(
    (
      await supabase.from('site_settings').upsert(
        [
          { key: 'site_name', value: 'Sacred Kingdom Travel', category: 'general', is_public: true },
          { key: 'contact_email', value: 'sacredkingdomtravel@gmail.com', category: 'general', is_public: true },
          { key: 'contact_phone', value: '+975 77888822', category: 'general', is_public: true },
          {
            key: 'contact_address',
            value: 'Changlam Plaza, Room No. 502, P.O. Box 1459, Thimphu, Bhutan',
            category: 'general',
            is_public: true,
          },
          ...(logo
            ? [
                {
                  key: 'brand_logo',
                  value: { url: logo.url, publicId: logo.public_id, height: 68 },
                  category: 'general',
                  is_public: true,
                },
              ]
            : []),
        ],
        { onConflict: 'key' }
      )
    ).error
  )

  const { count } = await supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_published', true)
  console.log('published tours', count)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
