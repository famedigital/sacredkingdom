/**
 * Align nav category slugs with tour.category values.
 * Fixes mismatch: filters used international-package / regional-pacakage
 * while most tours still stored international / regional.
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function canonicalCategory(value) {
  const raw = (value || '').toLowerCase().trim();
  if (!raw) return raw;
  if (raw.includes('regional')) return 'regional';
  if (raw.includes('international')) return 'international';
  return raw;
}

const FIXED_CATEGORIES = [
  {
    id: 'international',
    name: 'International Tour',
    slug: 'international',
    description: 'Tours for international travelers',
    sort_order: 0,
    is_active: true,
  },
  {
    id: 'regional',
    name: 'Regional Tour',
    slug: 'regional',
    description: 'Regional and local tours',
    sort_order: 1,
    is_active: true,
  },
];

const { data: setting, error: settingErr } = await sb
  .from('site_settings')
  .select('id, value')
  .eq('key', 'tour_categories')
  .maybeSingle();

if (settingErr) {
  console.error('Failed to load categories setting:', settingErr);
  process.exit(1);
}

if (setting?.id) {
  const { error } = await sb
    .from('site_settings')
    .update({
      value: JSON.stringify(FIXED_CATEGORIES),
      updated_at: new Date().toISOString(),
    })
    .eq('id', setting.id);
  if (error) {
    console.error('Failed to update categories:', error);
    process.exit(1);
  }
  console.log('✓ Updated site_settings.tour_categories slugs → international / regional');
} else {
  console.log('No tour_categories setting found; skipping settings update');
}

const { data: tours, error: toursErr } = await sb.from('tours').select('id, title, category');
if (toursErr) {
  console.error(toursErr);
  process.exit(1);
}

let updated = 0;
for (const tour of tours || []) {
  const next = canonicalCategory(tour.category);
  if (next && next !== tour.category) {
    const { error } = await sb.from('tours').update({ category: next }).eq('id', tour.id);
    if (error) {
      console.error(`Failed to update ${tour.title}:`, error.message);
      continue;
    }
    console.log(`✓ ${tour.title}: ${tour.category} → ${next}`);
    updated += 1;
  } else {
    console.log(`· ${tour.title}: ${tour.category}`);
  }
}

console.log(`\nDone. Remapped ${updated} tour(s).`);
