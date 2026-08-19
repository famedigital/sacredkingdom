/** Client-safe CRM alert template helpers (no server imports). */

import { DEFAULT_COMPANY_NAME } from '@/lib/brand-defaults'

export const DEFAULT_CRM_ALERT_TEMPLATE = `🏔️ {{company}} — {{kind}}

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Tour: {{tour}}
Dates: {{dates}}
Group: {{group}}
Booking #: {{booking_number}}
Message: {{message}}

Open CRM: {{admin_url}}`

export const CRM_ALERT_PLACEHOLDERS = [
  '{{company}}',
  '{{kind}}',
  '{{name}}',
  '{{email}}',
  '{{phone}}',
  '{{tour}}',
  '{{dates}}',
  '{{group}}',
  '{{booking_number}}',
  '{{message}}',
  '{{admin_url}}',
  '{{site_url}}',
] as const

export type CrmAlertTemplatePayload = {
  kind: 'booking' | 'inquiry'
  name: string
  email: string
  phone?: string | null
  message?: string | null
  tourTitle?: string | null
  travelDates?: string | null
  groupSize?: string | number | null
  bookingNumber?: string | null
}

function buildVars(
  payload: CrmAlertTemplatePayload,
  adminUrl: string,
  siteUrl: string,
  companyName: string
): Record<string, string> {
  const kindLabel = payload.kind === 'booking' ? 'NEW BOOKING' : 'NEW INQUIRY'
  return {
    company: companyName || DEFAULT_COMPANY_NAME,
    kind: kindLabel,
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone ? String(payload.phone) : '',
    tour: payload.tourTitle ? String(payload.tourTitle) : '',
    dates: payload.travelDates ? String(payload.travelDates) : '',
    group:
      payload.groupSize != null && payload.groupSize !== ''
        ? String(payload.groupSize)
        : '',
    booking_number: payload.bookingNumber ? String(payload.bookingNumber) : '',
    message: payload.message ? String(payload.message).slice(0, 400) : '',
    admin_url: adminUrl,
    site_url: siteUrl,
  }
}

/**
 * Render alert template. Lines whose value placeholder is empty are removed
 * (e.g. "Phone: {{phone}}" drops when no phone).
 */
export function formatAlertText(
  payload: CrmAlertTemplatePayload,
  adminUrl: string,
  template?: string | null,
  siteUrl?: string,
  companyName?: string
): string {
  const base = (siteUrl || '').replace(/\/$/, '')
  const vars = buildVars(
    payload,
    adminUrl,
    base,
    companyName || DEFAULT_COMPANY_NAME
  )
  const raw = (template && template.trim()) || DEFAULT_CRM_ALERT_TEMPLATE

  const rendered = raw.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_m, key: string) => {
    const k = key.toLowerCase()
    return vars[k] ?? ''
  })

  const lines = rendered.split('\n').filter((line) => {
    const trimmed = line.trim()
    if (!trimmed) return true
    if (/^(Phone|Tour|Dates|Group|Booking #|Message)\s*:\s*$/i.test(trimmed)) {
      return false
    }
    return true
  })

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
