// Check Cultural Triangle Experience tour data
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCulturalTour() {
  console.log('Fetching Cultural Triangle Experience tour...');

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .or('title.ilike.%Cultural Triangle%,slug.ilike.%cultural-triangle%');

  if (error) {
    console.error('Error fetching tour:', error);
    return;
  }

  console.log('\n=== Cultural Triangle Experience Tours ===');
  console.log(JSON.stringify(data, null, 2));

  if (data && data.length > 0) {
    const tour = data[0];
    console.log('\n=== Current Image Data ===');
    console.log('Hero Image URL:', tour.hero_image_url);
    console.log('Thumbnail URL:', tour.thumbnail_url);
    console.log('Hero Image Public ID:', tour.hero_image_public_id);
    console.log('Thumbnail Public ID:', tour.thumbnail_public_id);
  }
}

checkCulturalTour();