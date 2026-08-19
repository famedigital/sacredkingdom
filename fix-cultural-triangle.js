require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Fixing Cultural Triangle Experience image...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCulturalTriangle() {
  try {
    // Fix Cultural Triangle Experience with working image
    const { error } = await supabase
      .from('tours')
      .update({
        hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg',
        hero_image_public_id: 'punakhadzong_xkcrcu'
      })
      .eq('title', 'Cultural Triangle Experience');

    if (error) throw error;

    console.log('✅ Updated Cultural Triangle Experience image');

    // Verify the update
    const { data: tour } = await supabase
      .from('tours')
      .select('*')
      .eq('title', 'Cultural Triangle Experience')
      .single();

    if (tour) {
      console.log('\n📊 Updated image:');
      console.log(`   Title: ${tour.title}`);
      console.log(`   Image: ${tour.hero_image_url}`);
      console.log(`   Public ID: ${tour.hero_image_public_id}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixCulturalTriangle();