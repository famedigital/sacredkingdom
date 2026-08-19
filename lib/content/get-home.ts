import { createClient } from '@/utils/supabase/server'
import { mergeHomeContent, type HomeContent } from '@/lib/content/home'

/** Server-side homepage CMS fetch — same source admin edits. */
export async function getHomePageContent(): Promise<HomeContent> {
  try {
    const supabase = await createClient()

    let { data, error } = await supabase
      .from('content_pages')
      .select('content, is_active')
      .eq('page_type', 'home')
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data?.content) {
      const fallback = await supabase
        .from('content_pages')
        .select('content')
        .eq('page_type', 'home')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fallback.data?.content) {
        return mergeHomeContent(fallback.data.content)
      }

      return mergeHomeContent(null)
    }

    return mergeHomeContent(data.content)
  } catch (err) {
    console.error('[getHomePageContent]', err)
    return mergeHomeContent(null)
  }
}
