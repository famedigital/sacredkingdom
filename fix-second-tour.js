require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Fixing 2nd tour card image...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSecondTour() {
  try {
    // Fix Druk Path Trek (2nd tour) with working image
    const { error } = await supabase
      .from('tours')
      .update({
        hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911267/tigernest_paro_wdenqu.jpg',
        hero_image_public_id: 'tigernest_paro_wdenqu'
      })
      .eq('title', 'Druk Path Trek');

    if (error) throw error;

    console.log('✅ Updated Druk Path Trek image');

    // Verify all tours
    const { data: tours } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    console.log('\n📊 Current tour images:');
    tours.forEach((tour, index) => {
      console.log(`\n${index + 1}. ${tour.title}`);
      console.log(`   Image: ${tour.hero_image_url}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSecondTour();