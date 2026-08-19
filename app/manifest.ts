import type { MetadataRoute } from 'next'
import { DEFAULT_COMPANY_NAME } from '@/lib/brand-defaults'
import { SITE_DESCRIPTION } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEFAULT_COMPANY_NAME,
    short_name: 'Sacred Kingdom',
    description: SITE_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0A2744',
    theme_color: '#0A2744',
    lang: 'en',
    dir: 'ltr',
    categories: ['travel', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-192.png?v=4',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png?v=4',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png?v=4',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
