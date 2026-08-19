require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Testing tours table connection...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTours() {
  try {
    // Check if tours exist
    const { data, error, status } = await supabase
      .from('tours')
      .select('*');

    console.log('Status:', status);
    console.log('Error:', error);
    console.log('Tours found:', data ? data.length : 0);

    if (data && data.length > 0) {
      console.log('\n📊 Sample Tour Data:');
      console.log('Tour 1:', {
        title: data[0].title,
        hero_image_url: data[0].hero_image_url ? 'YES' : 'NO',
        thumbnail_url: data[0].thumbnail_url ? 'YES' : 'NO',
        slug: data[0].slug
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkTours();