import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { mergeAboutContent } from '@/lib/content/about';
import { CONTACT_DEFAULTS, mergeContactContent } from '@/lib/content/contact';
import { HOME_DEFAULTS, mergeHomeContent } from '@/lib/content/home';
import {
  mergeLegalContent,
  PRIVACY_DEFAULTS,
  TERMS_DEFAULTS,
} from '@/lib/content/legal';

export const dynamic = 'force-dynamic';

// GET /api/content - Public endpoint to fetch active page content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('type'); // 'about', 'contact', 'faq', 'travel-info'

    if (!pageType) {
      return NextResponse.json({ error: 'Page type is required' }, { status: 400 });
    }

    let supabase;
    try {
      supabase = await createClient();
    } catch (error) {
      console.error('Supabase connection error, using default content:', error);
      return NextResponse.json({
        content: normalizePublicContent(pageType, null),
        metadata: {},
      });
    }

    let { data, error } = await supabase
      .from('content_pages')
      .select('content, metadata')
      .eq('page_type', pageType)
      .eq('is_active', true)
      .maybeSingle();

    // Fall back if is_active filter misses a saved row
    if (error || !data?.content) {
      const fallback = await supabase
        .from('content_pages')
        .select('content, metadata')
        .eq('page_type', pageType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallback.data?.content) {
        data = fallback.data;
        error = null;
      }
    }

    if (error || !data?.content) {
      console.log('No CMS content found, using defaults:', error?.message);
      return NextResponse.json({
        content: normalizePublicContent(pageType, null),
        metadata: {},
      });
    }

    return NextResponse.json(
      {
        content: normalizePublicContent(pageType, data.content),
        metadata: data.metadata || {},
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function normalizePublicContent(pageType: string, raw: unknown) {
  if (pageType === 'about') {
    return mergeAboutContent(raw);
  }
  if (pageType === 'contact') {
    return mergeContactContent(raw);
  }
  if (pageType === 'home') {
    return mergeHomeContent(raw);
  }
  if (pageType === 'privacy') {
    return mergeLegalContent(raw, PRIVACY_DEFAULTS);
  }
  if (pageType === 'terms') {
    return mergeLegalContent(raw, TERMS_DEFAULTS);
  }
  return raw || getDefaultContent(pageType);
}

function getDefaultContent(pageType: string) {
  const defaults: Record<string, any> = {
    about: mergeAboutContent(null),
    home: mergeHomeContent(null),
    contact: {
      ...CONTACT_DEFAULTS,
      socialMedia: { ...CONTACT_DEFAULTS.socialMedia },
      formFields: {
        showName: true,
        showEmail: true,
        showPhone: true,
        showTravelDates: true,
        showGroupSize: true,
        showMessage: true,
        requiredFields: ['name', 'email', 'message'],
      },
    },
    privacy: mergeLegalContent(null, PRIVACY_DEFAULTS),
    terms: mergeLegalContent(null, TERMS_DEFAULTS),
    faq: {
      hero: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to common questions about traveling to Bhutan',
        backgroundImage:
          'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140716/sacred-himalaya/generated-taktsang.png',
      },
      categories: ['General', 'Safety', 'Preparation', 'Booking'],
    },
    'travel-info': {
      hero: {
        title: 'Travel Information',
        subtitle: 'Essential tips and information for your Bhutan journey',
      },
      sections: [],
    },
  };

  return defaults[pageType] || {};
}
