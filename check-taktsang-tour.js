// Check Taktsang Tigers Nest Trek tour data
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTaktsangTour() {
  console.log('Checking Taktsang Tigers Nest Trek tour...');

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', 'taktsang-tigers-nest-trek')
    .single();

  if (error) {
    console.error('Error fetching tour:', error);
    return;
  }

  if (!data) {
    console.log('❌ Tour not found!');
    return;
  }

  console.log('\n=== Taktsang Tigers Nest Trek ===');
  console.log('Title:', data.title);
  console.log('Slug:', data.slug);
  console.log('Is Active:', data.is_active);
  console.log('Is Published:', data.is_published);

  console.log('\n=== Image Data ===');
  console.log('Hero Image URL:', data.hero_image_url || 'MISSING');
  console.log('Thumbnail URL:', data.thumbnail_url || 'MISSING');

  console.log('\n=== Content ===');
  console.log('Has Description:', data.description ? 'YES' : 'NO');
  console.log('Has Tagline:', data.tagline ? 'YES' : 'NO');

  console.log('\n=== Itinerary ===');
  if (data.itinerary && data.itinerary.length > 0) {
    console.log('Has Itinerary:', 'YES (' + data.itinerary.length + ' days)');
    data.itinerary.forEach((day, i) => {
      console.log(`  Day ${day.day}: ${day.title} - ${day.location || 'No location'}`);
    });
  } else {
    console.log('Has Itinerary:', 'NO');
  }

  console.log('\n=== Potential Issues ===');
  const issues = [];
  if (!data.hero_image_url) issues.push('Missing hero_image_url');
  if (!data.thumbnail_url) issues.push('Missing thumbnail_url');
  if (!data.description) issues.push('Missing description');
  if (!data.tagline) issues.push('Missing tagline');
  if (!data.itinerary || data.itinerary.length === 0) issues.push('Missing or empty itinerary');

  if (issues.length > 0) {
    console.log('❌ Issues Found:');
    issues.forEach(issue => console.log('  -', issue));
  } else {
    console.log('✅ No issues found');
  }
}

checkTaktsangTour();