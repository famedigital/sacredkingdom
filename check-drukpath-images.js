// Check all Druk Path images
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllImages() {
  console.log('Checking all Druk Path Trek images...');

  const { data, error } = await supabase
    .from('tours')
    .select('title, hero_image_url, thumbnail_url, thumbnail_public_id, hero_image_public_id')
    .eq('slug', 'druk-path-trek')
    .single();

  if (error) {
    console.error('Error fetching tour:', error);
    return;
  }

  console.log('\n=== Current Druk Path Images ===');
  console.log('Tour:', data.title);
  console.log('\nHero Image URL:', data.hero_image_url);
  console.log('Hero Public ID:', data.hero_image_public_id);
  console.log('\nThumbnail URL:', data.thumbnail_url);
  console.log('Thumbnail Public ID:', data.thumbnail_public_id);

  // Check if it's Punakha
  if (data.thumbnail_url && data.thumbnail_url.includes('punakha')) {
    console.log('\n❌ ISSUE FOUND: Thumbnail is showing Punakha Dzong!');
    console.log('This needs to be changed to a mountain/trekking image.');
  }
}

checkAllImages();