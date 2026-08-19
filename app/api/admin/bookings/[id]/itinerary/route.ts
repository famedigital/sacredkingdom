import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';

type ItineraryDay = {
  day?: string | number
  title?: string
  location?: string
  description?: string
  meals?: string
  accommodation?: string
  activities?: string[]
}

function normalizeItinerary(raw: unknown): ItineraryDay[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
    const dayRaw = row.day
    const day =
      typeof dayRaw === 'string' || typeof dayRaw === 'number' ? dayRaw : index + 1
    return {
      day,
      title: String(row.title || ''),
      location: String(row.location || ''),
      description: String(row.description || ''),
      meals: String(row.meals || ''),
      accommodation: String(row.accommodation || ''),
      activities: Array.isArray(row.activities)
        ? row.activities.map((a) => String(a))
        : [],
    }
  })
}

/** Get effective itinerary for a booking (override or tour package). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, tour_id, itinerary_override, tour_title')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    let packageItinerary: ItineraryDay[] = [];
    if (booking.tour_id) {
      const { data: tour } = await supabase
        .from('tours')
        .select('itinerary')
        .eq('id', booking.tour_id)
        .maybeSingle();
      packageItinerary = normalizeItinerary(tour?.itinerary);
    }

    const override = normalizeItinerary(booking.itinerary_override);
    const hasOverride = Array.isArray(booking.itinerary_override) && booking.itinerary_override.length > 0;

    return NextResponse.json({
      has_override: hasOverride,
      itinerary: hasOverride ? override : packageItinerary,
      package_itinerary: packageItinerary,
      source: hasOverride ? 'override' : 'package',
    });
  } catch (error) {
    console.error('Get booking itinerary error:', error);
    return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
  }
}

/** Save client-specific itinerary changes for this booking. */
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

    const clear = body.clear === true;
    const itinerary = clear ? null : normalizeItinerary(body.itinerary);

    const { data, error } = await supabase
      .from('bookings')
      .update({
        itinerary_override: itinerary,
        updated_by: user.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, itinerary_override')
      .single();

    if (error) {
      const msg = error.message || '';
      if (msg.includes('itinerary_override')) {
        return NextResponse.json(
          {
            error:
              'itinerary_override column missing. Run migrations/20260722_master_clients_itinerary.sql in Supabase.',
            details: msg,
          },
          { status: 500 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      has_override: Array.isArray(data.itinerary_override) && data.itinerary_override.length > 0,
      itinerary: normalizeItinerary(data.itinerary_override),
    });
  } catch (error) {
    console.error('Save booking itinerary error:', error);
    return NextResponse.json({ error: 'Failed to save itinerary' }, { status: 500 });
  }
}
