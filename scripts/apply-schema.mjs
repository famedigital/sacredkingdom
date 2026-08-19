import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv() {
  const file = path.join(root, '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const k = t.slice(0, i)
    const v = t.slice(i + 1)
    if (!process.env[k]) process.env[k] = v
  }
}

loadEnv()

const extras = `
ALTER TABLE tours ADD COLUMN IF NOT EXISTS duration_nights INTEGER;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title_color VARCHAR(32);
ALTER TABLE testimonials ALTER COLUMN image_public_id DROP NOT NULL;
ALTER TABLE testimonials ALTER COLUMN image_url DROP NOT NULL;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS public_read ON public.%I', r.tablename);
    EXECUTE format('CREATE POLICY public_read ON public.%I FOR SELECT USING (true)', r.tablename);
  END LOOP;
END $$;
`

const files = [
  'DEPLOY_DATABASE.sql',
  'dynamic-content-schema.sql',
  'migrations/20260719_ensure_tours_schema.sql',
  'migrations/20260719_add_show_price.sql',
  'migrations/20260804_hero_title_color.sql',
  'migrations/20260728_image_focal_points.sql',
]

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL missing')
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  console.log('connected')
  for (const rel of files) {
    const full = path.join(root, rel)
    if (!fs.existsSync(full)) {
      console.warn('missing', rel)
      continue
    }
    const sql = fs.readFileSync(full, 'utf8')
    try {
      await client.query(sql)
      console.log('applied', rel)
    } catch (err) {
      console.error('error', rel, err.message)
    }
  }
  try {
    await client.query(extras)
    console.log('applied extras + rls')
  } catch (err) {
    console.error('extras', err.message)
  }
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
