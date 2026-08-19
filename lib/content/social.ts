/**
 * Social profiles from https://sacredkingdom.travel/ (Aug 2026).
 *
 * Live Astra footer shows Facebook, Twitter, and Instagram with empty hrefs.
 * The only filled social URL on the site is Tripadvisor (location d32891284).
 * WhatsApp is the published contact number, not a footer href on the live site.
 */

export const TRIPADVISOR_LOCATION_ID = 'd32891284'

export const TRIPADVISOR_LISTING_URL =
  'https://www.tripadvisor.com/UserReviewEdit-g293845-d32891284-Sacred_Kingdom_Travel-Thimphu_Thimphu_District.html'

export const SOCIAL_DEFAULTS = {
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  tripadvisor: TRIPADVISOR_LISTING_URL,
} as const

/** Icon order matching the live footer, then Tripadvisor + WhatsApp. */
export const FOOTER_SOCIAL_ORDER = [
  'facebook',
  'twitter',
  'instagram',
  'whatsapp',
  'tripadvisor',
  'linkedin',
] as const
