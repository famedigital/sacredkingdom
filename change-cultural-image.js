require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Changing Cultural Triangle Experience to different image...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function changeCulturalImage() {
  try {
    // Use Tiger's Nest image (we know this works)
    const { error } = await supabase
      .from('tours')
      .update({
        hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911267/tigernest_paro_wdenqu.jpg',
        hero_image_public_id: 'tigernest_paro_wdenqu'
      })
      .eq('title', 'Cultural Triangle Experience');

    if (error) throw error;

    console.log('✅ Changed Cultural Triangle Experience to Tiger\'s Nest image');

    // Verify the change
    const { data: tour } = await supabase
      .from('tours')
      .select('*')
      .eq('title', 'Cultural Triangle Experience')
      .single();

    if (tour) {
      console.log('\n📊 Updated tour:');
      console.log(`   Title: ${tour.title}`);
      console.log(`   Position: 6th card on homepage`);
      console.log(`   New Image: ${tour.hero_image_url}`);
      console.log(`   Image Type: Tiger\'s Nest (tested working image)`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

changeCulturalImage();