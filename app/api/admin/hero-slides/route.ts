import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAuthError, requireAuth } from '@/lib/auth/require-auth';
import {
  DEFAULT_HERO_TITLE_COLOR,
  sanitizeCssColor,
} from '@/lib/hero-title-color';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const supabase = createAdminClient();

    let query = supabase
      .from('hero_slides')
      .select('*')
      .order('slide_order', { ascending: true });

    if (activeOnly) query = query.eq('is_active', true);

    const { data: slides, error } = await query;
    if (error) throw error;

    const normalized = (slides || []).map((slide: any) => ({
      ...slide,
      title_color: sanitizeCssColor(
        slide.title_color || slide.cta_style,
        DEFAULT_HERO_TITLE_COLOR
      ),
    }));

    return NextResponse.json({ slides: normalized });
  } catch (error) {
    console.error('Hero slides fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const supabase = createAdminClient();

    const { data: existingSlides } = await supabase
      .from('hero_slides')
      .select('slide_order')
      .order('slide_order', { ascending: false })
      .limit(1);

    const nextOrder = (existingSlides?.[0]?.slide_order ?? -1) + 1;
    const titleColor = sanitizeCssColor(
      body.title_color || body.cta_style,
      DEFAULT_HERO_TITLE_COLOR
    );

    const insertData: Record<string, unknown> = {
      title: body.title || null,
      subtitle: body.subtitle || null,
      description: body.description || null,
      image_url: body.image_url,
      image_public_id: body.image_public_id,
      mobile_image_url: body.mobile_image_url || null,
      mobile_image_public_id: body.mobile_image_public_id || null,
      image_focal_x:
        body.image_focal_x !== undefined && body.image_focal_x !== null
          ? Number(body.image_focal_x)
          : 50,
      image_focal_y:
        body.image_focal_y !== undefined && body.image_focal_y !== null
          ? Number(body.image_focal_y)
          : 50,
      cta_text: body.cta_text || null,
      cta_link: body.cta_link || null,
      // Persist via unused cta_style so we don't require a DDL migration to ship.
      // Also dual-write title_color when that column exists.
      cta_style: titleColor,
      title_color: titleColor,
      slide_order: body.slide_order ?? nextOrder,
      is_active: body.is_active ?? true,
    };

    let { data: slide, error } = await supabase
      .from('hero_slides')
      .insert(insertData)
      .select()
      .single();

    // If title_color column is missing, retry without it.
    if (error && /title_color/i.test(error.message || '')) {
      delete insertData.title_color;
      const retry = await supabase.from('hero_slides').insert(insertData).select().single();
      slide = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return NextResponse.json(
      {
        ...slide,
        title_color: sanitizeCssColor(
          (slide as any)?.title_color || (slide as any)?.cta_style,
          DEFAULT_HERO_TITLE_COLOR
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Hero slide creation error:', error);
    return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 });
  }
}
