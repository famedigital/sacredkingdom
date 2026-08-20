/** Client-facing quote: three lines only. Transfers sit inside the package. */

export const PACKAGE_LABEL = 'Guide + entry + car + drop'
export const HOTEL_LABEL = 'Hotel'
export const SDF_LABEL = 'SDF'

/** Pickup + drop (₹5,000 each) is folded into the package. Never show as own lines. */
export const TRANSFER_INCLUDED_INR = 10_000

export const QUOTE_NOTE_PREFIX = 'Quote:'

export type QuoteCurrency = 'INR' | 'USD'

export type ClientQuote = {
  currency: QuoteCurrency
  package: number
  hotel: number
  sdf: number
}

export function emptyClientQuote(currency: QuoteCurrency = 'INR'): ClientQuote {
  return { currency, package: 0, hotel: 0, sdf: 0 }
}

export function quoteHasAmounts(quote: ClientQuote | null | undefined): boolean {
  if (!quote) return false
  return quote.package > 0 || quote.hotel > 0 || quote.sdf > 0
}

export function quoteLines(quote: ClientQuote) {
  return [
    { label: PACKAGE_LABEL, amount: quote.package },
    { label: HOTEL_LABEL, amount: quote.hotel },
    { label: SDF_LABEL, amount: quote.sdf },
  ]
}

export function quoteTotal(quote: ClientQuote) {
  return (Number(quote.package) || 0) + (Number(quote.hotel) || 0) + (Number(quote.sdf) || 0)
}

export function formatQuoteMoney(amount: number, currency: QuoteCurrency) {
  const n = Number(amount) || 0
  const formatted = n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return currency === 'INR' ? `₹${formatted}` : `$${formatted}`
}

export function parseQuoteFromNotes(notes?: string | null): ClientQuote | null {
  const match = String(notes || '').match(/^Quote:\s*(\{.*\})\s*$/m)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1]) as Partial<ClientQuote>
    const currency: QuoteCurrency = parsed.currency === 'USD' ? 'USD' : 'INR'
    return {
      currency,
      package: Number(parsed.package) || 0,
      hotel: Number(parsed.hotel) || 0,
      sdf: Number(parsed.sdf) || 0,
    }
  } catch {
    return null
  }
}

export function stripQuoteFromNotes(notes?: string | null) {
  return String(notes || '')
    .replace(/^Quote:\s*\{.*\}\s*$/m, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function writeQuoteIntoNotes(notes: string | null | undefined, quote: ClientQuote) {
  const rest = stripQuoteFromNotes(notes)
  if (!quoteHasAmounts(quote)) return rest
  const line = `${QUOTE_NOTE_PREFIX} ${JSON.stringify({
    currency: quote.currency,
    package: Number(quote.package) || 0,
    hotel: Number(quote.hotel) || 0,
    sdf: Number(quote.sdf) || 0,
  })}`
  return rest ? `${rest}\n${line}` : line
}

export function normalizeTourInclusions(items: string[]): string[] {
  const next = new Set(items.filter(Boolean))
  const legacyBits = ['Guides', 'Cars', 'Drop & pickup']
  if (legacyBits.some((bit) => next.has(bit))) {
    legacyBits.forEach((bit) => next.delete(bit))
    next.add(PACKAGE_LABEL)
  }
  if (next.has('Rooms')) {
    next.delete('Rooms')
    next.add(HOTEL_LABEL)
  }
  return [...next]
}
