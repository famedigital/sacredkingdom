/** Shared About page content shape + deep merge for CMS ↔ public */

export type AboutHero = {
  title: string
  subtitle: string
  backgroundImage: string
  cta: { text: string; link: string }
}

export type AboutStory = {
  title: string
  content: string
  founded: string
}

export type AboutValue = { title: string; description: string; icon?: string }
export type AboutStat = { number: string; label: string }
export type AboutTimelineEvent = { year: string; title: string; description: string }
export type AboutTeamMember = {
  name: string
  role: string
  bio: string
  image?: string
  quote?: string
}

/** Kinzang in gho at rice terraces — About photo from sacredkingdom.travel. */
export const FOUNDER_PORTRAIT_SRC = '/images/founder-kinzang-coth.jpg'

export function isFounderMember(member: Pick<AboutTeamMember, 'name' | 'role'>): boolean {
  return /kinzang/i.test(member.name) || /founder/i.test(member.role)
}

export type AboutContent = {
  hero: AboutHero
  story: AboutStory
  values: AboutValue[]
  statistics: AboutStat[]
  timeline: AboutTimelineEvent[]
  team: AboutTeamMember[]
}

export const ABOUT_DEFAULTS: AboutContent = {
  hero: {
    title: 'Your gateway to the last Shangri-La',
    subtitle:
      'Sacred Kingdom Travel Bhutan curates transformative journeys into the heart of the world’s last Buddhist kingdom — locally owned, tailor-made, and led by people who know every valley.',
    backgroundImage: '',
    cta: { text: 'Explore our trips', link: '/tours' },
  },
  story: {
    title: 'Sacred Kingdom Travel Bhutan: your gateway to the last Shangri-La',
    content:
      'We do not only plan trips. We curate journeys into the heart of the world’s last Buddhist kingdom — with reverence for Bhutan’s environment and culture. Kinzang Coth, Founder & COO, spent more than seventeen years as a guide and later in management at leading Bhutanese travel companies before creating Sacred Kingdom Travel. The Tourism Council of Bhutan licensed the company in 2022 (license 1046359). The aim is authentic, meaningful travel: personalized itineraries, expert local guides, and stress-free days from the first booking to the last airport run — Tiger’s Nest, festival tours, and the carbon-negative landscapes of the kingdom.',
    founded: '2014',
  },
  values: [
    {
      icon: 'Heart',
      title: 'Personalized itineraries',
      description: 'Fully customizable packages for adventure, rest, or a cultural journey.',
    },
    {
      icon: 'Users',
      title: 'Expert local guides',
      description: 'Passionate Bhutanese guides who take you off the beaten path.',
    },
    {
      icon: 'Shield',
      title: 'Stress-free travel',
      description: 'Flights, lodgings, and tours handled so you can enjoy the kingdom. Support around the clock.',
    },
    {
      icon: 'Mountain',
      title: 'Authentic connection',
      description: 'Travel that awakens the spirit — culture, nature, and the joy of discovery.',
    },
  ],
  statistics: [
    { number: '17+', label: 'Years of guiding experience' },
    { number: '14', label: 'Signature packages' },
    { number: '2022', label: 'TCB licensed' },
    { number: '5.0', label: 'TripAdvisor rating' },
  ],
  timeline: [
    {
      year: '2014',
      title: 'A personal Bhutan house',
      description:
        'Kinzang’s vision for a more personal operator — authentic, meaningful, and rooted in the kingdom — takes shape as Sacred Kingdom Travel Bhutan.',
    },
    {
      year: '2022',
      title: 'Tourism Council licence',
      description: 'Licensed with the Tourism Council of Bhutan (1046359), operating from Changlam Plaza, Thimphu.',
    },
  ],
  team: [
    {
      name: 'Kinzang Coth',
      role: 'Founder & COO, Sacred Kingdom Travel Bhutan',
      quote:
        'Travel is more than visiting destinations — it’s about seeing the world with renewed perspective.',
      bio: 'Kinzang Coth embodies our mission to connect travelers with the essence of Bhutan.\n\nGuided by a deep love for nature, culture, and the human spirit, Kinzang has spent over 17 years exploring every valley, monastery, and mountain trail across the Kingdom of Happiness. His path began as a tour guide and grew into leading special-interest and international groups seeking authentic, transformative adventures.\n\nHis dedication later took him into management at some of Bhutan’s top travel companies. His true vision was more personal: travel rooted in authenticity, meaning, and heartfelt connection. Sacred Kingdom Travel Bhutan was born from that devotion — journeys that celebrate Bhutan’s sacred beauty, timeless traditions, and the joy of discovery.',
      image: FOUNDER_PORTRAIT_SRC,
    },
  ],
}

/** Deep-merge CMS payload so nested hero/story/arrays from admin are never dropped. */
export function mergeAboutContent(raw: unknown): AboutContent {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>

  const heroRaw = data.hero && typeof data.hero === 'object' ? data.hero : {}
  const storyRaw = data.story && typeof data.story === 'object' ? data.story : {}
  const ctaRaw = heroRaw.cta && typeof heroRaw.cta === 'object' ? heroRaw.cta : {}

  const values = Array.isArray(data.values)
    ? data.values.filter((v: any) => v && (v.title || v.description))
    : ABOUT_DEFAULTS.values

  const statistics = Array.isArray(data.statistics)
    ? data.statistics.filter((s: any) => s && (s.number || s.label))
    : ABOUT_DEFAULTS.statistics

  const timeline = Array.isArray(data.timeline)
    ? data.timeline.filter((t: any) => t && (t.year || t.title || t.description))
    : ABOUT_DEFAULTS.timeline

  const mappedTeam = Array.isArray(data.team)
    ? data.team
        .filter((m: any) => m && (m.name || m.role || m.bio))
        .map((m: any) => {
          const rawImage = m.image ?? m.image_url ?? m.photo ?? m.avatar
          const image =
            typeof rawImage === 'string' && rawImage.trim() ? rawImage.trim() : undefined
          const name = typeof m.name === 'string' ? m.name : ''
          if (/wangchuk/i.test(name)) return null
          const quote = typeof m.quote === 'string' && m.quote.trim() ? m.quote.trim() : undefined
          const member: AboutTeamMember = {
            name,
            role: typeof m.role === 'string' ? m.role : '',
            bio: typeof m.bio === 'string' ? m.bio : '',
            ...(quote ? { quote } : {}),
            ...(image ? { image } : {}),
          }
          if (isFounderMember(member)) {
            const founder = ABOUT_DEFAULTS.team[0]
            member.name = founder.name
            member.role = founder.role
            member.bio = founder.bio
            member.quote = founder.quote
            member.image = founder.image
          }
          return member
        })
        .filter((m): m is AboutTeamMember => Boolean(m))
    : []

  const storyContentRaw = String(storyRaw.content || '')
  const storyContent =
    !storyContentRaw.trim() || /wangchuk/i.test(storyContentRaw)
      ? ABOUT_DEFAULTS.story.content
      : storyContentRaw

  return {
    hero: {
      title: /wangchuk/i.test(String(heroRaw.title || ''))
        ? ABOUT_DEFAULTS.hero.title
        : heroRaw.title || ABOUT_DEFAULTS.hero.title,
      subtitle: /wangchuk/i.test(String(heroRaw.subtitle || ''))
        ? ABOUT_DEFAULTS.hero.subtitle
        : heroRaw.subtitle || ABOUT_DEFAULTS.hero.subtitle,
      backgroundImage: heroRaw.backgroundImage || ABOUT_DEFAULTS.hero.backgroundImage,
      cta: {
        text: ctaRaw.text || ABOUT_DEFAULTS.hero.cta.text,
        link: ctaRaw.link || ABOUT_DEFAULTS.hero.cta.link,
      },
    },
    story: {
      title: storyRaw.title || ABOUT_DEFAULTS.story.title,
      content: storyContent,
      founded: storyRaw.founded || ABOUT_DEFAULTS.story.founded,
    },
    values: values.length > 0 ? values : ABOUT_DEFAULTS.values,
    statistics: statistics.length > 0 ? statistics : ABOUT_DEFAULTS.statistics,
    timeline: timeline.length > 0 ? timeline : ABOUT_DEFAULTS.timeline,
    team: (() => {
      const list = mappedTeam.length > 0 ? mappedTeam : [...ABOUT_DEFAULTS.team]
      const withoutPlaceholders = list.filter((m) => {
        const img = m.image || ''
        if (/via\.placeholder/i.test(img)) return false
        if (isFounderMember(m)) return true
        return Boolean(m.name?.trim())
      })
      if (!withoutPlaceholders.some((m) => isFounderMember(m))) {
        return [ABOUT_DEFAULTS.team[0], ...withoutPlaceholders]
      }
      return withoutPlaceholders
    })(),
  }
}
