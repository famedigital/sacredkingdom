// Check environment variables
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Check ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'MISSING');

// Test which key works
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n=== Testing Keys ===');

if (!url || !publishableKey || !anonKey) {
  console.log('❌ Missing required environment variables');
  process.exit(1);
}

// Test with publishable key
console.log('\n1. Testing with PUBLISHABLE_KEY...');
try {
  const client1 = createClient(url, publishableKey);
  console.log('✅ Client created with publishable key');
} catch (error) {
  console.log('❌ Failed with publishable key:', error.message);
}

// Test with anon key
console.log('\n2. Testing with ANON_KEY...');
try {
  const client2 = createClient(url, anonKey);
  console.log('✅ Client created with anon key');
} catch (error) {
  console.log('❌ Failed with anon key:', error.message);
}

// Test database connection with anon key
console.log('\n3. Testing database query with anon key...');
try {
  const client = createClient(url, anonKey);
  client.from('tours').select('id').limit(1).then(({ data, error }) => {
    if (error) {
      console.log('❌ Database query failed:', error.message);
    } else {
      console.log('✅ Database query successful with anon key, found', data.length, 'tours');
    }

    // Test with publishable key
    console.log('\n4. Testing database query with publishable key...');
    try {
      const client2 = createClient(url, publishableKey);
      client2.from('tours').select('id').limit(1).then(({ data, error }) => {
        if (error) {
          console.log('❌ Database query failed with publishable key:', error.message);
        } else {
          console.log('✅ Database query successful with publishable key, found', data.length, 'tours');
        }
      });
    } catch (error) {
      console.log('❌ Database query exception with publishable key:', error.message);
    }
  });
} catch (error) {
  console.log('❌ Database query exception:', error.message);
}
