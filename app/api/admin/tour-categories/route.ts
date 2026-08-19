import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAuthError, requireAuth } from '@/lib/auth/require-auth';
import { DEFAULT_TOUR_CATEGORIES } from '@/lib/tour-category';

export type TourCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
};

const DEFAULT_CATEGORIES: TourCategory[] = DEFAULT_TOUR_CATEGORIES.map((c) => ({ ...c }));

async function getCategories(supabase: ReturnType<typeof createAdminClient>) {
  const { data } = await supabase
    .from('site_settings')
    .select('id, value')
    .eq('key', 'tour_categories')
    .maybeSingle();

  if (!data?.value) return { categories: DEFAULT_CATEGORIES, settingId: null as string | null };

  try {
    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { categories: parsed as TourCategory[], settingId: data.id as string };
    }
  } catch {
    // fall through
  }
  return { categories: DEFAULT_CATEGORIES, settingId: data.id as string };
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { categories } = await getCategories(supabase);
    return NextResponse.json({
      categories: categories.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order),
    });
  } catch (error) {
    console.error('Tour categories GET error:', error);
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const categories = (body.categories || []) as TourCategory[];
    const supabase = createAdminClient();
    const { settingId } = await getCategories(supabase);
    const value = JSON.stringify(categories);

    if (settingId) {
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', settingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('site_settings').insert({
        key: 'tour_categories',
        value,
        category: 'tours',
        description: 'Tour navigation categories for public Tours submenu',
        is_public: true,
        sort_order: 0,
      });
      if (error) throw error;
    }

    revalidatePath('/tours');
    revalidatePath('/');

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Tour categories PUT error:', error);
    return NextResponse.json({ error: 'Failed to save categories' }, { status: 500 });
  }
}
