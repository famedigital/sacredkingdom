export type BookingPayment = {
  id: string;
  amount: number;
  paid_at: string;
  note?: string;
  method?: string;
};

const LEDGER_RE = /<!--PAYMENT_LEDGER:([\s\S]*?)-->/;

export function parsePaymentLedger(notes: string | null | undefined): {
  payments: BookingPayment[];
  cleanNotes: string;
} {
  if (!notes) return { payments: [], cleanNotes: '' };
  const match = notes.match(LEDGER_RE);
  if (!match) return { payments: [], cleanNotes: notes.trim() };

  let payments: BookingPayment[] = [];
  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) {
      payments = parsed
        .filter((p) => p && typeof p.amount === 'number' && p.amount > 0)
        .map((p) => ({
          id: String(p.id || crypto.randomUUID()),
          amount: Number(p.amount),
          paid_at: String(p.paid_at || new Date().toISOString()),
          note: p.note ? String(p.note) : undefined,
          method: p.method ? String(p.method) : undefined,
        }));
    }
  } catch {
    payments = [];
  }

  return {
    payments,
    cleanNotes: notes.replace(LEDGER_RE, '').trim(),
  };
}

export function serializePaymentLedger(
  payments: BookingPayment[],
  cleanNotes: string
): string {
  const ledger = `<!--PAYMENT_LEDGER:${JSON.stringify(payments)}-->`;
  const body = cleanNotes.trim();
  return body ? `${body}\n${ledger}` : ledger;
}

export function sumPayments(payments: BookingPayment[]): number {
  return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function derivePaymentStatus(
  totalAmount: number,
  amountPaid: number
): 'pending' | 'partial' | 'paid' {
  if (amountPaid <= 0) return 'pending';
  if (totalAmount > 0 && amountPaid >= totalAmount) return 'paid';
  return 'partial';
}

export function createPaymentEntry(input: {
  amount: number;
  note?: string;
  method?: string;
  paid_at?: string;
}): BookingPayment {
  return {
    id: crypto.randomUUID(),
    amount: Math.round(Number(input.amount) * 100) / 100,
    paid_at: input.paid_at || new Date().toISOString(),
    note: input.note?.trim() || undefined,
    method: input.method?.trim() || undefined,
  };
}
