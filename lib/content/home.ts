/** Homepage CMS content — Sacred Kingdom Travel */

import {
  DEFAULT_SECTION_TITLE_COLOR,
  sanitizeCssColor,
} from '@/lib/hero-title-color'

export type HomeDifferentiator = {
  icon: string
  title: string
  description: string
}

export type HomeQuickAnswer = {
  q: string
  a: string
}

export type HomeEditorial = {
  eyebrow: string
  title: string
  titleColor: string
  body: string
  image?: string
}

export type HomeContent = {
  quickAnswers: {
    title: string
    subtitle: string
    items: HomeQuickAnswer[]
  }
  aboutBhutan: HomeEditorial
  aboutCompany: HomeEditorial
  differentiators: {
    eyebrow: string
    title: string
    titleAccent: string
    items: HomeDifferentiator[]
  }
  featured: {
    eyebrow: string
    title: string
    titleColor: string
    subtitle: string
  }
  journal: {
    eyebrow: string
    title: string
    subtitle: string
  }
}

export const HOME_DEFAULTS: HomeContent = {
  quickAnswers: {
    title: 'Before you fly',
    subtitle: 'Straight answers for a Bhutan journey — visa, season, and how we plan with you.',
    items: [
      {
        q: 'Do I need a visa?',
        a: 'Yes for most visitors. As a licensed Bhutan tour operator we arrange the visa with your booking.',
      },
      {
        q: 'When should I go?',
        a: 'March–May and September–November bring clear skies. Festival dates and treks run throughout the year.',
      },
      {
        q: 'Can you tailor the trip?',
        a: 'Yes. Every itinerary is customizable — adventure, rest, culture, or a mix — around how you like to travel.',
      },
      {
        q: 'Is Bhutan safe?',
        a: 'It is among the safest places to travel in the region. Local guides and drivers stay with you throughout.',
      },
      {
        q: 'What is the SDF?',
        a: 'The Sustainable Development Fee supports Bhutan’s forests and culture. We include it clearly in your quote.',
      },
      {
        q: 'How do I fly in?',
        a: 'Most guests land in Paro. We time your arrival, handle transfers, and stay reachable by phone and email.',
      },
    ],
  },
  aboutBhutan: {
    eyebrow: 'The kingdom',
    title: 'Best tourist spots in Bhutan',
    titleColor: '#161616',
    body: 'Bhutan is filled with peaceful valleys, ancient monasteries, scenic mountain views, and charming villages. Every destination offers a unique mix of culture, nature, and unforgettable experiences — from Tiger’s Nest to Punakha Dzong, high passes, and the world’s only carbon-negative country.',
    image:
      'https://res.cloudinary.com/hqxti5zm/image/upload/q_auto,f_auto,w_1200,c_limit/v1787140704/sacred-himalaya/place-taktsang.jpg',
  },
  aboutCompany: {
    eyebrow: 'Sacred Kingdom Travel Bhutan',
    title: 'Your gateway to the last Shangri-La',
    titleColor: '#161616',
    body: 'Sacred Kingdom Travel Bhutan creates meaningful, personalized journeys that show Bhutan’s culture, nature, and spiritual heritage. As a locally owned tour operator licensed in 2022, we plan authentic days — Tiger’s Nest, festivals, treks, and wildlife — with local expert guides and seamless planning from Thimphu.',
    image:
      'https://res.cloudinary.com/hqxti5zm/image/upload/q_auto,f_auto,w_1200,c_limit/v1787140718/sacred-himalaya/generated-punakha.png',
  },
  differentiators: {
    eyebrow: 'Why travel with us',
    title: 'Your gateway to',
    titleAccent: 'the last Shangri-La',
    items: [
      {
        icon: 'Heart',
        title: 'Authentic Experiences',
        description:
          'Days shaped around living culture — monasteries, festivals, villages, and landscapes — not a coach timetable.',
      },
      {
        icon: 'Users',
        title: 'Local Expert Guides',
        description:
          'Bhutanese guides who take you off the beaten path and share the kingdom as they know it.',
      },
      {
        icon: 'Compass',
        title: 'Tailor-Made Journeys',
        description:
          'Culture, trek, festival, wildlife, or wellness — we design the route to match how you want to see Bhutan.',
      },
      {
        icon: 'Shield',
        title: 'Seamless Planning',
        description:
          'Visa, lodgings, and touring arranged for you. The team stays reachable from Thimphu while you are here.',
      },
    ],
  },
  featured: {
    eyebrow: 'Holiday tour packages',
    title: 'Holiday tour packages in Bhutan',
    titleColor: '#161616',
    subtitle: 'Signature itineraries from a six-day western circuit to treks, festivals, and the far east.',
  },
  journal: {
    eyebrow: 'Journal',
    title: 'Notes from the kingdom',
    subtitle: 'Authentic journeys, culture, and festival days from a locally owned Bhutan tour operator.',
  },
}

const ALLOWED_ICONS = new Set(['Heart', 'Shield', 'Mountain', 'Clock', 'Users', 'Compass', 'Star', 'Globe'])

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function mergeItem(raw: unknown, fallback: HomeDifferentiator): HomeDifferentiator {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const icon = asString(row.icon, fallback.icon)
  return {
    icon: ALLOWED_ICONS.has(icon) ? icon : fallback.icon,
    title: asString(row.title, fallback.title),
    description: asString(row.description, fallback.description),
  }
}

function mergeQuickAnswer(raw: unknown, fallback: HomeQuickAnswer): HomeQuickAnswer {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    q: asString(row.q ?? row.question, fallback.q),
    a: asString(row.a ?? row.answer, fallback.a),
  }
}

function mergeEditorial(raw: unknown, fallback: HomeEditorial): HomeEditorial {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    eyebrow: asString(row.eyebrow, fallback.eyebrow),
    title: asString(row.title, fallback.title),
    titleColor: sanitizeCssColor(
      typeof row.titleColor === 'string' ? row.titleColor : null,
      fallback.titleColor || DEFAULT_SECTION_TITLE_COLOR
    ),
    body: asString(row.body ?? row.content, fallback.body),
    image: asString(row.image, fallback.image || '') || undefined,
  }
}

export function mergeHomeContent(raw: unknown): HomeContent {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const diffRaw =
    data.differentiators && typeof data.differentiators === 'object'
      ? (data.differentiators as Record<string, unknown>)
      : {}
  const featuredRaw =
    data.featured && typeof data.featured === 'object'
      ? (data.featured as Record<string, unknown>)
      : {}
  const qaRaw =
    data.quickAnswers && typeof data.quickAnswers === 'object'
      ? (data.quickAnswers as Record<string, unknown>)
      : {}
  const journalRaw =
    data.journal && typeof data.journal === 'object'
      ? (data.journal as Record<string, unknown>)
      : {}

  const defaultItems = HOME_DEFAULTS.differentiators.items
  const rawItems = Array.isArray(diffRaw.items) ? diffRaw.items : null
  const items =
    rawItems && rawItems.length > 0
      ? rawItems.map((item, i) => mergeItem(item, defaultItems[i % defaultItems.length]))
      : defaultItems

  const defaultQa = HOME_DEFAULTS.quickAnswers.items
  const rawQa = Array.isArray(qaRaw.items) ? qaRaw.items : null
  const qaItems =
    rawQa && rawQa.length > 0
      ? rawQa.map((item, i) => mergeQuickAnswer(item, defaultQa[i % defaultQa.length]))
      : defaultQa

  return {
    quickAnswers: {
      title: asString(qaRaw.title, HOME_DEFAULTS.quickAnswers.title),
      subtitle: asString(qaRaw.subtitle, HOME_DEFAULTS.quickAnswers.subtitle),
      items: qaItems,
    },
    aboutBhutan: mergeEditorial(data.aboutBhutan, HOME_DEFAULTS.aboutBhutan),
    aboutCompany: mergeEditorial(data.aboutCompany, HOME_DEFAULTS.aboutCompany),
    differentiators: {
      eyebrow: asString(diffRaw.eyebrow, HOME_DEFAULTS.differentiators.eyebrow),
      title: asString(diffRaw.title, HOME_DEFAULTS.differentiators.title),
      titleAccent: asString(diffRaw.titleAccent, HOME_DEFAULTS.differentiators.titleAccent),
      items,
    },
    featured: {
      eyebrow: asString(featuredRaw.eyebrow, HOME_DEFAULTS.featured.eyebrow),
      title: asString(featuredRaw.title, HOME_DEFAULTS.featured.title),
      titleColor: sanitizeCssColor(
        typeof featuredRaw.titleColor === 'string' ? featuredRaw.titleColor : null,
        DEFAULT_SECTION_TITLE_COLOR
      ),
      subtitle: asString(featuredRaw.subtitle, HOME_DEFAULTS.featured.subtitle),
    },
    journal: {
      eyebrow: asString(journalRaw.eyebrow, HOME_DEFAULTS.journal.eyebrow),
      title: asString(journalRaw.title, HOME_DEFAULTS.journal.title),
      subtitle: asString(journalRaw.subtitle, HOME_DEFAULTS.journal.subtitle),
    },
  }
}
