import { NextResponse } from 'next/server'
import { getBrand } from '@/lib/brand'

export const dynamic = 'force-dynamic'

/** Public brand/company name from CRM (SEO Site Name). */
export async function GET() {
  try {
    const brand = await getBrand()
    return NextResponse.json(brand, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    })
  } catch (error) {
    console.error('Brand API error:', error)
    const { DEFAULT_COMPANY_NAME, DEFAULT_COMPANY_TAGLINE } = await import('@/lib/brand')
    const { DEFAULT_BRAND_LOGO_SETTINGS } = await import('@/lib/brand-logo')
    const { DEFAULT_MOBILE_NAV_SETTINGS } = await import('@/lib/mobile-nav')
    return NextResponse.json({
      name: DEFAULT_COMPANY_NAME,
      tagline: DEFAULT_COMPANY_TAGLINE,
      logo: DEFAULT_BRAND_LOGO_SETTINGS,
      mobileNav: DEFAULT_MOBILE_NAV_SETTINGS,
    })
  }
}
