const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkHeroSlides() {
  console.log('Checking Hero Slides...');

  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('slide_order', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No active hero slides found');
    return;
  }

  console.log('Found', data.length, 'hero slides:');
  data.forEach((slide, i) => {
    console.log(`Slide ${i+1}:`, slide.title);
    console.log('  Image:', slide.image_url);
    console.log('  Active:', slide.is_active);
    console.log('  Order:', slide.slide_order);
    console.log('---');
  });
}

checkHeroSlides().then(() => process.exit(0));