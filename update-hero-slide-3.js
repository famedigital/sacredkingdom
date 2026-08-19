require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Updating 3rd hero slide image...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateHeroSlide() {
  try {
    // New image for slide 3 - Phobjikha Valley (beautiful landscape)
    const newImageUrl = 'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911323/phobjikha1_ddflbj.jpg';
    const newImagePublicId = 'phobjikha1_ddflbj';

    const { data, error } = await supabase
      .from('hero_slides')
      .update({
        image_url: newImageUrl,
        image_public_id: newImagePublicId
      })
      .eq('slide_order', 3);

    if (error) throw error;

    console.log('✅ Successfully updated 3rd hero slide!');
    console.log('New image URL:', newImageUrl);
    console.log('New image Public ID:', newImagePublicId);

  } catch (error) {
    console.error('❌ Error updating hero slide:', error.message);
  }
}

updateHeroSlide();