import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAuthError, requireAuth } from '@/lib/auth/require-auth';
import { upsertMasterClient } from '@/lib/clients/upsert';
import { opsClientHref } from '@/lib/ops/client-key';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const supabase = createAdminClient();

    // Prefer master clients table when available
    const { data: masterClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, email, phone, country, nationality, source, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (!clientsError && masterClients) {
      const [{ data: bookings }, { data: inquiries }] = await Promise.all([
        supabase.from('bookings').select('client_id, client_email, created_at').limit(1000),
        supabase.from('inquiries').select('client_id, email, client_email, created_at').limit(1000),
      ]);

      const bookingCount = new Map<string, number>();
      const inquiryCount = new Map<string, number>();
      const lastByClient = new Map<string, string>();

      for (const b of bookings || []) {
        const key = b.client_id || (b.client_email || '').toLowerCase();
        if (!key) continue;
        bookingCount.set(key, (bookingCount.get(key) || 0) + 1);
        const prev = lastByClient.get(key);
        if (!prev || b.created_at > prev) lastByClient.set(key, b.created_at);
      }
      for (const i of inquiries || []) {
        const email = (i.email || i.client_email || '').toLowerCase();
        const key = i.client_id || email;
        if (!key) continue;
        inquiryCount.set(key, (inquiryCount.get(key) || 0) + 1);
        const prev = lastByClient.get(key);
        if (!prev || i.created_at > prev) lastByClient.set(key, i.created_at);
      }

      const customers = masterClients.map((c) => ({
        id: c.id,
        email: c.email,
        name: c.name,
        phone: c.phone,
        bookings: bookingCount.get(c.id) || bookingCount.get(c.email.toLowerCase()) || 0,
        inquiries: inquiryCount.get(c.id) || inquiryCount.get(c.email.toLowerCase()) || 0,
        last_contact: lastByClient.get(c.id) || lastByClient.get(c.email.toLowerCase()) || c.updated_at || c.created_at,
        sources: c.source ? [c.source] : ['client'],
        is_master: true,
      }));

      return NextResponse.json({ customers, source: 'clients' });
    }

    // Fallback: derive from bookings + inquiries (legacy)
    const [{ data: bookings }, { data: inquiries }] = await Promise.all([
      supabase
        .from('bookings')
        .select('client_name, client_email, client_phone, created_at, status, booking_number')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(200),
    ]);

    const map = new Map<
      string,
      {
        email: string;
        name: string;
        phone?: string | null;
        bookings: number;
        inquiries: number;
        last_contact: string;
        sources: string[];
      }
    >();

    for (const b of bookings || []) {
      const email = (b.client_email || '').toLowerCase();
      if (!email) continue;
      const existing = map.get(email) || {
        email,
        name: b.client_name || email,
        phone: b.client_phone,
        bookings: 0,
        inquiries: 0,
        last_contact: b.created_at,
        sources: [] as string[],
      };
      existing.bookings += 1;
      existing.name = b.client_name || existing.name;
      existing.phone = b.client_phone || existing.phone;
      if (b.created_at > existing.last_contact) existing.last_contact = b.created_at;
      if (!existing.sources.includes('booking')) existing.sources.push('booking');
      map.set(email, existing);
    }

    for (const i of inquiries || []) {
      const email = (i.email || i.client_email || '').toLowerCase();
      if (!email) continue;
      const name = i.name || i.client_name || email;
      const phone = i.phone || i.client_phone;
      const existing = map.get(email) || {
        email,
        name,
        phone,
        bookings: 0,
        inquiries: 0,
        last_contact: i.created_at,
        sources: [] as string[],
      };
      existing.inquiries += 1;
      existing.name = name || existing.name;
      existing.phone = phone || existing.phone;
      if (i.created_at > existing.last_contact) existing.last_contact = i.created_at;
      if (!existing.sources.includes('inquiry')) existing.sources.push('inquiry');
      map.set(email, existing);
    }

    const customers = Array.from(map.values()).sort((a, b) =>
      a.last_contact < b.last_contact ? 1 : -1
    );

    return NextResponse.json({ customers, source: 'derived' });
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = body.phone ? String(body.phone).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;
    const tourId = body.tour_id ? String(body.tour_id).trim() : '';
    const travelDate = body.travel_date || null;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const master = await upsertMasterClient({
      name,
      email,
      phone,
      notes,
      source: 'admin',
      userId: auth.userId,
    });

    if (!master) {
      return NextResponse.json(
        {
          error:
            'Could not save client. Run migrations/20260722_master_clients_itinerary.sql in Supabase if the clients table is missing.',
        },
        { status: 500 }
      );
    }

    let booking = null;
    if (tourId) {
      const supabase = createAdminClient();
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('id, title, price, itinerary')
        .eq('id', tourId)
        .maybeSingle();
      if (tourError) throw tourError;
      if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 });

      const unit = Number(tour.price) || 0;
      const insertPayload: Record<string, unknown> = {
        tour_id: tour.id,
        tour_title: tour.title,
        client_id: master.id,
        client_name: name,
        client_email: email,
        client_phone: phone,
        number_of_adults: 1,
        number_of_children: 0,
        travel_date: travelDate,
        custom_requests: notes,
        total_amount: unit > 0 ? unit : null,
        status: 'pending',
        payment_status: 'pending',
        created_by: auth.userId,
        updated_by: auth.userId,
      };
      if (Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
        insertPayload.itinerary_override = tour.itinerary;
      }

      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert(insertPayload)
        .select('id, booking_number')
        .single();
      if (bookingError) throw bookingError;
      booking = data;
    }

    return NextResponse.json(
      {
        client: master,
        booking,
        href: opsClientHref({ id: master.id, email: master.email }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

