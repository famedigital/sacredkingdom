/** Experience / dzongkhag attraction pages — copy from sacredkingdom.travel */

import scraped from './destinations-data.json'

export type DestinationAttraction = {
  title: string
  body: string
}

export type Destination = {
  slug: string
  wpSlug: string
  name: string
  headline: string
  intro: string
  image: string
  attractions: DestinationAttraction[]
}

const CLOUDINARY = 'https://res.cloudinary.com/hqxti5zm/image/upload'

const IMAGES: Record<string, string> = {
  punakha: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140710/sacred-himalaya/place-punakha.jpg`,
  zhemgang: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140709/sacred-himalaya/place-manas.jpg`,
  wangdue: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140707/sacred-himalaya/place-phobjikha.jpg`,
  trongsa: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140693/sacred-himalaya/theme-heritage.jpg`,
  thimphu: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140705/sacred-himalaya/place-buddha.jpg`,
  trashigang: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140689/sacred-himalaya/hero-3.jpg`,
  trashiyangtse: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140720/sacred-himalaya/generated-dochula.png`,
  paro: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140704/sacred-himalaya/place-taktsang.jpg`,
  mongar: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140699/sacred-himalaya/tour-natures-paradise.jpg`,
  lhuntse: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140711/sacred-himalaya/special-homestay.jpg`,
  haa: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140708/sacred-himalaya/place-haa.jpg`,
  gasa: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140695/sacred-himalaya/theme-trekkings.jpg`,
  bumthang: `${CLOUDINARY}/q_auto,f_auto,w_1600,c_limit/v1787140698/sacred-himalaya/tour-spiritual-journey.jpg`,
}

const THIMPHU_ATTRACTIONS: DestinationAttraction[] = [
  {
    title: 'Buddha Dordenma Statue',
    body: 'Towering at 169 feet, the Buddha Dordenma dominates Thimphu’s skyline as one of Bhutan’s largest Buddha statues. This bronze masterpiece houses 125,000 smaller Buddha statues and offers panoramic valley views from Kuensel Phodrang. The landscaped gardens and meditation halls make it essential for photography and a quiet first look at the capital.',
  },
  {
    title: 'Tashichho Dzong',
    body: 'Tashichho Dzong is the fortress monastery that serves as government headquarters and summer residence of the Central Monastic Body. White walls and golden roofs house the throne room alongside active temples. Visitors can see the courtyard outside government hours — especially striking when the dzong is lit at night.',
  },
  {
    title: 'National Memorial Chorten',
    body: 'Built in honour of Bhutan’s third king, this white-domed stupa is Thimphu’s most lived-in religious site. Locals circle it throughout the day, spinning prayer wheels with their families. It is one of the best places to witness everyday Buddhist practice in the capital.',
  },
  {
    title: 'Motithang Takin Preserve',
    body: 'Home of Bhutan’s unusual national animal, the takin — a creature local legend credits to the Divine Madman. Elevated walkways let you watch them in forest habitat, a family-friendly stop that also tells the conservation story behind Gross National Happiness.',
  },
  {
    title: 'Simply Bhutan Museum',
    body: 'An interactive cultural centre where guests try archery, dress in national costume, and walk through a reconstructed traditional house. Guides bring Bhutanese daily life off the museum wall and into the room.',
  },
  {
    title: 'Weekend Market',
    body: 'Thimphu’s weekend market is the city’s social and commercial heart — produce, cheeses, dried fish, and handicraft stalls under a traditional roof. A clear window onto how the capital actually shops and meets.',
  },
  {
    title: 'National Folk Heritage Museum',
    body: 'A restored 19th-century house showing rural Bhutan through household tools, mills, farm animals, and heritage crops. Cultural programmes and traditional meals go beyond glass-case exhibits.',
  },
  {
    title: 'Changangkha Lhakhang',
    body: 'One of Thimphu’s oldest temples, dating to the 12th century, perched on a ridge above the city. Families still bring newborns here for blessings and names. Prayer wheels, original architecture, and a wide valley view.',
  },
  {
    title: 'Jungshi Handmade Paper Factory',
    body: 'Watch Daphne bark become traditional Bhutanese paper used for religious texts and art. Visitors can buy sheets and cards directly from the workshop that keeps the craft alive.',
  },
  {
    title: 'Zilukha Nunnery (Drubthob Goemba)',
    body: 'A nunnery overlooking Tashichho Dzong, home to about seventy nuns. Murals, statues, and a calm courtyard offer a quieter window onto monastic life in the capital.',
  },
  {
    title: 'Dochula Pass',
    body: 'The 3,100-metre pass between Thimphu and Punakha, marked by 108 Druk Wangyel chortens. On clear days — especially October to March — the Himalayan wall is in view. Prayer flags, a small temple, and one of Bhutan’s essential photographs.',
  },
]

function cleanTitle(title: string) {
  return title.replace(/\u200b/g, '').replace(/\s+/g, ' ').trim()
}

function mapRow(row: (typeof scraped)[number]): Destination {
  const attractions = (row.attractions || [])
    .map((item) => ({
      title: cleanTitle(item.title),
      body: String(item.body || '').trim(),
    }))
    .filter((item) => item.title && item.body)

  return {
    slug: row.slug,
    wpSlug: row.wpSlug,
    name: row.name,
    headline: row.headline,
    intro: row.intro,
    image: IMAGES[row.slug] || IMAGES.paro,
    attractions: row.slug === 'thimphu' && attractions.length === 0 ? THIMPHU_ATTRACTIONS : attractions,
  }
}

export const DESTINATIONS: Destination[] = scraped.map(mapRow)

export function getDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug)
}
