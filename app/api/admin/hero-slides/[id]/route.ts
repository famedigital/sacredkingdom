import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAuthError, requireAuth } from '@/lib/auth/require-auth';
import {
  DEFAULT_HERO_TITLE_COLOR,
  sanitizeCssColor,
} from '@/lib/hero-title-color';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = { ...body };

    if (body.title_color !== undefined || body.cta_style !== undefined) {
      const titleColor = sanitizeCssColor(
        body.title_color ?? body.cta_style,
        DEFAULT_HERO_TITLE_COLOR
      );
      updateData.cta_style = titleColor;
      updateData.title_color = titleColor;
    }

    let { data: slide, error } = await supabase
      .from('hero_slides')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error && /title_color/i.test(error.message || '')) {
      delete updateData.title_color;
      const retry = await supabase
        .from('hero_slides')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      slide = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return NextResponse.json({
      ...slide,
      title_color: sanitizeCssColor(
        (slide as any)?.title_color || (slide as any)?.cta_style,
        DEFAULT_HERO_TITLE_COLOR
      ),
    });
  } catch (error) {
    console.error('Hero slide update error:', error);
    return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('Hero slide deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 });
  }
}
