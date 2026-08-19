// Fix Druk Path hero image (currently showing Punakha Dzong)
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDrukPathHeroImage() {
  console.log('Fixing Druk Path Trek hero image (currently Punakha Dzong)...');

  // Use a proper mountain/trekking image for both hero and thumbnail
  // Bumthang is perfect - beautiful mountain landscape
  const heroImageUrl = 'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911270/bumthang_bdxytr.jpg';
  const heroImagePublicId = 'bumthang_bdxytr';

  try {
    const { data, error } = await supabase
      .from('tours')
      .update({
        hero_image_url: heroImageUrl,
        hero_image_public_id: heroImagePublicId,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'druk-path-trek');

    if (error) {
      console.error('Error updating tour:', error);
      return;
    }

    console.log('✅ Successfully fixed Druk Path Trek hero image!');
    console.log('\nNew hero image URL:', heroImageUrl);
    console.log('New hero image public ID:', heroImagePublicId);

    console.log('\nThis will fix the homepage thumbnail issue.');
    console.log('The TourCard was using hero_image_url (Punakha Dzong) instead of thumbnail_url.');

    // Verify the update
    const { data: tour, error: fetchError } = await supabase
      .from('tours')
      .select('title, hero_image_url, thumbnail_url')
      .eq('slug', 'druk-path-trek')
      .single();

    if (fetchError) {
      console.error('Error verifying update:', fetchError);
      return;
    }

    console.log('\n=== Verification ===');
    console.log('Tour:', tour.title);
    console.log('Hero Image URL:', tour.hero_image_url);
    console.log('Thumbnail URL:', tour.thumbnail_url);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixDrukPathHeroImage();