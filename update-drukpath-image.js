const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function updateDrukpathImage() {
  try {
    console.log('Searching for Druk Path Trek...');
    console.log('Using URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Find the Druk Path Trek
    const { data: tours, error: findError } = await supabase
      .from('tours')
      .select('*')
      .ilike('title', '%druk%');

    if (findError) {
      console.error('Error finding Druk Path trek:', findError);
      return;
    }

    if (!tours || tours.length === 0) {
      console.log('❌ No Druk Path trek found');
      return;
    }

    const drukpathTour = tours[0];
    console.log('✅ Found Druk Path Trek:', drukpathTour.title);
    console.log('📸 Current image:', drukpathTour.hero_image_url);

    // Alternative Bhutan landscape image (not Tiger's Nest)
    // Using a beautiful Bhutan valley landscape
    const newImageUrl = 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg';

    console.log('🔄 Updating to:', newImageUrl);

    // Update the tour
    const { data: updatedTour, error: updateError } = await supabase
      .from('tours')
      .update({
        hero_image_url: newImageUrl,
        hero_image_public_id: 'punakhadzong_xkcrcu',
        updated_at: new Date().toISOString()
      })
      .eq('id', drukpathTour.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating tour:', updateError);
      return;
    }

    console.log('✅ Successfully updated Druk Path Trek image!');
    console.log('📸 New image URL:', newImageUrl);
    console.log('🏔️ Updated tour:', updatedTour[0].title);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateDrukpathImage();
