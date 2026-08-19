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

const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'cloudinary-map.json'), 'utf8'))
const img = (id) => map[id]

async function main() {
  const { error } = await supabase.from('site_settings').upsert(
    [
      { key: 'site_name', value: 'Sacred Kingdom Travel', category: 'general', is_public: true },
      { key: 'contact_email', value: 'sacredkingdomtravel@gmail.com', category: 'general', is_public: true },
      { key: 'contact_phone', value: '+975 77888822', category: 'general', is_public: true },
      {
        key: 'contact_address',
        value: 'Changlam Plaza, Room No. 502, P.O. Box 1459, Thimphu, Bhutan',
        category: 'general',
        is_public: true,
      },
    ],
    { onConflict: 'key' }
  )
  if (error) throw error
  console.log('settings ok')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
