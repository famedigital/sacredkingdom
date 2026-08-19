import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { HOME_DEFAULTS } from '@/lib/content/home';
import { ABOUT_DEFAULTS } from '@/lib/content/about';
import { CONTACT_DEFAULTS } from '@/lib/content/contact';

// GET /api/admin/content - Fetch any page content
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('type'); // 'about', 'contact', 'faq', 'travel-info'

    const supabase = await createClient();

    if (pageType) {
      // Fetch specific page content
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('page_type', pageType)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No content found, return default structure
          return NextResponse.json({ content: getDefaultContent(pageType) });
        }
        throw error;
      }

      return NextResponse.json({ content: data.content, metadata: data.metadata });
    } else {
      // Fetch all active pages
      const { data, error } = await supabase
        .from('content_pages')
        .select('page_type, metadata->seoTitle as title, metadata->seoDescription as description, updated_at')
        .eq('is_active', true)
        .order('page_type');

      if (error) throw error;

      return NextResponse.json({ pages: data });
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/content - Update page content
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pageType, content, metadata } = body;

    if (!pageType || !content) {
      return NextResponse.json(
        { error: 'Page type and content are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if page content already exists
    const { data: existing } = await supabase
      .from('content_pages')
      .select('id')
      .eq('page_type', pageType)
      .single();

    let result;

    if (existing) {
      // Update existing content — keep page publicly visible
      const { data, error } = await supabase
        .from('content_pages')
        .update({
          content,
          metadata: metadata || {},
          is_active: true,
          updated_at: new Date().toISOString(),
          updated_by: currentUser.userId,
        })
        .eq('page_type', pageType)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new content page
      const { data, error } = await supabase
        .from('content_pages')
        .insert({
          page_type: pageType,
          content,
          metadata: metadata || {},
          is_active: true,
          created_by: currentUser.userId,
          updated_by: currentUser.userId,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: currentUser.userId,
      user_name: currentUser.name,
      user_email: currentUser.email,
      action: 'update',
      entity_type: 'content_page',
      entity_id: result.id,
      entity_title: pageType,
      new_values: { content, metadata },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    if (pageType === 'contact') {
      // Mirror FB/IG into site_settings so SEO + /api/social stay aligned
      const social =
        content.socialMedia && typeof content.socialMedia === 'object'
          ? (content.socialMedia as Record<string, unknown>)
          : {};
      const facebook =
        typeof social.facebook === 'string' ? social.facebook.trim() : '';
      const twitter =
        typeof social.twitter === 'string' ? social.twitter.trim() : '';
      const instagram =
        typeof social.instagram === 'string' ? social.instagram.trim() : '';
      const linkedin =
        typeof social.linkedin === 'string' ? social.linkedin.trim() : '';
      const tripadvisor =
        typeof social.tripadvisor === 'string' ? social.tripadvisor.trim() : '';

      const upsertFlat = async (key: string, value: string, description: string) => {
        const { data: row } = await supabase
          .from('site_settings')
          .select('id')
          .eq('key', key)
          .maybeSingle();
        if (row) {
          await supabase
            .from('site_settings')
            .update({
              value,
              category: 'seo',
              description,
              updated_at: new Date().toISOString(),
            })
            .eq('key', key);
        } else {
          await supabase.from('site_settings').insert({
            key,
            value,
            category: 'seo',
            description,
            is_public: true,
          });
        }
      };

      if (facebook) {
        await upsertFlat('social_facebook', facebook, 'Public Facebook profile URL');
      }
      if (twitter) {
        await upsertFlat('social_twitter', twitter, 'Public Twitter/X profile URL');
      }
      if (instagram) {
        await upsertFlat('social_instagram', instagram, 'Public Instagram profile URL');
      }
      if (linkedin) {
        await upsertFlat('social_linkedin', linkedin, 'Public LinkedIn profile URL');
      }
      if (tripadvisor) {
        await upsertFlat('social_tripadvisor', tripadvisor, 'Public Tripadvisor listing URL');
      }

      revalidatePath('/contact');
      revalidatePath('/');
      revalidatePath('/', 'layout');
    } else if (pageType === 'about') {
      revalidatePath('/about');
    } else if (pageType === 'home') {
      revalidatePath('/');
      revalidatePath('/', 'layout');
    } else if (pageType === 'privacy') {
      revalidatePath('/privacy');
    } else if (pageType === 'terms') {
      revalidatePath('/terms');
    }

    return NextResponse.json({
      success: true,
      content: result,
      message: `${pageType} page updated successfully`
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get default content structure
function getDefaultContent(pageType: string) {
  const defaults: Record<string, any> = {
    about: ABOUT_DEFAULTS,
    home: HOME_DEFAULTS,
    contact: CONTACT_DEFAULTS,
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: '',
      sections: [],
      cta: { title: '', subtitle: '' },
    },
    terms: {
      title: 'Terms & Conditions',
      lastUpdated: '',
      sections: [],
      cta: { title: '', subtitle: '' },
    },
    faq: {
      hero: { title: 'Frequently Asked Questions', subtitle: 'Find answers' },
      categories: []
    },
    'travel-info': {
      hero: { title: 'Travel Information', subtitle: 'Essential travel tips' },
      sections: []
    }
  };

  return defaults[pageType] || {};
}