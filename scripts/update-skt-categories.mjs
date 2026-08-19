import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i < 1) continue
  const k = t.slice(0, i)
  const v = t.slice(i + 1)
  if (!process.env[k]) process.env[k] = v
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const categories = [
  { id: 'cultural', name: 'Cultural Trip', slug: 'cultural', sort_order: 0, is_active: true },
  { id: 'festivals', name: 'Festival Tour', slug: 'festivals', sort_order: 1, is_active: true },
  { id: 'trekking', name: 'Trekking', slug: 'trekking', sort_order: 2, is_active: true },
  { id: 'wildlife', name: 'Wildlife', slug: 'wildlife', sort_order: 3, is_active: true },
]

async function remap(from, to) {
  const { error } = await supabase.from('tours').update({ category: to }).eq('category', from)
  if (error) throw error
}

async function main() {
  const { error: settingsError } = await supabase.from('site_settings').upsert(
    {
      key: 'tour_categories',
      value: JSON.stringify(categories),
      category: 'tours',
      description: 'Trip navigation categories matching sacredkingdom.travel',
      is_public: true,
      sort_order: 0,
    },
    { onConflict: 'key' }
  )
  if (settingsError) throw settingsError
  console.log('tour_categories')

  await remap('heritage-culture', 'cultural')
  await remap('trekkings', 'trekking')
  await remap('trekking', 'trekking')

  const { error: wildlifeError } = await supabase
    .from('tours')
    .update({ category: 'wildlife' })
    .eq('slug', 'bhutan-nature-wildlife-conservation-tour')
  if (wildlifeError) throw wildlifeError
  console.log('tour category remaps')

  const { error: heroError } = await supabase
    .from('hero_slides')
    .update({ cta_text: 'Plan your Trip', cta_link: '/contact#contact-form' })
    .gte('slide_order', 0)
  if (heroError) throw heroError
  console.log('hero CTAs')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
