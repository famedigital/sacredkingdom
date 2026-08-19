import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { upsertMasterClient } from '@/lib/clients/upsert';

/** List clients (engagements) under a tour package. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: tourId } = await params;
    const supabase = createAdminClient();

    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, title, slug, itinerary')
      .eq('id', tourId)
      .maybeSingle();

    if (tourError) throw tourError;
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 });

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(
        'id, booking_number, client_id, client_name, client_email, client_phone, status, payment_status, travel_date, total_amount, number_of_adults, number_of_children, total_travelers, itinerary_override, created_at'
      )
      .eq('tour_id', tourId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const clientIds = Array.from(
      new Set((bookings || []).map((b) => b.client_id).filter(Boolean))
    ) as string[];

    let clientsById: Record<string, Record<string, unknown>> = {};
    if (clientIds.length > 0) {
      const { data: clients } = await supabase.from('clients').select('*').in('id', clientIds);
      for (const c of clients || []) {
        clientsById[c.id] = c;
      }
    }

    const engagements = (bookings || []).map((b) => ({
      ...b,
      master_client: b.client_id ? clientsById[b.client_id] || null : null,
      has_custom_itinerary: Array.isArray(b.itinerary_override) && b.itinerary_override.length > 0,
    }));

    return NextResponse.json({
      tour: { id: tour.id, title: tour.title, slug: tour.slug },
      engagements,
      package_itinerary: tour.itinerary || [],
    });
  } catch (error) {
    console.error('Tour clients list error:', error);
    return NextResponse.json({ error: 'Failed to load tour clients' }, { status: 500 });
  }
}

/**
 * Create a client engagement under this tour.
 * Upserts master client, creates a pending booking linked to both.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: tourId } = await params;
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = body.phone ? String(body.phone).trim() : null;
    const adults = Math.max(1, parseInt(String(body.number_of_adults || 1), 10) || 1);
    const children = Math.max(0, parseInt(String(body.number_of_children || 0), 10) || 0);
    const travelDate = body.travel_date || null;
    const notes = body.notes ? String(body.notes) : null;
    const copyItinerary = body.copy_itinerary !== false;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, title, price, itinerary')
      .eq('id', tourId)
      .maybeSingle();

    if (tourError) throw tourError;
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 });

    const master = await upsertMasterClient({
      name,
      email,
      phone,
      country: body.country || null,
      nationality: body.nationality || null,
      notes,
      source: 'admin',
      userId: user.userId,
    });

    const travelers = adults + children;
    const unit = Number(tour.price) || 0;
    const totalAmount = unit > 0 ? Math.round(unit * travelers * 100) / 100 : null;

    const insertPayload: Record<string, unknown> = {
      tour_id: tourId,
      tour_title: tour.title,
      client_id: master?.id || null,
      client_name: name,
      client_email: email,
      client_phone: phone,
      number_of_adults: adults,
      number_of_children: children,
      travel_date: travelDate,
      custom_requests: notes,
      total_amount: totalAmount,
      status: body.status || 'pending',
      payment_status: 'pending',
      created_by: user.userId,
      updated_by: user.userId,
    };

    if (copyItinerary && Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
      insertPayload.itinerary_override = tour.itinerary;
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select(
        'id, booking_number, client_id, client_name, client_email, client_phone, status, travel_date, total_amount, created_at'
      )
      .single();

    if (bookingError) {
      const msg = bookingError.message || '';
      if (msg.includes('client_id') || msg.includes('itinerary_override') || msg.includes('clients')) {
        return NextResponse.json(
          {
            error:
              'Master clients schema missing. Run migrations/20260722_master_clients_itinerary.sql in Supabase.',
            details: msg,
          },
          { status: 500 }
        );
      }
      throw bookingError;
    }

    return NextResponse.json(
      {
        engagement: booking,
        master_client: master,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create tour client error:', error);
    return NextResponse.json({ error: 'Failed to create client under tour' }, { status: 500 });
  }
}
