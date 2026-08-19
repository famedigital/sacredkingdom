// Update Cultural Triangle Experience thumbnail
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCulturalThumbnail() {
  console.log('Updating Cultural Triangle Experience thumbnail...');

  // New thumbnail URL - Paro Dzong (iconic cultural site)
  const newThumbnailUrl = 'https://res.cloudinary.com/hckgrdeh/image/upload/w_600,h_400,c_fill,q_auto,f_auto/v1782911338/paro-rimpungdzong_uemj9o.jpg';
  const newThumbnailPublicId = 'paro-rimpungdzong_uemj9o';

  try {
    const { data, error } = await supabase
      .from('tours')
      .update({
        thumbnail_url: newThumbnailUrl,
        thumbnail_public_id: newThumbnailPublicId,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'cultural-triangle-experience');

    if (error) {
      console.error('Error updating tour:', error);
      return;
    }

    console.log('✅ Successfully updated Cultural Triangle Experience thumbnail!');
    console.log('\nNew thumbnail URL:', newThumbnailUrl);
    console.log('New thumbnail public ID:', newThumbnailPublicId);

    // Verify the update
    const { data: tour, error: fetchError } = await supabase
      .from('tours')
      .select('title, thumbnail_url, thumbnail_public_id')
      .eq('slug', 'cultural-triangle-experience')
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

updateCulturalThumbnail();