import { TRIPADVISOR_LISTING_URL } from '@/lib/content/social'

export { TRIPADVISOR_LISTING_URL }
export const TRIPADVISOR_RATING_LABEL = '5.0 on Tripadvisor'

export type PublicTestimonial = {
  name: string
  location: string
  text: string
  rating: number
  image: string
}

export const DEFAULT_FEATURED_TESTIMONIALS: PublicTestimonial[] = [
  {
    name: 'Louise07',
    location: 'Tripadvisor',
    text: 'We had an absolutely wonderful trip to Bhutan. Everything was beautifully organized and the hospitality exceeded our expectations.',
    rating: 5,
    image: '',
  },
  {
    name: 'Angie',
    location: 'Tripadvisor',
    text: 'Our Bhutan experience was seamless from beginning to end. The guides were incredibly thoughtful and knowledgeable.',
    rating: 5,
    image: '',
  },
  {
    name: 'Saraaaaaaaa',
    location: 'Tripadvisor',
    text: 'The team made our Bhutan trip effortless and memorable. Highly recommended for anyone seeking authentic Bhutan experiences.',
    rating: 5,
    image: '',
  },
]
