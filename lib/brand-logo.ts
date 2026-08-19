/** Shared Cloudinary brand logo URLs + nav backdrop (standout plate). */

import type { CSSProperties } from 'react'
import { optimizeCloudinaryUrl } from '@/lib/cloudinary-url'

export const BRAND_LOGO_CLOUD_NAME = 'hqxti5zm'
export const BRAND_LOGO_VERSION = ''
export const BRAND_LOGO_PUBLIC_ID = 'sacred-himalaya/logo'

/** Local 3D cloud-mountain icon — default when CRM has no custom upload. */
export const DEFAULT_BRAND_LOGO_SRC = '/brand/icon-3d-deep-blue.png'

/** Icon-only PNG (width / height). */
export const BRAND_LOGO_ASPECT = 963 / 687

export const DEFAULT_NAV_LOGO_HEIGHT = 96
export const DEFAULT_LOGO_OFFSET_X = 0
export const DEFAULT_LOGO_OFFSET_Y = 0

export type BrandLogoGlowShape = 'circle' | 'oval' | 'rounded' | 'pill' | 'square'
export type BrandLogoBgMode = 'solid' | 'gradient'

export type BrandLogoSettings = {
  url: string
  publicId: string
  height: number
  offsetX: number
  offsetY: number

  /** Master switch for the standout plate behind the nav logo. */
  glowEnabled: boolean
  glowShape: BrandLogoGlowShape

  /** Solid plate color — main tool so the logo reads over hero photos. */
  bgColor: string
  /** Solid plate opacity 0–100. */
  bgOpacity: number
  /** solid = flat color plate; gradient = soft LED wash. */
  bgMode: BrandLogoBgMode

  /** Gradient colors (used when bgMode = gradient, and for outer glow tint). */
  glowColor: string
  glowColorEnd: string
  glowGradientSpread: number
  glowIntensity: number

  /** Extra padding around the logo inside the shape (px). */
  backdropPadding: number
  /** Corner radius for "rounded" shape (px). */
  backdropRadius: number

  /** Position of the plate vs logo center. */
  glowOffsetX: number
  glowOffsetY: number

  /** Photoshop-style outer glow. */
  outerGlowEnabled: boolean
  outerGlowColor: string
  outerGlowSize: number
  outerGlowIntensity: number

  /** Photoshop-style drop shadow. */
  shadowEnabled: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  shadowOpacity: number

  /** Soft pulse on the plate (LED feel). */
  pulseEnabled: boolean
}

export const DEFAULT_BRAND_LOGO_SETTINGS: BrandLogoSettings = {
  url: DEFAULT_BRAND_LOGO_SRC,
  publicId: '',
  height: DEFAULT_NAV_LOGO_HEIGHT,
  offsetX: DEFAULT_LOGO_OFFSET_X,
  offsetY: DEFAULT_LOGO_OFFSET_Y,
  glowEnabled: false,
  glowShape: 'oval',
  bgColor: '#ffffff',
  bgOpacity: 92,
  bgMode: 'solid',
  glowColor: '#fff6e0',
  glowColorEnd: '#c4a35a',
  glowGradientSpread: 55,
  glowIntensity: 70,
  backdropPadding: 16,
  backdropRadius: 16,
  glowOffsetX: 0,
  glowOffsetY: 0,
  outerGlowEnabled: true,
  outerGlowColor: '#c4a35a',
  outerGlowSize: 22,
  outerGlowIntensity: 55,
  shadowEnabled: true,
  shadowColor: '#0c1222',
  shadowBlur: 18,
  shadowOffsetX: 0,
  shadowOffsetY: 8,
  shadowOpacity: 40,
  pulseEnabled: false,
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asHexColor(value: unknown, fallback: string): string {
  const raw = asString(value)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) return raw
  return fallback
}

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function asGlowShape(value: unknown): BrandLogoGlowShape {
  if (value === 'circle' || value === 'oval' || value === 'rounded' || value === 'pill' || value === 'square') {
    return value
  }
  return 'oval'
}

function asBgMode(value: unknown): BrandLogoBgMode {
  return value === 'gradient' ? 'gradient' : 'solid'
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

/** Normalize a CRM / site_settings blob into BrandLogoSettings. */
export function normalizeBrandLogoSettings(raw: unknown): BrandLogoSettings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_BRAND_LOGO_SETTINGS }
  }
  const obj = raw as Record<string, unknown>
  const d = DEFAULT_BRAND_LOGO_SETTINGS
  const urlRaw = asString(obj.url ?? obj.logoUrl ?? obj.logo_url)
  const url = !urlRaw || isLegacyCloudinaryLogo(urlRaw) ? d.url : urlRaw

  return {
    url,
    publicId: url === d.url ? '' : asString(obj.publicId ?? obj.public_id),
    height: clamp(asNumber(obj.height ?? obj.navHeight, d.height), 24, 200),
    offsetX: clamp(asNumber(obj.offsetX ?? obj.horizontal, d.offsetX), -200, 200),
    offsetY: clamp(asNumber(obj.offsetY ?? obj.vertical, d.offsetY), -200, 200),
    glowEnabled: asBool(obj.glowEnabled, d.glowEnabled),
    glowShape: asGlowShape(obj.glowShape ?? obj.shape),
    bgColor: asHexColor(obj.bgColor ?? obj.fillColor ?? obj.glowColor, d.bgColor),
    bgOpacity: clamp(asNumber(obj.bgOpacity ?? obj.fillOpacity, d.bgOpacity), 0, 100),
    bgMode: asBgMode(obj.bgMode ?? obj.fillMode),
    glowColor: asHexColor(obj.glowColor ?? obj.ledColor, d.glowColor),
    glowColorEnd: asHexColor(obj.glowColorEnd ?? obj.glowGradientEnd, d.glowColorEnd),
    glowGradientSpread: clamp(asNumber(obj.glowGradientSpread ?? obj.gradientSpread, d.glowGradientSpread), 0, 100),
    glowIntensity: clamp(asNumber(obj.glowIntensity ?? obj.ledIntensity, d.glowIntensity), 0, 100),
    backdropPadding: clamp(asNumber(obj.backdropPadding ?? obj.padding, d.backdropPadding), 0, 64),
    backdropRadius: clamp(asNumber(obj.backdropRadius ?? obj.radius, d.backdropRadius), 0, 80),
    glowOffsetX: clamp(asNumber(obj.glowOffsetX ?? obj.ledOffsetX, d.glowOffsetX), -120, 120),
    glowOffsetY: clamp(asNumber(obj.glowOffsetY ?? obj.ledOffsetY, d.glowOffsetY), -120, 120),
    outerGlowEnabled: asBool(obj.outerGlowEnabled, d.outerGlowEnabled),
    outerGlowColor: asHexColor(obj.outerGlowColor, d.outerGlowColor),
    outerGlowSize: clamp(asNumber(obj.outerGlowSize, d.outerGlowSize), 0, 80),
    outerGlowIntensity: clamp(asNumber(obj.outerGlowIntensity, d.outerGlowIntensity), 0, 100),
    shadowEnabled: asBool(obj.shadowEnabled, d.shadowEnabled),
    shadowColor: asHexColor(obj.shadowColor, d.shadowColor),
    shadowBlur: clamp(asNumber(obj.shadowBlur, d.shadowBlur), 0, 60),
    shadowOffsetX: clamp(asNumber(obj.shadowOffsetX, d.shadowOffsetX), -40, 40),
    shadowOffsetY: clamp(asNumber(obj.shadowOffsetY, d.shadowOffsetY), -40, 40),
    shadowOpacity: clamp(asNumber(obj.shadowOpacity, d.shadowOpacity), 0, 100),
    pulseEnabled: asBool(obj.pulseEnabled, d.pulseEnabled),
  }
}

export function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (!Number.isFinite(n)) return `rgba(255, 255, 255, ${alpha})`
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

function shapeMetrics(settings: BrandLogoSettings): {
  width: number
  height: number
  borderRadius: string
} {
  const h = settings.height
  const pad = settings.backdropPadding
  const plateH = h + pad * 2
  const logoW = h * BRAND_LOGO_ASPECT
  const plateW = logoW + pad * 2

  switch (settings.glowShape) {
    case 'circle': {
      const size = Math.max(plateH, plateW) * 1.02
      return { width: size, height: size, borderRadius: '50%' }
    }
    case 'oval':
      return { width: plateW * 1.08, height: plateH * 1.05, borderRadius: '50%' }
    case 'pill':
      return { width: plateW, height: plateH, borderRadius: '9999px' }
    case 'square': {
      const size = Math.max(plateH, plateW)
      return { width: size, height: size, borderRadius: '0px' }
    }
    case 'rounded':
    default:
      return {
        width: plateW,
        height: plateH,
        borderRadius: `${settings.backdropRadius}px`,
      }
  }
}

function plateBackground(settings: BrandLogoSettings): string {
  if (settings.bgMode === 'gradient') {
    const t = settings.glowIntensity / 100
    const spread = settings.glowGradientSpread / 100
    const midStop = Math.round(18 + 28 * (1 - spread))
    const edgeStop = Math.round(40 + 35 * spread)
    const fadeStop = Math.round(Math.min(98, edgeStop + 18 + 20 * spread))
    const center = settings.glowColor
    const edge = settings.glowColorEnd
    // Keep a solid-ish core so the logo still has a reading plate
    return [
      `radial-gradient(ellipse at center,`,
      `${hexToRgba(center, Math.max(0.75, 0.95 * t))} 0%,`,
      `${hexToRgba(center, 0.85 * t)} ${midStop}%,`,
      `${hexToRgba(edge, 0.65 * t)} ${edgeStop}%,`,
      `${hexToRgba(edge, 0.15 * t)} ${fadeStop}%`,
      `)`,
    ].join(' ')
  }

  return hexToRgba(settings.bgColor, settings.bgOpacity / 100)
}

function plateBoxShadow(settings: BrandLogoSettings): string {
  const parts: string[] = []

  if (settings.outerGlowEnabled && settings.outerGlowIntensity > 0 && settings.outerGlowSize > 0) {
    const g = settings.outerGlowIntensity / 100
    const size = settings.outerGlowSize
    const c = settings.outerGlowColor
    parts.push(`0 0 ${Math.round(size * 0.45)}px ${hexToRgba(c, 0.95 * g)}`)
    parts.push(`0 0 ${size}px ${hexToRgba(c, 0.65 * g)}`)
    parts.push(`0 0 ${Math.round(size * 1.7)}px ${hexToRgba(c, 0.35 * g)}`)
  }

  if (settings.shadowEnabled && settings.shadowOpacity > 0) {
    const a = settings.shadowOpacity / 100
    parts.push(
      `${settings.shadowOffsetX}px ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${hexToRgba(settings.shadowColor, a)}`
    )
  }

  // Subtle edge so solid plates read on light heroes too
  if (settings.bgMode === 'solid' && settings.bgOpacity > 40) {
    parts.push(`inset 0 0 0 1px ${hexToRgba('#ffffff', 0.35)}`)
  }

  return parts.join(', ')
}

/**
 * CSS for the standout plate behind the logo.
 * Independent of nav solid/transparent styling.
 */
export function brandLogoGlowStyle(settings: BrandLogoSettings): CSSProperties | null {
  if (!settings.glowEnabled) return null

  const { width, height, borderRadius } = shapeMetrics(settings)

  return {
    width,
    height,
    borderRadius,
    background: plateBackground(settings),
    boxShadow: plateBoxShadow(settings) || undefined,
  }
}

/** @deprecated alias — same as brandLogoGlowStyle */
export const brandLogoBackdropStyle = brandLogoGlowStyle

export function brandLogoUrl(displayHeightPx: number, dpr = 2): string {
  const h = Math.max(1, Math.round(displayHeightPx * dpr))
  const transform = [`c_fit`, `h_${h}`, `q_auto:best`, `f_png`, `e_sharpen:50`].join(',')
  const version = BRAND_LOGO_VERSION ? `${BRAND_LOGO_VERSION}/` : ''
  return `https://res.cloudinary.com/${BRAND_LOGO_CLOUD_NAME}/image/upload/${transform}/${version}${BRAND_LOGO_PUBLIC_ID}.png`
}

export function brandLogoSrcSet(displayHeightPx: number): string {
  return [1, 2, 3]
    .map((dpr) => `${brandLogoUrl(displayHeightPx, dpr)} ${dpr}x`)
    .join(', ')
}

function isLegacyCloudinaryLogo(url: string) {
  return (
    url.includes('sacred-himalaya/logo') ||
    url.includes('wangchuk') ||
    url.includes('logo-3d-jewelry') ||
    url.includes('logo-3d-quiet') ||
    url.includes('logo-3d-transparent') ||
    url.includes('logo-3d-luxury') ||
    url.includes('logo-3d-ivory') ||
    url.includes('logo-3d-burgundy') ||
    url.endsWith('/brand/logo-3d.png')
  )
}

export function isLegacyBrandLogoUrl(url?: string | null): boolean {
  return isLegacyCloudinaryLogo(String(url || ''))
}

/** Height the public header actually paints (desktop lockup). */
export function publicNavMarkHeight(storedHeight: number): number {
  return Math.max(Math.min(storedHeight || DEFAULT_NAV_LOGO_HEIGHT, 88), 72)
}

export function resolveBrandLogoSrc(
  settings: Pick<BrandLogoSettings, 'url'> | null | undefined,
  displayHeightPx: number,
  dpr = 2
): string {
  const custom = settings?.url?.trim()
  if (!custom || isLegacyCloudinaryLogo(custom)) return DEFAULT_BRAND_LOGO_SRC

  if (custom.includes('res.cloudinary.com')) {
    const h = Math.max(1, Math.round(displayHeightPx * dpr))
    return optimizeCloudinaryUrl(custom, { height: h, crop: 'fit' }) || custom
  }
  return custom
}

export function resolveBrandLogoSrcSet(
  settings: Pick<BrandLogoSettings, 'url'> | null | undefined,
  displayHeightPx: number
): string | undefined {
  const custom = settings?.url?.trim()
  if (!custom || isLegacyCloudinaryLogo(custom)) return undefined
  if (!custom.includes('res.cloudinary.com')) return undefined
  return [1, 2, 3]
    .map((dpr) => `${resolveBrandLogoSrc(settings, displayHeightPx, dpr)} ${dpr}x`)
    .join(', ')
}
