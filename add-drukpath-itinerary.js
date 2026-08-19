// Add itinerary and fix Druk Path Trek
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDrukPathTrek() {
  console.log('Adding itinerary and fixing Druk Path Trek...');

  // Druk Path Trek itinerary - 6 days from Paro to Thimphu
  const drukPathItinerary = [
    {
      day: 1,
      title: 'Paro to Jele Dzong',
      location: 'Paro Valley',
      description: 'Start your adventure with a challenging but rewarding hike to Jele Dzong. The trail ascends gradually through pine forests, offering stunning views of Paro Valley. Camp at Jele Dzong (2,580m) near the ancient fortress.',
      activities: ['Hiking', 'Camping', 'Mountain views'],
      meals: 'Lunch, Dinner',
      accommodation: 'Camping at Jele Dzong'
    },
    {
      day: 2,
      title: 'Jele Dzong to Jangchulakha',
      location: 'Mountain Trails',
      description: 'Trek through rhododendron forests and alpine meadows. Keep an eye out for Himalayan blue sheep and musk deer. The trail offers spectacular mountain views. Camp at Jangchulakha (2,880m).',
      activities: ['Forest trekking', 'Wildlife spotting', 'Alpine meadows'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Camping at Jangchulakha'
    },
    {
      day: 3,
      title: 'Jangchulakha to Jimilang Tsho',
      location: 'High Mountain Pass',
      description: 'Today\'s trek takes you past the beautiful Jimilang Tsho (Sand Lake), known for its crystal-clear waters and trout. The trail climbs to Jimilang Tsho (3,700m) with stunning views of Mount Jomolhari.',
      activities: ['High altitude trekking', 'Lake visit', 'Mountain views'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Camping near Jimilang Tsho'
    },
    {
      day: 4,
      title: 'Jimilang Tsho to Simkota Tsho',
      location: 'Lakes Region',
      description: 'Continue your journey past several beautiful lakes including Simkota Tsho. The terrain becomes rugged and the views more dramatic. Camp at Simkota Tsho (3,840m) surrounded by snow-capped peaks.',
      activities: ['Lake exploration', 'High altitude camping', 'Panoramic views'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Camping at Simkota Tsho'
    },
    {
      day: 5,
      title: 'Simkota Tsho to Phajoding',
      location: 'Approaching Thimphu',
      description: 'Descend towards Thimphu valley through juniper forests. Visit Phajoding Goemba, one of Bhutan\'s most sacred meditation sites. The monastery offers spectacular sunset views. Camp at Phajoding (3,750m).',
      activities: ['Monastery visit', 'Descent trek', 'Meditation caves'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Camping at Phajoding'
    },
    {
      day: 6,
      title: 'Phajoding to Thimphu',
      location: 'Thimphu Valley',
      description: 'Final descent to Thimphu, the capital city. The trail passes through pine forests with occasional glimpses of the city below. Arrive in Thimphu for a well-deserved rest and celebration.',
      activities: ['Descent to capital', 'City arrival', 'Celebration'],
      meals: 'Breakfast, Lunch',
      accommodation: 'Hotel in Thimphu'
    }
  ];

  const highlights = [
    'Spectacular Himalayan mountain views',
    'Sacred monasteries and meditation sites',
    'Pristine mountain lakes',
    'Rhododendron forests and alpine meadows',
    'Wildlife spotting opportunities',
    'Authentic camping experience'
  ];

  try {
    const { data, error } = await supabase
      .from('tours')
      .update({
        itinerary: drukPathItinerary,
        highlights: highlights,
        is_featured: true, // Make it featured so it shows on homepage
        sort_order: 3, // Give it a sort order
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'druk-path-trek');

    if (error) {
      console.error('Error updating tour:', error);
      return;
    }

    console.log('✅ Successfully added itinerary and fixed Druk Path Trek!');
    console.log('\n✅ Added 6-day itinerary');
    console.log('✅ Added highlights');
    console.log('✅ Made tour featured (will show on homepage)');
    console.log('✅ Set sort order');

    // Verify the update
    const { data: tour, error: fetchError } = await supabase
      .from('tours')
      .select('title, is_featured, sort_order, itinerary')
      .eq('slug', 'druk-path-trek')
      .single();

    if (fetchError) {
      console.error('Error verifying update:', fetchError);
      return;
    }

    console.log('\n=== Verification ===');
    console.log('Tour:', tour.title);
    console.log('Is Featured:', tour.is_featured);
    console.log('Sort Order:', tour.sort_order);
    console.log('Has Itinerary:', tour.itinerary ? 'YES (' + tour.itinerary.length + ' days)' : 'NO');

    if (tour.itinerary) {
      console.log('\n=== Itinerary Summary ===');
      tour.itinerary.forEach((day, i) => {
        console.log(`Day ${day.day}: ${day.title} - ${day.location}`);
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixDrukPathTrek();