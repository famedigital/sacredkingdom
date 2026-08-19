import { createAdminClient, createPublicClient } from '@/utils/supabase/admin'
import {
  DEFAULT_COMPANY_NAME,
  DEFAULT_COMPANY_TAGLINE,
  normalizeCompanyName,
} from '@/lib/brand-defaults'
import {
  DEFAULT_BRAND_LOGO_SETTINGS,
  normalizeBrandLogoSettings,
  type BrandLogoSettings,
} from '@/lib/brand-logo'
import {
  DEFAULT_MOBILE_NAV_SETTINGS,
  normalizeMobileNavSettings,
  type MobileNavSettings,
} from '@/lib/mobile-nav'

export {
  DEFAULT_COMPANY_NAME,
  DEFAULT_COMPANY_TAGLINE,
  normalizeCompanyName,
} from '@/lib/brand-defaults'

export type { BrandLogoSettings }
export { DEFAULT_BRAND_LOGO_SETTINGS, normalizeBrandLogoSettings } from '@/lib/brand-logo'
export type { MobileNavSettings }
export { DEFAULT_MOBILE_NAV_SETTINGS, normalizeMobileNavSettings } from '@/lib/mobile-nav'

function asCleanName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  return t || null
}

function nameFromSeoBlob(raw: unknown): string | null {
  if (!raw) return null
  let obj: Record<string, unknown> | null = null
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    obj = raw as Record<string, unknown>
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') obj = parsed as Record<string, unknown>
    } catch {
      return null
    }
  }
  if (!obj) return null
  return asCleanName(obj.site_name)
}

/**
 * Company / brand name from CRM:
 * Admin → SEO & Site Settings → Company name
 * (seo_settings.site_name, mirrored to flat site_name)
 *
 * Uses a server-side public client (no next/headers) so this is safe from
 * App Route / Server Component code without pulling cookies into clients.
 */
export async function getCompanyName(): Promise<string> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_name', 'seo_settings'])

    const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]))

    const raw =
      asCleanName(map.site_name) ||
      nameFromSeoBlob(map.seo_settings) ||
      DEFAULT_COMPANY_NAME

    const normalized = normalizeCompanyName(raw)

    // One-time upgrade: rewrite legacy CRM company name so admin + public stay in sync
    if (raw !== normalized && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      void upgradeStoredCompanyName(createAdminClient(), map.seo_settings, normalized).catch((err) =>
        console.error('[getCompanyName] upgrade failed', err)
      )
    }

    return normalized
  } catch (err) {
    console.error('[getCompanyName]', err)
    return DEFAULT_COMPANY_NAME
  }
}

async function upgradeStoredCompanyName(
  supabase: ReturnType<typeof createAdminClient>,
  seoRaw: unknown,
  companyName: string
) {
  const now = new Date().toISOString()

  const { data: existingName } = await supabase
    .from('site_settings')
    .select('id')
    .eq('key', 'site_name')
    .maybeSingle()

  if (existingName?.id) {
    await supabase
      .from('site_settings')
      .update({ value: companyName, updated_at: now })
      .eq('key', 'site_name')
  } else {
    await supabase.from('site_settings').insert({
      key: 'site_name',
      value: companyName,
      category: 'general',
      description: 'Company / site name shown across the public site and CRM',
      is_public: true,
    })
  }

  let seoBlob: Record<string, unknown> | null = null
  if (seoRaw && typeof seoRaw === 'object' && !Array.isArray(seoRaw)) {
    seoBlob = { ...(seoRaw as Record<string, unknown>), site_name: companyName }
  } else if (typeof seoRaw === 'string') {
    try {
      const parsed = JSON.parse(seoRaw)
      if (parsed && typeof parsed === 'object') {
        seoBlob = { ...parsed, site_name: companyName }
      }
    } catch {
      /* ignore */
    }
  }

  if (seoBlob) {
    await supabase
      .from('site_settings')
      .update({ value: seoBlob, updated_at: now })
      .eq('key', 'seo_settings')
  }
}

export async function getCompanyTagline(): Promise<string> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_tagline', 'seo_settings'])

    const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]))
    const flat = asCleanName(map.site_tagline)
    if (flat) return flat

    const blob = map.seo_settings
    if (blob && typeof blob === 'object' && !Array.isArray(blob)) {
      const t = asCleanName((blob as Record<string, unknown>).site_tagline)
      if (t) return t
    }
    return DEFAULT_COMPANY_TAGLINE
  } catch {
    return DEFAULT_COMPANY_TAGLINE
  }
}

export type BrandInfo = {
  name: string
  tagline: string
  logo: BrandLogoSettings
  mobileNav: MobileNavSettings
}

export async function getBrandLogoSettings(): Promise<BrandLogoSettings> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'brand_logo')
      .maybeSingle()

    if (!data?.value) return { ...DEFAULT_BRAND_LOGO_SETTINGS }
    return normalizeBrandLogoSettings(data.value)
  } catch (err) {
    console.error('[getBrandLogoSettings]', err)
    return { ...DEFAULT_BRAND_LOGO_SETTINGS }
  }
}

export async function getMobileNavSettings(): Promise<MobileNavSettings> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'mobile_nav')
      .maybeSingle()

    if (!data?.value) return { ...DEFAULT_MOBILE_NAV_SETTINGS }
    return normalizeMobileNavSettings(data.value)
  } catch (err) {
    console.error('[getMobileNavSettings]', err)
    return { ...DEFAULT_MOBILE_NAV_SETTINGS }
  }
}

export async function getBrand(): Promise<BrandInfo> {
  const [name, tagline, logo, mobileNav] = await Promise.all([
    getCompanyName(),
    getCompanyTagline(),
    getBrandLogoSettings(),
    getMobileNavSettings(),
  ])
  return { name, tagline, logo, mobileNav }
}
