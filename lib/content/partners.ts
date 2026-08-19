/** Affiliation marks from sacredkingdom.travel, hosted on Cloudinary. */

export type PartnerLogo = {
  name: string
  fullName: string
  src: string
  /** Light-colored mark — darken on paper washes. */
  ink?: boolean
}

const CLOUD =
  'https://res.cloudinary.com/hqxti5zm/image/upload/f_png,q_auto,c_limit,w_360'

export const PARTNER_LOGOS: PartnerLogo[] = [
  {
    name: 'Bhutan Airlines',
    fullName: 'Tashi Air',
    src: `${CLOUD}/sacred-himalaya/partners/partner-bhutan-airlines.png`,
  },
  {
    name: 'ABTO',
    fullName: 'Association of Bhutanese Tour Operators',
    src: `${CLOUD}/sacred-himalaya/partners/partner-abto.png`,
  },
  {
    name: 'GAB',
    fullName: 'Guide Association of Bhutan',
    src: `${CLOUD}/sacred-himalaya/partners/partner-gab.png`,
  },
  {
    name: 'Drukair',
    fullName: 'Royal Bhutan Airlines',
    src: `${CLOUD}/sacred-himalaya/partners/partner-drukair.png`,
  },
  {
    name: 'Bhutan Believe',
    fullName: 'National tourism mark',
    src: `${CLOUD}/sacred-himalaya/partners/partner-bhutan-believe.png`,
    ink: true,
  },
]
