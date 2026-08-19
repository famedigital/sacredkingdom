require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing database connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'UNDEFINED');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test if tables exist by trying to query hero_slides
    console.log('Testing hero_slides table...');
    const { data, error, status } = await supabase
      .from('hero_slides')
      .select('id')
      .limit(1);

    console.log('Status:', status);
    console.log('Error:', error);
    console.log('Data:', data);

    if (error) {
      console.error('❌ Error accessing hero_slides:', error.message);
      console.error('Error details:', error);

      // Check if it's a permissions error
      if (error.message.includes('API key')) {
        console.error('\n💡 This appears to be an API key issue.');
        console.error('Please check your Supabase credentials in .env.local');
        console.error('1. Go to Supabase dashboard');
        console.error('2. Project Settings > API');
        console.error('3. Copy the anon/public key');
        console.error('4. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
      }
    } else {
      console.log('✅ Connection successful! Tables exist.');
    }
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

testConnection();