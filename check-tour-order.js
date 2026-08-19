require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Checking tours in sort_order (homepage order)...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkToursInSortOrder() {
  try {
    const { data: tours, error } = await supabase
      .from('tours')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(6);

    if (error) throw error;

    console.log(`\n📊 Tours as displayed on homepage (in sort_order):\n`);

    tours.forEach((tour, index) => {
      console.log(`\n${index + 1}. ${tour.title}`);
      console.log(`   Sort Order: ${tour.sort_order}`);
      console.log(`   Hero Image: ${tour.hero_image_url || 'MISSING'}`);
      console.log(`   Public ID: ${tour.hero_image_public_id || 'MISSING'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkToursInSortOrder();