import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { DEFAULT_TOUR_CATEGORIES } from '@/lib/tour-category';

const DEFAULT_CATEGORIES = DEFAULT_TOUR_CATEGORIES.map((c) => ({ ...c }));

/** Public tour categories for navigation submenu */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'tour_categories')
      .maybeSingle();

    let categories = DEFAULT_CATEGORIES;
    if (data?.value) {
      try {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        if (Array.isArray(parsed) && parsed.length) categories = parsed;
      } catch {
        // keep defaults
      }
    }

    return NextResponse.json({
      categories: categories
        .filter((c: any) => c.is_active !== false)
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    });
  } catch (error) {
    console.error('Public tour categories error:', error);
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}
