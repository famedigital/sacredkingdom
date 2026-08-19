/** Shared option lists for the admin tour form and public display. */

export const TOUR_LOCATIONS = [
  'Thimphu',
  'Paro',
  'Punakha',
  'Wangdue',
  'Phobjkha',
  'Bumthang',
  'Phuntsholing',
] as const;

export const MEAL_OPTIONS = [
  { value: 'Breakfast only', label: 'Breakfast only' },
  { value: 'Breakfast and dinner', label: 'Breakfast and dinner' },
  { value: 'All meals', label: 'All meals' },
] as const;

export const ACCOMMODATION_OPTIONS = [
  { value: '3 Star', label: '3 Star' },
  { value: '4 Star', label: '4 Star' },
  { value: '5 Star', label: '5 Star' },
] as const;

export const TOUR_INCLUSION_OPTIONS = [
  'SDF',
  'Rooms',
  'Breakfast & dinner',
  'All meals',
  'International flight',
  'Domestic flights',
  'Guides',
  'Cars',
  'Drop & pickup',
] as const;

export const TOUR_HIGHLIGHT_OPTIONS = [
  "Visit Tiger's Nest Monastery",
  'Explore Punakha Dzong',
  'Experience Thimphu capital city',
  'Dochula Pass viewpoints',
  'Phobjkha Valley & black-necked cranes',
  'Bumthang temples & heritage',
  'Traditional Bhutanese cuisine',
  'Hot stone bath experience',
  'Archery & local games',
  'Meet local artisans',
  'Farmers market visit',
  'Scenic Himalayan views',
  'Cultural festival experience',
  'Paro valley exploration',
  'Wangdue riverside & villages',
  'Phuntsholing border town',
] as const;

export type TourCurrency = 'USD' | 'INR';

/** International → USD, Regional → INR */
export function getCurrencyForCategory(category?: string | null): TourCurrency {
  const c = (category || '').toLowerCase().trim();
  if (c === 'regional' || c.startsWith('regional') || c.includes('regional')) {
    return 'INR';
  }
  return 'USD';
}

export function currencySymbol(currency: TourCurrency): string {
  return currency === 'INR' ? '₹' : '$';
}

export function formatTourPrice(
  price: number | string | null | undefined,
  categoryOrCurrency?: string | null
): string {
  if (price === null || price === undefined || price === '' || Number(price) <= 0) {
    return 'Contact us';
  }
  const currency: TourCurrency =
    categoryOrCurrency === 'USD' || categoryOrCurrency === 'INR'
      ? categoryOrCurrency
      : getCurrencyForCategory(categoryOrCurrency);
  const amount = Number(price).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
  return `${currencySymbol(currency)}${amount}`;
}

/** Sentinel stored in meta_keywords when the show_price column is unavailable. */
export const HIDE_PRICE_KEYWORD = '__hide_price__';

/** Public pages: hide price when show_price is false (or hide-keyword is set). */
export function isTourPriceVisible(tour: {
  show_price?: boolean | null;
  price?: number | string | null;
  meta_keywords?: string[] | null;
}): boolean {
  if (tour.show_price === false) return false;
  if (Array.isArray(tour.meta_keywords) && tour.meta_keywords.includes(HIDE_PRICE_KEYWORD)) {
    return false;
  }
  const price = Number(tour.price);
  return Number.isFinite(price) && price > 0;
}

export function readShowPrice(tour?: {
  show_price?: boolean | null;
  meta_keywords?: string[] | null;
} | null): boolean {
  if (!tour) return true;
  if (typeof tour.show_price === 'boolean') return tour.show_price;
  if (Array.isArray(tour.meta_keywords) && tour.meta_keywords.includes(HIDE_PRICE_KEYWORD)) {
    return false;
  }
  return true;
}

export function syncShowPriceKeywords(
  keywords: string[] | null | undefined,
  showPrice: boolean
): string[] {
  const base = (keywords || []).filter((k) => k !== HIDE_PRICE_KEYWORD);
  return showPrice ? base : [...base, HIDE_PRICE_KEYWORD];
}

export type TourLocation = (typeof TOUR_LOCATIONS)[number];
export type MealOption = (typeof MEAL_OPTIONS)[number]['value'];
export type AccommodationOption = (typeof ACCOMMODATION_OPTIONS)[number]['value'];
export type TourInclusionOption = (typeof TOUR_INCLUSION_OPTIONS)[number];
export type TourHighlightOption = (typeof TOUR_HIGHLIGHT_OPTIONS)[number];

export type ItineraryDay = {
  day: number;
  title: string;
  location: string;
  description: string;
  meals: string;
  accommodation: string;
  activities?: string[];
};

export function createEmptyItineraryDay(dayNumber: number): ItineraryDay {
  return {
    day: dayNumber,
    title: '',
    location: '',
    description: '',
    meals: '',
    accommodation: '',
  };
}
