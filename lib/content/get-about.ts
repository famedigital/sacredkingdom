import { createClient } from '@/utils/supabase/server'
import { mergeAboutContent, type AboutContent } from '@/lib/content/about'

/** Server-side About CMS fetch — same source admin edits. */
export async function getAboutPageContent(): Promise<AboutContent> {
  try {
    const supabase = await createClient()

    // Prefer active row; fall back to any about row (in case is_active wasn't set on save)
    let { data, error } = await supabase
      .from('content_pages')
      .select('content, is_active')
      .eq('page_type', 'about')
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data?.content) {
      const fallback = await supabase
        .from('content_pages')
        .select('content')
        .eq('page_type', 'about')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fallback.data?.content) {
        return mergeAboutContent(fallback.data.content)
      }

      return mergeAboutContent(null)
    }

    return mergeAboutContent(data.content)
  } catch (err) {
    console.error('[getAboutPageContent]', err)
    return mergeAboutContent(null)
  }
}
