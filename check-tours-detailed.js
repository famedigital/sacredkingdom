require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Checking detailed tour data...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTours() {
  try {
    // Get all tours to see their structure
    const { data, error } = await supabase
      .from('tours')
      .select('*');

    console.log('Total tours:', data ? data.length : 0);

    if (data && data.length > 0) {
      console.log('\n📊 Tour Data Structure:');
      console.log('First tour keys:', Object.keys(data[0]));

      console.log('\n📊 Featured Tours (is_featured=true):');
      const featured = data.filter(t => t.is_featured === true);
      console.log('Count:', featured.length);

      if (featured.length > 0) {
        featured.forEach((tour, i) => {
          console.log(`\nFeatured Tour ${i + 1}:`);
          console.log('  Title:', tour.title);
          console.log('  is_featured:', tour.is_featured);
          console.log('  is_active:', tour.is_active);
          console.log('  hero_image_url:', tour.hero_image_url ? 'YES' : 'NO');
        });
      } else {
        console.log('❌ No featured tours found!');
        console.log('\nAll tours status:');
        data.forEach((tour, i) => {
          console.log(`Tour ${i + 1}: ${tour.title}`);
          console.log('  is_featured:', tour.is_featured);
          console.log('  is_active:', tour.is_active);
        });
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkTours();