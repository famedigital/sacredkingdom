// Test Druk Path thumbnail and fix if needed
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDrukPathThumbnail() {
  console.log('Checking Druk Path Trek thumbnail issue...');

  // Try a different, more reliable image
  // Using Bumthang which is a beautiful mountain region
  const newThumbnailUrl = 'https://res.cloudinary.com/hckgrdeh/image/upload/w_600,h_400,c_fill,q_auto,f_auto/v1782911270/bumthang_bdxytr.jpg';
  const newThumbnailPublicId = 'bumthang_bdxytr';

  try {
    const { data, error } = await supabase
      .from('tours')
      .update({
        thumbnail_url: newThumbnailUrl,
        thumbnail_public_id: newThumbnailPublicId,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'druk-path-trek');

    if (error) {
      console.error('Error updating tour:', error);
      return;
    }

    console.log('✅ Successfully updated Druk Path Trek thumbnail!');
    console.log('\nNew thumbnail URL:', newThumbnailUrl);
    console.log('New thumbnail public ID:', newThumbnailPublicId);

    console.log('\nThis should fix the homepage thumbnail loading issue.');
    console.log('The Bumthang image is a beautiful mountain landscape perfect for trekking.');

    // Verify the update
    const { data: tour, error: fetchError } = await supabase
      .from('tours')
      .select('title, thumbnail_url, thumbnail_public_id')
      .eq('slug', 'druk-path-trek')
      .single();

    if (fetchError) {
      console.error('Error verifying update:', fetchError);
      return;
    }

    console.log('\n=== Verification ===');
    console.log('Tour:', tour.title);
    console.log('Updated thumbnail URL:', tour.thumbnail_url);
    console.log('Updated thumbnail public ID:', tour.thumbnail_public_id);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixDrukPathThumbnail();