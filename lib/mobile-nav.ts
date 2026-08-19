/** Mobile navigation style from CRM (Admin → Mobile menu). */

export type MobileNavStyle = 'footer' | 'top'

export type MobileNavSettings = {
  /** footer = app-style bottom bar; top = burger + logo header */
  style: MobileNavStyle
  /** Show company name beside the logo (top style). */
  showCompanyName: boolean
  /** Mobile top-bar logo height (px). */
  logoHeight: number
  /** Logo left/right offset in top bar (px). */
  logoOffsetX: number
  /** Logo up/down offset in top bar (px). */
  logoOffsetY: number
}

export const DEFAULT_MOBILE_NAV_SETTINGS: MobileNavSettings = {
  style: 'footer',
  showCompanyName: true,
  logoHeight: 64,
  logoOffsetX: 0,
  logoOffsetY: 0,
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function asStyle(value: unknown): MobileNavStyle {
  return value === 'top' ? 'top' : 'footer'
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function normalizeMobileNavSettings(raw: unknown): MobileNavSettings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_MOBILE_NAV_SETTINGS }
  }
  const obj = raw as Record<string, unknown>
  const d = DEFAULT_MOBILE_NAV_SETTINGS
  return {
    style: asStyle(obj.style ?? obj.mobileNavStyle ?? obj.mode),
    showCompanyName: asBool(obj.showCompanyName ?? obj.showName, d.showCompanyName),
    logoHeight: clamp(asNumber(obj.logoHeight ?? obj.height, d.logoHeight), 24, 80),
    logoOffsetX: clamp(asNumber(obj.logoOffsetX ?? obj.offsetX, d.logoOffsetX), -80, 80),
    logoOffsetY: clamp(asNumber(obj.logoOffsetY ?? obj.offsetY, d.logoOffsetY), -40, 40),
  }
}
