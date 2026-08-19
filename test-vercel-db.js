/**
 * Test Database Connection for Vercel Production
 * This script helps diagnose database connectivity issues
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Vercel Production Database Test ===');
console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Service Role Key:', supabaseKey ? '✅ Set (length: ' + supabaseKey.length + ')' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  try {
    console.log('\n--- Testing Hero Slides ---');

    const { data, error, count } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('slide_order', { ascending: true });

    if (error) {
      console.error('❌ Database Error:', error.message);
      console.error('Error Details:', error);
      return;
    }

    console.log('✅ Database Connection Successful!');
    console.log('📊 Active Hero Slides Found:', count);

    if (data && data.length > 0) {
      console.log('\n--- Slide Data ---');
      data.forEach((slide, index) => {
        console.log(`${index + 1}. ${slide.title}`);
        console.log(`   Image: ${slide.image_url.substring(0, 80)}...`);
        console.log(`   Active: ${slide.is_active}`);
      });
    } else {
      console.log('⚠️  No active slides found in database');
    }

    console.log('\n--- Testing API Response Format ---');
    if (data && data.length > 0) {
      const sampleSlide = data[0];
      console.log('Sample slide structure:', {
        id: sampleSlide.id,
        title: sampleSlide.title,
        subtitle: sampleSlide.subtitle,
        image_url: sampleSlide.image_url,
        cta_text: sampleSlide.cta_text,
        cta_link: sampleSlide.cta_link
      });
    }

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
}

testDatabaseConnection()
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(() => process.exit(1));