import type { BookingPayment } from './payments';
import { sumPayments } from './payments';
import {
  DEFAULT_COMPANY_NAME,
  DEFAULT_COMPANY_TAGLINE,
} from '@/lib/brand-defaults';
import {
  formatQuoteMoney,
  quoteHasAmounts,
  quoteLines,
  quoteTotal,
  type ClientQuote,
} from '@/lib/quotes/client-quote';

export type InvoiceBooking = {
  booking_number: string;
  client_name: string;
  client_email: string;
  client_phone?: string | null;
  travel_date?: string | null;
  total_amount?: number | null;
  status?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
  tour?: {
    title?: string | null;
    category?: string | null;
    duration?: number | null;
  } | null;
  tour_title?: string | null;
  payments?: BookingPayment[];
  quote?: ClientQuote | null;
};

const COMPANY_DEFAULTS = {
  name: DEFAULT_COMPANY_NAME,
  tagline: DEFAULT_COMPANY_TAGLINE,
  email: 'sacredkingdomtravel@gmail.com',
  phone: '+975 77888822',
  address: 'Changlam Plaza, Room No. 502, P.O. Box 1459, Thimphu, Bhutan',
};

export type InvoiceCompany = Partial<typeof COMPANY_DEFAULTS>;

function money(n: number, currency: 'INR' | 'USD' = 'USD') {
  if (currency === 'INR') return formatQuoteMoney(n, 'INR');
  return `$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function buildInvoiceHtml(
  booking: InvoiceBooking,
  companyOverrides?: InvoiceCompany
): string {
  const COMPANY = { ...COMPANY_DEFAULTS, ...companyOverrides };
  const payments = booking.payments || [];
  const quote = booking.quote && quoteHasAmounts(booking.quote) ? booking.quote : null;
  const currency = quote?.currency || 'USD';
  const total = quote ? quoteTotal(quote) : Number(booking.total_amount || 0);
  const paid = sumPayments(payments);
  const balance = Math.max(0, total - paid);
  const tourTitle = booking.tour?.title || booking.tour_title || 'Custom / Inquiry tour';
  const invoiceNo = `INV-${booking.booking_number}`;
  const issued = fmtDate(new Date().toISOString());

  const paymentRows =
    payments.length > 0
      ? payments
          .map(
            (p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${fmtDate(p.paid_at)}</td>
          <td>${p.method || 'Deposit / installment'}${p.note ? `<br/><span class="muted">${escapeHtml(p.note)}</span>` : ''}</td>
          <td class="right">${money(p.amount, currency)}</td>
        </tr>`
          )
          .join('')
      : `<tr><td colspan="4" class="muted center">No payments recorded yet</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${invoiceNo} — ${COMPANY.name}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #1a1a1a;
      margin: 0;
      background: #f3f1ee;
      padding: 24px;
    }
    .sheet {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: 40px 44px;
      border: 1px solid #e2ddd4;
    }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 3px solid #9f1239;
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .brand h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 0.02em;
      color: #9f1239;
    }
    .brand p { margin: 4px 0 0; color: #666; font-size: 13px; }
    .meta { text-align: right; font-size: 13px; line-height: 1.5; }
    .meta strong { display: block; font-size: 18px; margin-bottom: 6px; }
    h2 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #9f1239;
      margin: 0 0 8px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    .box p { margin: 0 0 4px; font-size: 14px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 24px;
      font-size: 14px;
    }
    th, td {
      border-bottom: 1px solid #e8e2d9;
      padding: 10px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #666;
      background: #faf8f5;
    }
    .right { text-align: right; }
    .center { text-align: center; }
    .muted { color: #777; font-size: 12px; }
    .totals {
      width: 280px;
      margin-left: auto;
      font-size: 14px;
    }
    .totals div {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #eee;
    }
    .totals .grand {
      font-weight: 700;
      font-size: 16px;
      border-bottom: none;
      border-top: 2px solid #9f1239;
      margin-top: 6px;
      padding-top: 10px;
      color: #9f1239;
    }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e8e2d9;
      font-size: 12px;
      color: #666;
      line-height: 1.6;
    }
    .actions {
      max-width: 800px;
      margin: 0 auto 16px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .actions button {
      font-family: system-ui, sans-serif;
      border: 1px solid #ccc;
      background: #fff;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .actions { display: none; }
      .sheet { border: none; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button type="button" onclick="window.print()">Print / Save PDF</button>
  </div>
  <div class="sheet">
    <div class="top">
      <div class="brand">
        <h1>${escapeHtml(COMPANY.name)}</h1>
        <p>${escapeHtml(COMPANY.tagline)}</p>
        <p>${escapeHtml(COMPANY.address)} · ${escapeHtml(COMPANY.phone)} · ${escapeHtml(COMPANY.email)}</p>
      </div>
      <div class="meta">
        <strong>INVOICE</strong>
        <div>${escapeHtml(invoiceNo)}</div>
        <div>Issued: ${issued}</div>
        <div>Booking: ${escapeHtml(booking.booking_number)}</div>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <h2>Bill to</h2>
        <p><strong>${escapeHtml(booking.client_name)}</strong></p>
        <p>${escapeHtml(booking.client_email)}</p>
        ${booking.client_phone ? `<p>${escapeHtml(booking.client_phone)}</p>` : ''}
      </div>
      <div class="box">
        <h2>Trip details</h2>
        <p><strong>${escapeHtml(tourTitle)}</strong></p>
        <p>Travel date: ${fmtDate(booking.travel_date)}</p>
        <p>Status: ${escapeHtml(booking.status || 'pending')} · Payment: ${escapeHtml(booking.payment_status || 'pending')}</p>
      </div>
    </div>

    <h2>Charges</h2>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${
          quote
            ? quoteLines(quote)
                .map(
                  (line) => `
        <tr>
          <td>${escapeHtml(line.label)}</td>
          <td class="right">${money(line.amount, currency)}</td>
        </tr>`
                )
                .join('')
            : `
        <tr>
          <td>
            Tour package — ${escapeHtml(tourTitle)}
            <div class="muted">Booking ${escapeHtml(booking.booking_number)} · Created ${fmtDate(booking.created_at)}</div>
          </td>
          <td class="right">${money(total, currency)}</td>
        </tr>`
        }
      </tbody>
    </table>

    <h2>Payments / deposits</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Details</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${paymentRows}
      </tbody>
    </table>

    <div class="totals">
      <div><span>Total</span><span>${money(total, currency)}</span></div>
      <div><span>Paid to date</span><span>${money(paid, currency)}</span></div>
      <div class="grand"><span>Balance due</span><span>${money(balance, currency)}</span></div>
    </div>

    <div class="footer">
      Thank you for choosing ${escapeHtml(COMPANY.name)}. Deposits are typically non-refundable as per our terms.
      For payment questions, contact ${escapeHtml(COMPANY.email)} or ${escapeHtml(COMPANY.phone)}.
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function openInvoicePrintWindow(booking: InvoiceBooking) {
  let company: InvoiceCompany | undefined;
  try {
    const res = await fetch('/api/brand', { cache: 'no-store' });
    if (res.ok) {
      const brand = await res.json();
      company = {
        name: brand.name || DEFAULT_COMPANY_NAME,
        tagline: brand.tagline || DEFAULT_COMPANY_TAGLINE,
      };
    }
  } catch {
    /* use defaults */
  }

  const html = buildInvoiceHtml(booking, company);
  // Blob URL avoids blank tabs caused by noopener + document.write on about:blank
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error('Popup blocked — allow popups to open the invoice');
  }
  // Revoke after the new tab has a chance to load
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
