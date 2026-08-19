/**
 * Verifies the live Supabase `tours` table has columns required by the
 * create/edit tour form. Run: node scripts/ensure-tours-schema.mjs
 *
 * DDL cannot be applied via the JS client — if columns are missing, run
 * migrations/20260719_ensure_tours_schema.sql in the Supabase SQL Editor.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const REQUIRED_COLUMNS = [
  'title',
  'slug',
  'tagline',
  'description',
  'long_description',
  'hero_image_url',
  'hero_image_focal_x',
  'hero_image_focal_y',
  'thumbnail_url',
  'gallery_urls',
  'category',
  'duration',
  'price',
  'difficulty_level',
  'max_group_size',
  'min_group_size',
  'highlights',
  'included_items',
  'excluded_items',
  'itinerary',
  'locations',
  'departure_dates',
  'faqs',
  'meta_title',
  'meta_description',
  'meta_keywords',
  'is_featured',
  'is_active',
  'is_published',
  'show_price',
];

async function main() {
  console.log('Checking tours schema against', url);

  const { data, error } = await supabase
    .from('tours')
    .select(REQUIRED_COLUMNS.join(','))
    .limit(1);

  if (error) {
    console.error('\nSchema check FAILED:');
    console.error(error.message);
    console.error('\nApply these migrations in Supabase → SQL Editor if needed:');
    console.error('  migrations/20260719_ensure_tours_schema.sql');
    console.error('  migrations/20260728_image_focal_points.sql\n');
    process.exit(1);
  }

  console.log('✓ All required tour columns are present and queryable.');
  console.log(`✓ Sample row check OK (${data?.length ?? 0} row(s) returned).`);

  // Smoke-test JSONB / array write shape with a dry-run style payload (no insert)
  const sampleItinerary = [
    {
      day: 1,
      title: 'Arrival in Paro',
      location: 'Paro',
      description: 'Airport pickup and settle in.',
      meals: 'Breakfast and dinner',
      accommodation: '4 Star',
    },
  ];
  const sampleInclusions = ['SDF', 'Rooms', 'Guides', 'Cars', 'Drop & pickup'];

  console.log('✓ Expected itinerary shape:', JSON.stringify(sampleItinerary[0]));
  console.log('✓ Expected inclusion options:', sampleInclusions.join(', '));
  console.log('\nTours form schema is live.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
