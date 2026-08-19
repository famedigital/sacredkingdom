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

async function checkItinerary() {
  try {
    console.log('Checking tour data for itinerary...');
    console.log('Using URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data: tours, error } = await supabase
      .from('tours')
      .select('title, slug, itinerary')
      .limit(5);

    if (error) {
      console.error('Error fetching tours:', error);
      return;
    }

    if (!tours || tours.length === 0) {
      console.log('No tours found');
      return;
    }

    tours.forEach((tour) => {
      console.log(`\n🏔️ ${tour.title}`);
      console.log(`   Slug: ${tour.slug}`);
      console.log(`   Has itinerary: ${tour.itinerary ? 'YES' : 'NO'}`);
      if (tour.itinerary && tour.itinerary.length > 0) {
        console.log(`   Itinerary days: ${tour.itinerary.length}`);
        console.log(`   First day:`, JSON.stringify(tour.itinerary[0], null, 2));
      } else {
        console.log(`   Itinerary data:`, tour.itinerary);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkItinerary();