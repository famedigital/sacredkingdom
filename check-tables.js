require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Checking database tables...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['tours', 'hero_slides', 'blog_posts', 'testimonials', 'settings'];

  for (const table of tables) {
    try {
      const { data, error, status } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS (status: ${status})`);
      }
    } catch (err) {
      console.log(`❌ ${table}: EXCEPTION - ${err.message}`);
    }
  }
}

checkTables();