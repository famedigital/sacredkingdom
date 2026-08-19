import { createClient } from '@/utils/supabase/server'
import { mergeContactContent, type ContactContent } from '@/lib/content/contact'

/** Server-side Contact CMS fetch — same source admin Contact Settings edits. */
export async function getContactPageContent(): Promise<ContactContent> {
  try {
    // Use service-role server client (same as /api/content). Anon key is blocked by RLS
    // on content_pages and would silently fall back to hardcoded defaults.
    const supabase = await createClient()

    let { data, error } = await supabase
      .from('content_pages')
      .select('content, is_active')
      .eq('page_type', 'contact')
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data?.content) {
      const fallback = await supabase
        .from('content_pages')
        .select('content')
        .eq('page_type', 'contact')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fallback.data?.content) {
        return mergeContactContent(fallback.data.content)
      }

      return mergeContactContent(null)
    }

    return mergeContactContent(data.content)
  } catch (err) {
    console.error('[getContactPageContent]', err)
    return mergeContactContent(null)
  }
}
