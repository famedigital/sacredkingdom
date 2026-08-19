require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Checking tour images...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTourImages() {
  try {
    const { data: tours, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    console.log(`\n📊 Found ${tours.length} tours:\n`);

    tours.forEach((tour, index) => {
      console.log(`\n${index + 1}. ${tour.title}`);
      console.log(`   Hero Image: ${tour.hero_image_url || tour.hero_image || 'MISSING'}`);
      console.log(`   Public ID: ${tour.hero_image_public_id || 'MISSING'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTourImages();