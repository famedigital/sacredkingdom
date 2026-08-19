/** Public palettes + homepage layout templates (admin Appearance). */

export const PALETTE_IDS = [
  'gold-sanctuary',
  'noir-gold',
  'ivory-court',
  'stone-sage',
  'heritage-navy',
] as const

export type PaletteId = (typeof PALETTE_IDS)[number]

export const LAYOUT_IDS = ['magazine', 'gallery', 'club'] as const
export type LayoutId = (typeof LAYOUT_IDS)[number]

export const DEFAULT_PALETTE: PaletteId = 'gold-sanctuary'
export const DEFAULT_LAYOUT: LayoutId = 'magazine'

export type PaletteSwatch = {
  id: PaletteId
  name: string
  description: string
  preview: [string, string, string]
}

export const PALETTES: PaletteSwatch[] = [
  {
    id: 'gold-sanctuary',
    name: 'Gold Sanctuary',
    description: 'Metallic gold on ivory paper — the 3D lockup.',
    preview: ['#0A0A0A', '#C4A35A', '#F4F1EA'],
  },
  {
    id: 'noir-gold',
    name: 'Noir Gold',
    description: 'Black surfaces, gold type, night-club luxury.',
    preview: ['#0A0A0A', '#C4A35A', '#1A1A1A'],
  },
  {
    id: 'ivory-court',
    name: 'Ivory Court',
    description: 'Warmer paper, richer brass.',
    preview: ['#14110C', '#B8953A', '#F6EDD9'],
  },
  {
    id: 'stone-sage',
    name: 'Stone Sage',
    description: 'Cool gray stone with muted gold.',
    preview: ['#1F2420', '#A89B6E', '#EEF0EC'],
  },
  {
    id: 'heritage-navy',
    name: 'Heritage Navy',
    description: 'Legacy navy and azure — optional only.',
    preview: ['#0A2744', '#1F6F8B', '#F4F8FB'],
  },
]

export const LAYOUTS: { id: LayoutId; name: string; description: string }[] = [
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Inset gallery hero, quotes, destinations, then packages.',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image-first hero, destinations before packages.',
  },
  {
    id: 'club',
    name: 'Club',
    description: 'Centered type, fewer sections, darker emphasis.',
  },
]

export function parsePaletteId(value?: string | null): PaletteId {
  const raw = String(value || '').trim()
  return PALETTE_IDS.includes(raw as PaletteId) ? (raw as PaletteId) : DEFAULT_PALETTE
}

export function parseLayoutId(value?: string | null): LayoutId {
  const raw = String(value || '').trim()
  return LAYOUT_IDS.includes(raw as LayoutId) ? (raw as LayoutId) : DEFAULT_LAYOUT
}

export type AppearanceSettings = {
  palette: PaletteId
  layout: LayoutId
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  palette: DEFAULT_PALETTE,
  layout: DEFAULT_LAYOUT,
}

function settingToString(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'value' in value) {
    const inner = (value as { value?: unknown }).value
    if (typeof inner === 'string') return inner
  }
  return null
}

export async function getAppearance(): Promise<AppearanceSettings> {
  try {
    const { createPublicClient } = await import('@/utils/supabase/admin')
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['public_palette', 'public_layout'])

    const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]))
    return {
      palette: parsePaletteId(settingToString(map.public_palette)),
      layout: parseLayoutId(settingToString(map.public_layout)),
    }
  } catch {
    return DEFAULT_APPEARANCE
  }
}
