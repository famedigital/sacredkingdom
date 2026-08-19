import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * Public itinerary payload for a booking share token.
 * Never returns rates / payment amounts.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const supabase = createAdminClient();

    const { data: link, error: linkError } = await supabase
      .from('booking_share_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!link) return NextResponse.json({ error: 'Link not found or revoked' }, { status: 404 });

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        'id, booking_number, client_name, travel_date, number_of_adults, number_of_children, total_travelers, tour_title, tour_id, status, itinerary_override'
      )
      .eq('id', link.booking_id)
      .maybeSingle();

    if (bookingError) throw bookingError;
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    let tour: Record<string, unknown> | null = null;
    if (booking.tour_id) {
      const { data: tourRow } = await supabase
        .from('tours')
        .select(
          'id, title, slug, tagline, duration, category, itinerary, highlights, hero_image_url, thumbnail_url'
        )
        .eq('id', booking.tour_id)
        .maybeSingle();
      tour = tourRow;
    }

    const override = Array.isArray(booking.itinerary_override) ? booking.itinerary_override : null;
    const effectiveItinerary =
      override && override.length > 0 ? override : tour?.itinerary || [];

    const { data: operations } = await supabase
      .from('booking_operations')
      .select(
        'guide_name, guide_phone, guide_email, guide_notes, driver_name, driver_phone, driver_email, driver_notes, hotels'
      )
      .eq('booking_id', booking.id)
      .maybeSingle();

    // Touch last_accessed (best effort)
    await supabase
      .from('booking_share_links')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', link.id);

    const audience = link.audience as 'client' | 'staff';
    const hotels = Array.isArray(operations?.hotels) ? operations.hotels : [];

    return NextResponse.json({
      audience,
      include_rates: false,
      booking: {
        booking_number: booking.booking_number,
        client_name: audience === 'staff' ? booking.client_name : booking.client_name,
        travel_date: booking.travel_date,
        travelers:
          booking.total_travelers ||
          Number(booking.number_of_adults || 0) + Number(booking.number_of_children || 0),
        adults: booking.number_of_adults,
        children: booking.number_of_children,
        status: booking.status,
        tour_title: booking.tour_title || tour?.title || 'Itinerary',
      },
      tour: tour
        ? {
            title: tour.title,
            tagline: tour.tagline,
            duration: tour.duration,
            category: tour.category,
            itinerary: effectiveItinerary,
            highlights: tour.highlights || [],
            hero_image_url: tour.hero_image_url || tour.thumbnail_url,
          }
        : null,
      hotels: audience === 'staff' || hotels.length > 0 ? hotels : [],
      operations:
        audience === 'staff'
          ? {
              guide_name: operations?.guide_name || null,
              guide_phone: operations?.guide_phone || null,
              guide_email: operations?.guide_email || null,
              guide_notes: operations?.guide_notes || null,
              driver_name: operations?.driver_name || null,
              driver_phone: operations?.driver_phone || null,
              driver_email: operations?.driver_email || null,
              driver_notes: operations?.driver_notes || null,
            }
          : null,
    });
  } catch (error) {
    console.error('Public share itinerary error:', error);
    return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
  }
}
