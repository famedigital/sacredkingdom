import { getContactPageContent } from '@/lib/content/get-contact'
import { CONTACT_AUTO_REPLY_DEFAULTS } from '@/lib/content/contact'
import { sendEmail } from '@/lib/email/send'
import { getCompanyName } from '@/lib/brand'
import { DEFAULT_COMPANY_NAME } from '@/lib/brand-defaults'

function personalize(template: string, name: string, company: string): string {
  return template
    .replaceAll('{{name}}', name)
    .replaceAll('{name}', name)
    .replaceAll('{{company}}', company)
    .replaceAll('{company}', company)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Guest confirmation email from Admin → Contact → Auto-Reply Message.
 * Never throws — inquiry/booking must succeed even if mail fails.
 */
export async function sendContactAutoReply(params: {
  to: string
  name: string
}): Promise<void> {
  try {
    const to = String(params.to || '').trim().toLowerCase()
    if (!to || !to.includes('@')) return

    const content = await getContactPageContent()
    const autoReply = content.autoReply || CONTACT_AUTO_REPLY_DEFAULTS
    if (!autoReply.enabled) {
      console.info('[contact-auto-reply] disabled')
      return
    }

    const company = (await getCompanyName().catch(() => DEFAULT_COMPANY_NAME)) || DEFAULT_COMPANY_NAME
    const guestName = String(params.name || '').trim() || 'there'
    const subject = personalize(
      autoReply.subject || CONTACT_AUTO_REPLY_DEFAULTS.subject,
      guestName,
      company
    )
    const body = personalize(
      autoReply.message || CONTACT_AUTO_REPLY_DEFAULTS.message,
      guestName,
      company
    )

    const text = `Hi ${guestName},

${body}

— ${company}`

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <p>Hi ${escapeHtml(guestName)},</p>
        <p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(body)}</p>
        <p style="margin-top:28px;font-size:13px;color:#666">— ${escapeHtml(company)}</p>
      </div>
    `

    const result = await sendEmail({ to, subject, text, html })
    if (!result.sent) {
      console.error('[contact-auto-reply]', result.provider, result.error)
    } else {
      console.info('[contact-auto-reply] sent via', result.provider)
    }
  } catch (error) {
    console.error('[contact-auto-reply] unexpected error', error)
  }
}
