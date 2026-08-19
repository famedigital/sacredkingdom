require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Updating Punakha Dzong images...');
const supabase = createClient(supabaseUrl, supabaseKey);

const newPunakhaUrl = 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg';
const newPunakhaPublicId = 'punakhadzong_xkcrcu';

async function updatePunakhaImages() {
  try {
    // Update hero slides with Punakha Dzong
    const { data: heroSlides, error: heroError } = await supabase
      .from('hero_slides')
      .select('*')
      .ilike('title', '%punakha%');

    if (heroError) throw heroError;

    console.log(`Found ${heroSlides.length} hero slides with Punakha`);

    if (heroSlides.length > 0) {
      const { error: updateHeroError } = await supabase
        .from('hero_slides')
        .update({
          image_url: newPunakhaUrl,
          image_public_id: newPunakhaPublicId
        })
        .ilike('title', '%punakha%');

      if (updateHeroError) throw updateHeroError;
      console.log('✅ Updated hero slides with new Punakha Dzong image');
    }

    console.log('\n📊 Updated image URL:', newPunakhaUrl);
    console.log('📊 Public ID:', newPunakhaPublicId);

  } catch (error) {
    console.error('❌ Error updating images:', error.message);
  }
}

updatePunakhaImages();