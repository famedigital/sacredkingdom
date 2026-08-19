const LEGACY_BRAND_COLORS = new Set(
  ['#7eb8c9', '#1f6f8b', '#0a2744', '#0e1a24', '#f4f8fb', '#3d8eaa'].map((c) => c.toLowerCase())
)

/**
 * Sanitize a CSS color for safe inline styles (hero title, etc.).
 * Allows hex and simple rgb/rgba only.
 */
export function sanitizeCssColor(value?: string | null, fallback = '#E8D5A3'): string {
  const raw = String(value || '').trim()
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) {
    if (LEGACY_BRAND_COLORS.has(raw.toLowerCase())) return fallback
    return raw
  }
  if (/^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(,\s*[\d.]+\s*)?\)$/.test(raw)) return raw
  if (fallback === 'inherit') return 'inherit'
  return fallback
}

/** Champagne gold — readable on dark hero overlays */
export const DEFAULT_HERO_TITLE_COLOR = '#E8D5A3'

/** Charcoal — readable on light homepage section backgrounds */
export const DEFAULT_SECTION_TITLE_COLOR = '#161616'

export const HERO_TITLE_COLOR_PRESETS = [
  { label: 'Champagne', value: '#E8D5A3' },
  { label: 'White', value: '#ffffff' },
  { label: 'Antique gold', value: '#C4A35A' },
  { label: 'Ivory', value: '#F4F1EA' },
  { label: 'Charcoal', value: '#161616' },
] as const

export const SECTION_TITLE_COLOR_PRESETS = [
  { label: 'Charcoal', value: '#161616' },
  { label: 'Antique gold', value: '#C4A35A' },
  { label: 'Near black', value: '#111111' },
  { label: 'Champagne', value: '#E8D5A3' },
  { label: 'Stone', value: '#6B675F' },
] as const
