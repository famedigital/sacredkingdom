import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { emptyOperations, type HotelStay } from '@/lib/bookings/operations';

function normalizeHotels(raw: unknown): HotelStay[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((h) => {
    const row = (h && typeof h === 'object' ? h : {}) as Record<string, unknown>;
    return {
      name: String(row.name || '').trim(),
      location: String(row.location || '').trim(),
      check_in: String(row.check_in || '').trim(),
      check_out: String(row.check_out || '').trim(),
      room_type: String(row.room_type || '').trim(),
      confirmation_no: String(row.confirmation_no || '').trim(),
      notes: String(row.notes || '').trim(),
    };
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('booking_operations')
      .select('*')
      .eq('booking_id', id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      operations: data
        ? { ...data, hotels: normalizeHotels(data.hotels) }
        : emptyOperations(id),
    });
  } catch (error) {
    console.error('Get booking operations error:', error);
    return NextResponse.json({ error: 'Failed to load operations' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (bookingError) throw bookingError;
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const payload = {
      booking_id: id,
      guide_id: body.guide_id || null,
      vehicle_id: body.vehicle_id || null,
      source_id: body.source_id || null,
      guide_name: body.guide_name ?? null,
      guide_phone: body.guide_phone ?? null,
      guide_email: body.guide_email ?? null,
      guide_notes: body.guide_notes ?? null,
      driver_name: body.driver_name ?? null,
      driver_phone: body.driver_phone ?? null,
      driver_email: body.driver_email ?? null,
      driver_notes: body.driver_notes ?? null,
      hotels: normalizeHotels(body.hotels),
      internal_notes: body.internal_notes ?? null,
      updated_by: user.userId,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('booking_operations')
      .select('id')
      .eq('booking_id', id)
      .maybeSingle();

    let result;
    if (existing?.id) {
      const { data, error } = await supabase
        .from('booking_operations')
        .update(payload)
        .eq('booking_id', id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('booking_operations')
        .insert({ ...payload, created_by: user.userId })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    if (payload.source_id !== undefined) {
      await supabase.from('bookings').update({ source_id: payload.source_id }).eq('id', id);
    }

    return NextResponse.json({
      operations: { ...result, hotels: normalizeHotels(result.hotels) },
    });
  } catch (error) {
    console.error('Save booking operations error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save operations';
    return NextResponse.json(
      {
        error: message.includes('booking_operations')
          ? 'Operations table missing. Run migrations/20260722_booking_operations_shares_docs.sql in Supabase.'
          : 'Failed to save operations',
        details: message,
      },
      { status: 500 }
    );
  }
}
