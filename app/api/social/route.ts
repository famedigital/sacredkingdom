import { NextResponse } from 'next/server';
import { isLegacyCloneValue } from '@/lib/content/contact';
import { SOCIAL_DEFAULTS } from '@/lib/content/social';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function readUrl(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') {
    const t = v.trim();
    return t && t !== '#' ? t : null;
  }
  if (typeof v === 'object' && v !== null && 'value' in v) {
    return readUrl((v as { value: unknown }).value);
  }
  const t = String(v).trim();
  return t && t !== '#' ? t : null;
}

/**
 * Public Facebook / Instagram URLs for the site footer.
 * Reads flat keys and the nested Admin → SEO → Social Media blob (`seo_settings`).
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        facebook: null,
        twitter: null,
        instagram: null,
        linkedin: null,
        tripadvisor: SOCIAL_DEFAULTS.tripadvisor,
      });
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'social_facebook',
        'social_twitter',
        'social_instagram',
        'social_linkedin',
        'social_tripadvisor',
        'seo_settings',
      ]);

    const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]));

    let seoBlob: Record<string, unknown> = {};
    const rawSeo = map.seo_settings;
    if (rawSeo && typeof rawSeo === 'object' && !Array.isArray(rawSeo)) {
      seoBlob = rawSeo as Record<string, unknown>;
    } else if (typeof rawSeo === 'string') {
      try {
        const parsed = JSON.parse(rawSeo);
        if (parsed && typeof parsed === 'object') seoBlob = parsed;
      } catch {
        // ignore invalid JSON
      }
    }

    const facebookRaw =
      readUrl(map.social_facebook) ||
      readUrl(seoBlob.social_facebook) ||
      null;
    const twitterRaw =
      readUrl(map.social_twitter) ||
      readUrl(seoBlob.social_twitter) ||
      null;
    const instagramRaw =
      readUrl(map.social_instagram) ||
      readUrl(seoBlob.social_instagram) ||
      null;
    const linkedinRaw =
      readUrl(map.social_linkedin) ||
      readUrl(seoBlob.social_linkedin) ||
      null;
    const tripadvisorRaw =
      readUrl(map.social_tripadvisor) ||
      readUrl(seoBlob.social_tripadvisor) ||
      SOCIAL_DEFAULTS.tripadvisor;
    const facebook = facebookRaw && !isLegacyCloneValue(facebookRaw) ? facebookRaw : null;
    const twitter = twitterRaw && !isLegacyCloneValue(twitterRaw) ? twitterRaw : null;
    const instagram = instagramRaw && !isLegacyCloneValue(instagramRaw) ? instagramRaw : null;
    const linkedin = linkedinRaw && !isLegacyCloneValue(linkedinRaw) ? linkedinRaw : null;
    const tripadvisor =
      tripadvisorRaw && !isLegacyCloneValue(tripadvisorRaw)
        ? tripadvisorRaw
        : SOCIAL_DEFAULTS.tripadvisor;

    return NextResponse.json(
      { facebook, twitter, instagram, linkedin, tripadvisor },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Public social API error:', error);
    return NextResponse.json({
      facebook: null,
      twitter: null,
      instagram: null,
      linkedin: null,
      tripadvisor: SOCIAL_DEFAULTS.tripadvisor,
    });
  }
}
