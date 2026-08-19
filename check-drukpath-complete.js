// Check Druk Path Trek complete data
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDrukPathComplete() {
  console.log('Fetching Druk Path Trek complete data...');

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', 'druk-path-trek')
    .single();

  if (error) {
    console.error('Error fetching tour:', error);
    return;
  }

  console.log('\n=== Druk Path Trek Complete Data ===');
  console.log('Title:', data.title);
  console.log('Slug:', data.slug);
  console.log('\n=== Image Data ===');
  console.log('Hero Image URL:', data.hero_image_url);
  console.log('Thumbnail URL:', data.thumbnail_url);
  console.log('Thumbnail Public ID:', data.thumbnail_public_id);
  console.log('\n=== Itinerary Data ===');
  console.log('Has Itinerary:', data.itinerary ? 'YES' : 'NO');
  if (data.itinerary) {
    console.log('Number of Days:', data.itinerary.length);
    console.log('Itinerary:', JSON.stringify(data.itinerary, null, 2));
  } else {
    console.log('❌ No itinerary found!');
  }
  console.log('\n=== Active Status ===');
  console.log('Is Active:', data.is_active);
  console.log('Is Featured:', data.is_featured);
  console.log('Sort Order:', data.sort_order);
}

checkDrukPathComplete();