/** Booking operations, documents, and share-link types */

export type HotelStay = {
  name: string
  location?: string
  check_in?: string
  check_out?: string
  room_type?: string
  confirmation_no?: string
  notes?: string
}

export type BookingOperations = {
  id?: string
  booking_id: string
  guide_id?: string | null
  vehicle_id?: string | null
  source_id?: string | null
  guide_name?: string | null
  guide_phone?: string | null
  guide_email?: string | null
  guide_notes?: string | null
  driver_name?: string | null
  driver_phone?: string | null
  driver_email?: string | null
  driver_notes?: string | null
  hotels: HotelStay[]
  internal_notes?: string | null
  created_at?: string
  updated_at?: string
}

export type BookingDocType = 'room_voucher' | 'sdf' | 'invoice' | 'payment' | 'other' | 'passport' | 'permit' | 'voucher'

export const BOOKING_DOC_TYPE_LABELS: Record<BookingDocType, string> = {
  room_voucher: 'Room voucher',
  sdf: 'SDF / permit paper',
  invoice: 'Invoice',
  payment: 'Payment proof',
  other: 'Other document',
  passport: 'Passport',
  permit: 'Permit',
  voucher: 'Voucher',
}

export type BookingDocument = {
  id: string
  booking_id: string
  doc_type: BookingDocType
  title?: string | null
  file_url: string
  file_public_id?: string | null
  file_name?: string | null
  mime_type?: string | null
  file_size?: number | null
  notes?: string | null
  created_at?: string
}

export type ShareAudience = 'client' | 'staff'

export type BookingShareLink = {
  id: string
  booking_id: string
  token: string
  audience: ShareAudience
  include_rates: boolean
  label?: string | null
  expires_at?: string | null
  is_active: boolean
  created_at?: string
  last_accessed_at?: string | null
  url?: string
}

export function emptyOperations(bookingId: string): BookingOperations {
  return {
    booking_id: bookingId,
    guide_id: '',
    vehicle_id: '',
    source_id: '',
    guide_name: '',
    guide_phone: '',
    guide_email: '',
    guide_notes: '',
    driver_name: '',
    driver_phone: '',
    driver_email: '',
    driver_notes: '',
    hotels: [],
    internal_notes: '',
  }
}

export function emptyHotel(): HotelStay {
  return {
    name: '',
    location: '',
    check_in: '',
    check_out: '',
    room_type: '',
    confirmation_no: '',
    notes: '',
  }
}

/** Cryptographically strong URL token */
export function createShareToken(bytes = 24): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function sharePath(token: string): string {
  return `/share/i/${token}`
}

export function tourNakedSharePath(token: string): string {
  return `/share/tour/${token}`
}
