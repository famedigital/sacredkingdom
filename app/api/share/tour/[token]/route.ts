import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

/** Public naked itinerary for a tour package (no rates). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const supabase = createAdminClient();
    const { data: tour, error } = await supabase
      .from('tours')
      .select(
        'id, title, slug, tagline, duration, category, itinerary, highlights, hero_image_url, thumbnail_url, naked_share_token'
      )
      .eq('naked_share_token', token)
      .maybeSingle();

    if (error) throw error;
    if (!tour) return NextResponse.json({ error: 'Link not found' }, { status: 404 });

    return NextResponse.json({
      audience: 'client',
      include_rates: false,
      tour: {
        title: tour.title,
        tagline: tour.tagline,
        duration: tour.duration,
        category: tour.category,
        itinerary: tour.itinerary || [],
        highlights: tour.highlights || [],
        hero_image_url: tour.hero_image_url || tour.thumbnail_url,
      },
    });
  } catch (error) {
    console.error('Tour naked share error:', error);
    return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
  }
}
