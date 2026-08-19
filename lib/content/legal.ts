/** Shared CMS shape for Privacy Policy & Terms & Conditions pages */

export type LegalSection = {
  title: string
  /** Plain text. Blank line = new paragraph. Lines starting with - or • become bullets. Use {company} for the brand name. */
  body: string
}

export type LegalPageContent = {
  title: string
  /** Shown as “Last updated: …”. Leave empty to show today’s date. */
  lastUpdated: string
  sections: LegalSection[]
  cta: {
    title: string
    subtitle: string
  }
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function mergeSection(raw: unknown, fallback: LegalSection): LegalSection {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    title: asString(row.title, fallback.title),
    body: asString(row.body, fallback.body),
  }
}

export function mergeLegalContent(
  raw: unknown,
  defaults: LegalPageContent
): LegalPageContent {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const ctaRaw =
    data.cta && typeof data.cta === 'object' ? (data.cta as Record<string, unknown>) : {}
  const rawSections = Array.isArray(data.sections) ? data.sections : null
  const sections =
    rawSections && rawSections.length > 0
      ? rawSections.map((s, i) =>
          mergeSection(s, defaults.sections[i % Math.max(defaults.sections.length, 1)] || {
            title: 'Section',
            body: '',
          })
        )
      : defaults.sections

  return {
    title: asString(data.title, defaults.title),
    lastUpdated: asString(data.lastUpdated, defaults.lastUpdated),
    sections,
    cta: {
      title: asString(ctaRaw.title, defaults.cta.title),
      subtitle: asString(ctaRaw.subtitle, defaults.cta.subtitle),
    },
  }
}

export const PRIVACY_DEFAULTS: LegalPageContent = {
  title: 'Privacy Policy',
  lastUpdated: '',
  sections: [
    {
      title: 'Information We Collect',
      body: `{company} collects personal information to provide and improve our services. This includes:

- Name and contact details (email, phone, address)
- Passport information for visa processing
- Travel preferences and requirements
- Payment information for bookings
- Travel insurance details`,
    },
    {
      title: 'How We Use Your Information',
      body: `We use your information to:

- Process bookings and travel arrangements
- Arrange Bhutan visas and permits
- Communicate about your tour and updates
- Provide customer support
- Improve our services and tailor experiences`,
    },
    {
      title: 'Data Protection & Security',
      body: `We implement appropriate security measures to protect your personal information:

- Secure data storage and transmission
- Limited access to personal information
- Regular security assessments
- Compliance with data protection regulations`,
    },
    {
      title: 'Information Sharing',
      body: `We may share your information with:

- Bhutan tourism authorities for permits and visas
- Hotels and transport providers for bookings
- Travel insurance providers (if applicable)
- Payment processors for transactions

We never sell your personal information to third parties.`,
    },
    {
      title: 'Your Rights',
      body: `You have the right to:

- Access your personal information
- Correct inaccurate information
- Request deletion of your data
- Opt-out of marketing communications
- Withdraw consent where applicable`,
    },
    {
      title: 'Contact Us',
      body: `For privacy concerns or requests, please contact us at:

Email: sacredkingdomtravel@gmail.com
Phone: +975 77888822
Address: Changlam Plaza, Room No. 502, P.O. Box 1459, Thimphu, Bhutan`,
    },
  ],
  cta: {
    title: 'Plan Your Bhutan Adventure',
    subtitle: 'Your privacy matters to us. Book with confidence.',
  },
}

export const TERMS_DEFAULTS: LegalPageContent = {
  title: 'Terms & Conditions',
  lastUpdated: '',
  sections: [
    {
      title: 'Introduction',
      body: `Welcome to {company}. By using our services and booking our tours, you agree to these Terms & Conditions. Please read them carefully before making a booking.`,
    },
    {
      title: 'Booking & Payment',
      body: `- All bookings require a non-refundable deposit of 30% to confirm reservation
- Full payment must be received 30 days before tour commencement
- Payments can be made via bank transfer, credit card, or online payment
- Prices are quoted in US Dollars and are valid for the dates specified`,
    },
    {
      title: 'Cancellation Policy',
      body: `- 30+ days before departure: Full refund minus deposit
- 15-30 days before departure: 50% refund
- 7-14 days before departure: 25% refund
- Less than 7 days: No refund`,
    },
    {
      title: 'Travel Requirements',
      body: `- Valid passport with at least 6 months remaining validity
- Bhutan visa (arranged by us with booking details)
- Travel insurance (mandatory for all tours)
- Medical certificate for high-altitude treks`,
    },
    {
      title: 'Limitation of Liability',
      body: `{company} acts as an intermediary for travel services. We cannot be held responsible for circumstances beyond our control including weather conditions, political unrest, or airline disruptions. We recommend comprehensive travel insurance.`,
    },
    {
      title: 'Contact Us',
      body: `For questions about these Terms & Conditions, please contact us at:

Email: sacredkingdomtravel@gmail.com
Phone: +975 77888822
Address: Changlam Plaza, Room No. 502, P.O. Box 1459, Thimphu, Bhutan`,
    },
  ],
  cta: {
    title: 'Ready to Book Your Tour?',
    subtitle: 'Contact us today to start planning your Bhutan adventure',
  },
}

export function applyCompanyPlaceholder(text: string, company: string): string {
  return (text || '').replace(/\{company\}/gi, company)
}

/** Split CMS body text into paragraphs and bullet lists for rendering. */
export function parseLegalBody(
  body: string,
  company: string
): Array<{ type: 'p'; text: string } | { type: 'ul'; items: string[] }> {
  const resolved = applyCompanyPlaceholder(body, company).trim()
  if (!resolved) return []

  const blocks = resolved.split(/\n\s*\n/)
  const result: Array<{ type: 'p'; text: string } | { type: 'ul'; items: string[] }> = []

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) continue

    const bulletLines = lines.filter((l) => /^[-•*]\s+/.test(l) || /^•/.test(l))
    if (bulletLines.length === lines.length) {
      result.push({
        type: 'ul',
        items: lines.map((l) => l.replace(/^[-•*]\s*/, '').trim()),
      })
    } else if (bulletLines.length > 0 && bulletLines.length >= lines.length - 1) {
      // Mostly bullets — treat as list
      result.push({
        type: 'ul',
        items: lines
          .filter((l) => /^[-•*]/.test(l))
          .map((l) => l.replace(/^[-•*]\s*/, '').trim()),
      })
      const prose = lines.filter((l) => !/^[-•*]/.test(l))
      for (const p of prose) {
        result.push({ type: 'p', text: p })
      }
    } else {
      result.push({ type: 'p', text: lines.join(' ') })
    }
  }

  return result
}
