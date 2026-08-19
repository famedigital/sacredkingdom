import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/jwt';

async function upsertSetting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string,
  value: unknown,
  category: string,
  description: string,
  is_public = true
) {
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('site_settings')
      .update({
        value,
        category,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key);
  } else {
    await supabase.from('site_settings').insert({
      key,
      value,
      category,
      description,
      is_public,
    });
  }
}

// GET /api/admin/settings - Get all settings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const supabase = await createClient();

    let query = supabase
      .from('site_settings')
      .select('*')
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query;

    if (error) throw error;

    // Convert array to object for easier frontend use
    const settingsObject = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>) || {};

    return NextResponse.json({
      settings: settingsObject,
      raw: settings,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST /api/admin/settings - Create or update setting
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value, category, description, is_public } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if setting exists
    const { data: existing } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('site_settings')
        .update({
          value,
          category: category || existing.category,
          description: description || existing.description,
          is_public: is_public !== undefined ? is_public : existing.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      result = data;

      // Log the update
      await supabase.from('audit_logs').insert({
        user_id: user.userId,
        user_name: user.name,
        user_email: user.email,
        action: 'update',
        entity_type: 'setting',
        entity_id: result.id,
        entity_title: key,
        old_values: existing,
        new_values: result,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null,
      });
    } else {
      // Create new
      const { data, error } = await supabase
        .from('site_settings')
        .insert({
          key,
          value,
          category: category || 'general',
          description: description || '',
          is_public: is_public !== undefined ? is_public : false,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;

      // Log the creation
      await supabase.from('audit_logs').insert({
        user_id: user.userId,
        user_name: user.name,
        user_email: user.email,
        action: 'create',
        entity_type: 'setting',
        entity_id: result.id,
        entity_title: key,
        new_values: result,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null,
      });
    }

    // Mirror company name / tagline / socials from SEO blob for public brand + footer
    if (key === 'seo_settings' && value && typeof value === 'object') {
      const seo = value as Record<string, unknown>;
      if (typeof seo.site_name === 'string' && seo.site_name.trim()) {
        await upsertSetting(
          supabase,
          'site_name',
          seo.site_name.trim(),
          'general',
          'Company / site name shown across the public site and CRM'
        );
      }
      if (typeof seo.site_tagline === 'string' && seo.site_tagline.trim()) {
        await upsertSetting(
          supabase,
          'site_tagline',
          seo.site_tagline.trim(),
          'general',
          'Company tagline'
        );
      }
      if (typeof seo.social_instagram === 'string') {
        await upsertSetting(
          supabase,
          'social_instagram',
          seo.social_instagram.trim(),
          'seo',
          'Public Instagram profile URL'
        );
      }
      if (typeof seo.social_twitter === 'string') {
        await upsertSetting(
          supabase,
          'social_twitter',
          seo.social_twitter.trim(),
          'seo',
          'Public Twitter/X profile URL'
        );
      }
      if (typeof seo.social_tripadvisor === 'string') {
        await upsertSetting(
          supabase,
          'social_tripadvisor',
          seo.social_tripadvisor.trim(),
          'seo',
          'Public Tripadvisor listing URL'
        );
      }

      // Keep Contact CMS socialMedia in sync (footer primary source)
      const { data: contactPage } = await supabase
        .from('content_pages')
        .select('id, content')
        .eq('page_type', 'contact')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (contactPage?.id) {
        const content =
          contactPage.content && typeof contactPage.content === 'object'
            ? { ...(contactPage.content as Record<string, unknown>) }
            : {};
        const prevSocial =
          content.socialMedia && typeof content.socialMedia === 'object'
            ? { ...(content.socialMedia as Record<string, unknown>) }
            : {};
        delete prevSocial.youtube;
        const socialMedia = {
          ...prevSocial,
          ...(typeof seo.social_facebook === 'string'
            ? { facebook: seo.social_facebook.trim() }
            : {}),
          ...(typeof seo.social_twitter === 'string'
            ? { twitter: seo.social_twitter.trim() }
            : {}),
          ...(typeof seo.social_instagram === 'string'
            ? { instagram: seo.social_instagram.trim() }
            : {}),
          ...(typeof seo.social_linkedin === 'string'
            ? { linkedin: seo.social_linkedin.trim() }
            : {}),
          ...(typeof seo.social_tripadvisor === 'string'
            ? { tripadvisor: seo.social_tripadvisor.trim() }
            : {}),
        };
        await supabase
          .from('content_pages')
          .update({
            content: { ...content, socialMedia },
            updated_at: new Date().toISOString(),
          })
          .eq('id', contactPage.id);
      }

      revalidatePath('/');
      revalidatePath('/contact');
      revalidatePath('/', 'layout');
    }

    if (key === 'brand_logo') {
      revalidatePath('/');
      revalidatePath('/', 'layout');
    }

    if (key === 'mobile_nav') {
      revalidatePath('/');
      revalidatePath('/', 'layout');
    }

    if (key === 'public_palette' || key === 'public_layout') {
      revalidatePath('/');
      revalidatePath('/', 'layout');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// PUT /api/admin/settings/bulk - Bulk update settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body; // Array of {key, value, category, description}

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings must be an array' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const results = await Promise.all(
      settings.map(async (setting) => {
        const { key, value, category, description, is_public } = setting;

        // Check if setting exists
        const { data: existing } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', key)
          .single();

        if (existing) {
          const { data, error } = await supabase
            .from('site_settings')
            .update({
              value,
              category: category || existing.category,
              description: description || existing.description,
              is_public: is_public !== undefined ? is_public : existing.is_public,
              updated_at: new Date().toISOString(),
            })
            .eq('key', key)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase
            .from('site_settings')
            .insert({
              key,
              value,
              category: category || 'general',
              description: description || '',
              is_public: is_public !== undefined ? is_public : false,
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      })
    );

    // Log bulk update
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'update',
      entity_type: 'settings_bulk',
      new_values: { count: results.length, keys: results.map(r => r.key) },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    if (results.some((row) => row.key === 'public_palette' || row.key === 'public_layout')) {
      revalidatePath('/');
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      settings: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Bulk settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}