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

// GET /api/admin/tours - List all tours with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from('tours')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: tours, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      tours,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Tours list error:', error);
    return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
  }
}

// POST /api/admin/tours - Create new tour
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const payload = pickTourFields(body);

    if (!payload.slug && typeof payload.title === 'string') {
      payload.slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    const supabase = createAdminClient();

    const insertRow = {
      ...payload,
      created_by: user.userId,
      updated_by: user.userId,
    };

    let { data: tour, error } = await supabase
      .from('tours')
      .insert(insertRow)
      .select()
      .single();

    // Graceful fallback until show_price column is added in Supabase
    if (error && isMissingShowPriceColumn(error) && 'show_price' in insertRow) {
      const { show_price: _omit, ...withoutShowPrice } = insertRow;
      ({ data: tour, error } = await supabase
        .from('tours')
        .insert(withoutShowPrice)
        .select()
        .single());
    }

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'create',
      entity_type: 'tour',
      entity_id: tour.id,
      entity_title: tour.title,
      new_values: tour,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    revalidateTourPages(tour.slug);

    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    console.error('Tour creation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create tour';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
