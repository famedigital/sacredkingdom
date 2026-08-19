import { NextRequest, NextResponse, after } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { z } from 'zod';
import { upsertMasterClient } from '@/lib/clients/upsert';
import { notifyCrmAlert } from '@/lib/notifications/crm-alert';
import { sendContactAutoReply } from '@/lib/notifications/contact-auto-reply';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  travelDates: z.string().optional(),
  groupSize: z.string().optional(),
  message: z.string().min(1),
  tourSlug: z.string().optional(),
  tourTitle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { name, email, phone, travelDates, groupSize, message, tourSlug, tourTitle } = parsed.data;
    const supabase = createAdminClient();

    let tourId: string | null = null;
    let resolvedTitle = tourTitle || null;
    let tourPrice = 0;
    let tourItinerary: unknown = null;

    if (tourSlug) {
      const { data: tour } = await supabase
        .from('tours')
        .select('id, title, price, itinerary')
        .eq('slug', tourSlug)
        .eq('is_active', true)
        .eq('is_published', true)
        .maybeSingle();
      if (tour) {
        tourId = tour.id;
        resolvedTitle = tour.title;
        tourPrice = Number(tour.price) || 0;
        tourItinerary = tour.itinerary;
      }
    }

    const master = await upsertMasterClient({
      name,
      email,
      phone: phone || null,
      source: 'booking',
    });

    const adults = groupSize ? parseInt(groupSize, 10) : 1;
    const travelerCount = Number.isFinite(adults) && adults > 0 ? adults : 1;
    const totalAmount =
      tourPrice > 0 ? Math.round(tourPrice * travelerCount * 100) / 100 : null;

    const bookingInsert: Record<string, unknown> = {
      tour_id: tourId,
      tour_title: resolvedTitle,
      client_id: master?.id || null,
      client_name: name,
      client_email: email.toLowerCase(),
      client_phone: phone || null,
      number_of_adults: travelerCount,
      number_of_children: 0,
      travel_date: null,
      preferred_dates: travelDates ? { note: travelDates } : null,
      custom_requests: message,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
    };

    if (Array.isArray(tourItinerary) && tourItinerary.length > 0) {
      bookingInsert.itinerary_override = tourItinerary;
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingInsert)
      .select('id, booking_number, client_id')
      .single();

    const inquiryInsert: Record<string, unknown> = {
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      message,
      preferred_dates: travelDates || null,
      group_size: Number.isFinite(adults) ? adults : null,
      status: 'new',
      inquiry_type: 'booking_request',
      subject: resolvedTitle ? `Booking: ${resolvedTitle}` : 'Booking request',
      tour_interest: resolvedTitle || tourSlug || null,
    };
    if (master?.id) inquiryInsert.client_id = master.id;

    await supabase.from('inquiries').insert(inquiryInsert);

    // Keep the serverless function alive until emails finish (Vercel)
    after(async () => {
      await Promise.allSettled([
        notifyCrmAlert({
          kind: 'booking',
          name,
          email,
          phone: phone || null,
          message,
          tourTitle: resolvedTitle,
          travelDates: travelDates || null,
          groupSize: travelerCount,
          bookingNumber: booking?.booking_number || null,
        }),
        sendContactAutoReply({ to: email, name }),
      ]);
    });

    if (bookingError) {
      console.error('Booking insert error (inquiry still saved):', bookingError);
      return NextResponse.json({
        message: 'Request received. Our team will follow up shortly.',
        bookingCreated: false,
        clientId: master?.id || null,
      });
    }

    return NextResponse.json({
      message: 'Booking request submitted',
      booking,
      clientId: master?.id || booking?.client_id || null,
      bookingCreated: true,
    });
  } catch (error) {
    console.error('Booking request error:', error);
    return NextResponse.json({ error: 'Failed to submit booking request' }, { status: 500 });
  }
}
