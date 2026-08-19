import { NextRequest, NextResponse, after } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { z } from 'zod';
import { upsertMasterClient } from '@/lib/clients/upsert';
import { notifyCrmAlert } from '@/lib/notifications/crm-alert';
import { sendContactAutoReply } from '@/lib/notifications/contact-auto-reply';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  travelDates: z.string().optional(),
  groupSize: z.string().optional(),
  message: z.string().min(1),
  tourSlug: z.string().optional(),
  tourTitle: z.string().optional(),
  intent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { name, email, phone, travelDates, groupSize, message, tourSlug, tourTitle } = parsed.data;
    const supabase = createAdminClient();

    const groupSizeNum = groupSize ? parseInt(groupSize, 10) : null;

    const master = await upsertMasterClient({
      name,
      email,
      phone: phone || null,
      source: 'inquiry',
    });

    const inquiryInsert: Record<string, unknown> = {
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      message,
      preferred_dates: travelDates || null,
      group_size: Number.isFinite(groupSizeNum as number) ? groupSizeNum : null,
      status: 'new',
      inquiry_type: 'contact_form',
      subject: tourTitle ? `Inquiry: ${tourTitle}` : 'Website contact form',
      tour_interest: tourTitle || tourSlug || null,
    };
    if (master?.id) inquiryInsert.client_id = master.id;

    const { error } = await supabase.from('inquiries').insert(inquiryInsert);

    if (error) throw error;

    // Keep the serverless function alive until emails finish (Vercel)
    after(async () => {
      await Promise.allSettled([
        notifyCrmAlert({
          kind: 'inquiry',
          name,
          email,
          phone: phone || null,
          message,
          tourTitle: tourTitle || tourSlug || null,
          travelDates: travelDates || null,
          groupSize: groupSize || null,
        }),
        sendContactAutoReply({ to: email, name }),
      ]);
    });

    return NextResponse.json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
