require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Fixing Cultural Triangle Experience image URL format...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCulturalTriangle() {
  try {
    // Update with working Cloudinary URL format (with q_auto,f_auto like other tours)
    const { error } = await supabase
      .from('tours')
      .update({
        hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911266/punakha_bmddrk.jpg',
        hero_image_public_id: 'punakha_bmddrk'
      })
      .eq('title', 'Cultural Triangle Experience');

    if (error) throw error;

    console.log('✅ Updated Cultural Triangle Experience image URL');

    // Verify the update
    const { data: tour } = await supabase
      .from('tours')
      .select('*')
      .eq('title', 'Cultural Triangle Experience')
      .single();

    if (tour) {
      console.log('\n📊 Updated tour:');
      console.log(`   Title: ${tour.title}`);
      console.log(`   Position: #6 (6th card)`);
      console.log(`   Image: ${tour.hero_image_url}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixCulturalTriangle();