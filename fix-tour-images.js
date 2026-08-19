require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Fixing tour images...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTourImages() {
  try {
    // Fix Cultural Triangle Experience (2nd tour) with working image
    const { error } = await supabase
      .from('tours')
      .update({
        hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911266/punakha_bmddrk.jpg',
        hero_image_public_id: 'punakha_bmddrk'
      })
      .eq('title', 'Cultural Triangle Experience');

    if (error) throw error;

    console.log('✅ Updated Cultural Triangle Experience image');

    // Check all tours to make sure images are loading
    const { data: tours } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    console.log('\n📊 All tour images:');
    tours.forEach((tour, index) => {
      console.log(`\n${index + 1}. ${tour.title}`);
      console.log(`   Image: ${tour.hero_image_url}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixTourImages();