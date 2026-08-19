import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';

function revalidateTourPages(slug?: string | null) {
  revalidatePath('/tours');
  revalidatePath('/');
  if (slug) revalidatePath(`/tours/${slug}`);
}

const TOUR_FIELDS = [
  'title',
  'slug',
  'tagline',
  'description',
  'long_description',
  'category',
  'duration',
  'price',
  'difficulty_level',
  'max_group_size',
  'min_group_size',
  'hero_image_url',
  'hero_image_focal_x',
  'hero_image_focal_y',
  'thumbnail_url',
  'gallery_urls',
  'highlights',
  'included_items',
  'excluded_items',
  'is_featured',
  'is_active',
  'is_published',
  'show_price',
  'meta_title',
  'meta_description',
  'meta_keywords',
  'itinerary',
  'locations',
  'departure_dates',
  'faqs',
] as const;

function pickTourFields(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const key of TOUR_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

function isMissingShowPriceColumn(error: { message?: string } | null | undefined) {
  const msg = error?.message || '';
  return msg.includes('show_price') && (msg.includes('column') || msg.includes('schema cache'));
}

// GET /api/admin/tours/[id] - Get single tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: tour, error } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Tour fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 });
  }
}

// PATCH /api/admin/tours/[id] - Update tour
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: currentTour, error: fetchError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentTour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const payload = pickTourFields(body);

    const updateRow = {
      ...payload,
      updated_by: user.userId,
      updated_at: new Date().toISOString(),
    };

    let { data: updatedTour, error } = await supabase
      .from('tours')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();

    if (error && isMissingShowPriceColumn(error) && 'show_price' in updateRow) {
      const { show_price: _omit, ...withoutShowPrice } = updateRow;
      ({ data: updatedTour, error } = await supabase
        .from('tours')
        .update(withoutShowPrice)
        .eq('id', id)
        .select()
        .single());
    }

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'update',
      entity_type: 'tour',
      entity_id: updatedTour.id,
      entity_title: updatedTour.title,
      old_values: currentTour,
      new_values: updatedTour,
      changes_summary: `Updated tour: ${updatedTour.title}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    revalidateTourPages(updatedTour.slug);
    if (currentTour.slug && currentTour.slug !== updatedTour.slug) {
      revalidateTourPages(currentTour.slug);
    }

    return NextResponse.json(updatedTour);
  } catch (error) {
    console.error('Tour update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update tour';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/tours/[id] - Soft delete tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: tour, error: fetchError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('tours')
      .update({
        is_active: false,
        updated_by: user.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'delete',
      entity_type: 'tour',
      entity_id: tour.id,
      entity_title: tour.title,
      old_values: tour,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    revalidateTourPages(tour.slug);

    return NextResponse.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Tour deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 });
  }
}
