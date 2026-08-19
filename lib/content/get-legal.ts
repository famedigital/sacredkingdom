import { createClient } from '@/utils/supabase/server'
import {
  mergeLegalContent,
  PRIVACY_DEFAULTS,
  TERMS_DEFAULTS,
  type LegalPageContent,
} from '@/lib/content/legal'

async function getLegalPageContent(
  pageType: 'privacy' | 'terms',
  defaults: LegalPageContent
): Promise<LegalPageContent> {
  try {
    const supabase = await createClient()

    let { data, error } = await supabase
      .from('content_pages')
      .select('content, is_active')
      .eq('page_type', pageType)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data?.content) {
      const fallback = await supabase
        .from('content_pages')
        .select('content')
        .eq('page_type', pageType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fallback.data?.content) {
        return mergeLegalContent(fallback.data.content, defaults)
      }

      return mergeLegalContent(null, defaults)
    }

    return mergeLegalContent(data.content, defaults)
  } catch (err) {
    console.error(`[getLegalPageContent:${pageType}]`, err)
    return mergeLegalContent(null, defaults)
  }
}

export async function getPrivacyPageContent(): Promise<LegalPageContent> {
  return getLegalPageContent('privacy', PRIVACY_DEFAULTS)
}

export async function getTermsPageContent(): Promise<LegalPageContent> {
  return getLegalPageContent('terms', TERMS_DEFAULTS)
}
