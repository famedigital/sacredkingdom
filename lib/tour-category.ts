/** Normalize tour category keys for filtering / currency (handles renamed slugs). */

export const DEFAULT_TOUR_CATEGORIES = [
  { id: 'cultural', name: 'Cultural Trip', slug: 'cultural', sort_order: 0, is_active: true },
  { id: 'festivals', name: 'Festival Tour', slug: 'festivals', sort_order: 1, is_active: true },
  { id: 'trekking', name: 'Trekking', slug: 'trekking', sort_order: 2, is_active: true },
  { id: 'wildlife', name: 'Wildlife', slug: 'wildlife', sort_order: 3, is_active: true },
] as const

export type DefaultTourCategory = (typeof DEFAULT_TOUR_CATEGORIES)[number]

export function normalizeCategoryKey(value?: string | null): string {
  const raw = (value || '').toLowerCase().trim()
  if (!raw) return ''

  if (raw === 'regional' || raw.startsWith('regional') || raw.includes('regional')) {
    return 'regional'
  }
  if (
    raw === 'international' ||
    raw.startsWith('international') ||
    raw.includes('international')
  ) {
    return 'international'
  }

  if (raw.includes('wildlife') || raw.includes('wild-life') || raw.includes('wild life')) {
    return 'wildlife'
  }
  if (raw.includes('heritage') || raw.includes('culture') || raw === 'cultural') {
    return 'cultural'
  }
  if (raw.includes('festival')) return 'festivals'
  if (raw.includes('trek') || raw.includes('hik')) return 'trekking'
  if (raw.includes('relax') || raw.includes('spa') || raw.includes('wellness')) return 'relaxation'
  if (raw.includes('nature')) return 'wildlife'

  return raw
}

export function categoryDisplayName(value?: string | null): string {
  const key = normalizeCategoryKey(value)
  const found = DEFAULT_TOUR_CATEGORIES.find((c) => c.slug === key)
  if (found) return found.name
  if (key === 'relaxation') return 'Wellness'
  if (key === 'international') return 'International'
  if (key === 'regional') return 'Regional'
  return value || 'Trip'
}

export function categoryMatches(
  tourCategory: string | null | undefined,
  selectedCategory: string
): boolean {
  if (!selectedCategory || selectedCategory === 'all') return true
  const tourKey = normalizeCategoryKey(tourCategory)
  const selectedKey = normalizeCategoryKey(selectedCategory)
  if (!tourKey || !selectedKey) return false
  return tourKey === selectedKey || tourCategory === selectedCategory
}
