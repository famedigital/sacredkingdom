/**
 * Import Tours Script
 *
 * This script will import your 6 existing tours into the Supabase database.
 *
 * Usage:
 * 1. Make sure your .env.local has correct Supabase credentials
 * 2. Update the tours array below with your actual tour data
 * 3. Run: node import-tours.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqbwlmoadphkuewubszd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYndsYW9hZHBqa3Vld3lic3pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQwMjcxOSwiZXhwIjoyMDUyOTc4NzE5fQ.lCWhqHN_kEdAEGF4RhNFhJ2OQ0cKHj0rNJLpvISlq8E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Your 6 tours - UPDATE THIS DATA with your actual tours
const tours = [
  {
    title: 'Cultural Triangle Tour',
    slug: 'cultural-triangle-tour',
    tagline: 'Explore the heart of Bhutan\'s cultural heritage',
    description: 'Journey through the iconic Cultural Triangle - Paro, Thimphu, and Punakha. Visit ancient monasteries, witness traditional festivals, and experience the spiritual essence of the Land of the Thunder Dragon.',
    hero_image_public_id: 'wangchuk-tour/cultural-triangle-hero',
    hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911338/paro-rimpungdzong_uemj9o.jpg',
    thumbnail_public_id: 'wangchuk-tour/cultural-triangle-thumb',
    thumbnail_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911338/paro-rimpungdzong_uemj9o.jpg',
    gallery_public_ids: ['wangchuk-tour/cultural-1', 'wangchuk-tour/cultural-2', 'wangchuk-tour/cultural-3'],
    category: 'cultural',
    duration: 7,
    duration_nights: 6,
    price: 1500,
    difficulty_level: 'easy',
    is_featured: true,
    is_active: true,
    tour_type: 'scheduled',
    locations: ['Paro', 'Thimphu', 'Punakha'],
    highlights: [
      'Visit Tiger\'s Nest Monastery',
      'Explore Punakha Dzong',
      'Experience Thimphu capital city',
      'Traditional Bhutanese cuisine'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Paro',
        location: 'Paro',
        description: 'Arrive at Paro International Airport, meet your guide, and transfer to your hotel. Enjoy a traditional Bhutanese welcome dinner.',
        activities: ['Airport pickup', 'Hotel check-in', 'Welcome dinner'],
        meals: 'Dinner',
        accommodation: 'Hotel in Paro'
      },
      {
        day: 2,
        title: 'Paro Valley Exploration',
        location: 'Paro',
        description: 'Explore the beautiful Paro Valley, visit local farms, and experience traditional Bhutanese village life.',
        activities: ['Village tour', 'Farm visit', 'Traditional lunch'],
        meals: 'Breakfast, Lunch, Dinner',
        accommodation: 'Hotel in Paro'
      }
    ],
    inclusions: [
      'All accommodation',
      'All meals',
      'English-speaking guide',
      'Private transportation',
      'Entry fees to monuments',
      'Visa processing'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Tips and gratuities'
    ],
    best_season: ['Spring', 'Autumn'],
    altitude_range: '2,200m - 3,100m',
    min_participants: 2,
    max_participants: 12,
    min_age: 12,
    physical_fitness_level: 'moderate',
    sort_order: 1
  },
  {
    title: 'Druk Path Trek',
    slug: 'druk-path-trek',
    tagline: 'Follow the ancient trekking route between Paro and Thimphu',
    description: 'Trek the historic route used by the people of Thimphu and Paro when they had to travel between the two valleys. This challenging trek offers stunning views of the Himalayas.',
    hero_image_public_id: 'wangchuk-tour/druk-path-hero',
    hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg',
    thumbnail_public_id: 'wangchuk-tour/druk-path-thumb',
    thumbnail_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg',
    gallery_public_ids: ['wangchuk-tour/druk-path-1', 'wangchuk-tour/druk-path-2'],
    category: 'trekking',
    duration: 6,
    duration_nights: 5,
    price: 2200,
    difficulty_level: 'hard',
    is_featured: true,
    is_active: true,
    tour_type: 'adventure',
    locations: ['Paro', 'Thimphu'],
    highlights: [
      'High-altitude mountain trekking',
      'Panoramic Himalayan views',
      'Remote monastery visits',
      'Camping under the stars'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Trek Start - Paro to Jili Dzong',
        location: 'Paro',
        description: 'Begin your trek from Paro to the ruined Jili Dzong fortress. Camp overnight at 2,800m.',
        activities: ['Trek start', 'Camping setup'],
        meals: 'Lunch, Dinner',
        accommodation: 'Camp at Jili Dzong'
      }
    ],
    inclusions: [
      'All camping equipment',
      'Meals during trek',
      'Professional trekking guide',
      'Porter services',
      'Permits and fees'
    ],
    exclusions: [
      'Personal trekking gear',
      'Travel insurance',
      'Emergency evacuation'
    ],
    best_season: ['Spring', 'Autumn'],
    altitude_range: '2,800m - 4,500m',
    min_participants: 2,
    max_participants: 8,
    min_age: 16,
    physical_fitness_level: 'high',
    sort_order: 2
  },
  {
    title: 'Festival Tour',
    slug: 'festival-tour',
    tagline: 'Experience vibrant Bhutanese festivals',
    description: 'Immerse yourself in the colorful celebrations of Bhutanese festivals. Witness the famous Paro Tsechu featuring masked dances and religious ceremonies.',
    hero_image_public_id: 'wangchuk-tour/festival-hero',
    hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911267/tigernest_paro_wdenqu.jpg',
    thumbnail_public_id: 'wangchuk-tour/festival-thumb',
    thumbnail_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911267/tigernest_paro_wdenqu.jpg',
    gallery_public_ids: ['wangchuk-tour/festival-1', 'wangchuk-tour/festival-2'],
    category: 'festival',
    duration: 8,
    duration_nights: 7,
    price: 2800,
    difficulty_level: 'easy',
    is_featured: true,
    is_active: true,
    tour_type: 'scheduled',
    locations: ['Paro', 'Thimphu'],
    highlights: [
      'Paro Tsechu festival',
      'Masked cham dances',
      'Traditional Bhutanese music',
      'Religious ceremonies'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Festival Preparation',
        location: 'Paro',
        description: 'Arrive in Paro and prepare for the upcoming Tsechu festival. Visit the local market to see festival preparations.',
        activities: ['Market visit', 'Festival briefing'],
        meals: 'Breakfast, Lunch, Dinner',
        accommodation: 'Hotel in Paro'
      }
    ],
    inclusions: [
      'Festival viewing tickets',
      'Guide interpretation',
      'Cultural activities',
      'Traditional dress rental'
    ],
    exclusions: [
      'Flights to festival sites',
      'Festival souvenirs'
    ],
    best_season: ['Spring', 'Autumn'],
    altitude_range: '2,200m - 2,400m',
    min_participants: 2,
    max_participants: 10,
    min_age: 8,
    physical_fitness_level: 'easy',
    sort_order: 3
  },
  {
    title: 'Bhutan Highlights',
    slug: 'bhutan-highlights',
    tagline: 'The perfect introduction to the Land of the Thunder Dragon',
    description: 'Experience the best of Bhutan in this comprehensive tour covering cultural sites, natural wonders, and spiritual landmarks.',
    hero_image_public_id: 'wangchuk-tour/highlights-hero',
    hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782962660/wangchukstlogo_usxclz.png',
    thumbnail_public_id: 'wangchuk-tour/highlights-thumb',
    thumbnail_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782962660/wangchukstlogo_usxclz.png',
    gallery_public_ids: ['wangchuk-tour/highlights-1'],
    category: 'cultural',
    duration: 10,
    duration_nights: 9,
    price: 3500,
    difficulty_level: 'easy',
    is_featured: false,
    is_active: true,
    tour_type: 'scheduled',
    locations: ['Paro', 'Thimphu', 'Punakha', 'Wangdue'],
    highlights: [
      'Complete cultural experience',
      'Multiple dzong visits',
      'Hot stone bath experience',
      'Traditional archery'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival and Orientation',
        location: 'Paro',
        description: 'Arrive in Paro and get oriented with Bhutanese culture and customs.',
        activities: ['Airport pickup', 'Orientation session'],
        meals: 'Dinner',
        accommodation: 'Hotel in Paro'
      }
    ],
    inclusions: [
      'All-inclusive package',
      'Cultural experiences',
      'Professional photography',
      'Special experiences'
    ],
    exclusions: [
      'Personal shopping',
      'Optional activities'
    ],
    best_season: ['Spring', 'Summer', 'Autumn'],
    altitude_range: '2,200m - 3,000m',
    min_participants: 2,
    max_participants: 12,
    min_age: 6,
    physical_fitness_level: 'moderate',
    sort_order: 4
  },
  {
    title: 'Snowman Trek',
    slug: 'snowman-trek',
    tagline: 'Challenge yourself on Bhutan\'s most famous high-altitude trek',
    description: 'The legendary Snowman Trek takes you through some of the most remote and pristine landscapes in the Himalayas. Not for the faint of heart.',
    hero_image_public_id: 'wangchuk-tour/snowman-hero',
    hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911338/paro-rimpungdzong_uemj9o.jpg',
    thumbnail_public_id: 'wangchuk-tour/snowman-thumb',
    thumbnail_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782911338/paro-rimpungdzong_uemj9o.jpg',
    gallery_public_ids: ['wangchuk-tour/snowman-1'],
    category: 'trekking',
    duration: 12,
    duration_nights: 11,
    price: 4500,
    difficulty_level: 'expert',
    is_featured: true,
    is_active: true,
    tour_type: 'adventure',
    locations: ['Lunana', 'Gasa'],
    highlights: [
      'Highest trek in Bhutan',
      'Remote village visits',
      'Spectacular mountain views',
      'Glacial lake visits'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Trek Start',
        location: 'Paro',
        description: 'Begin your epic journey from Paro into the high Himalayas.',
        activities: ['Briefing', 'Equipment check'],
        meals: 'All meals included',
        accommodation: 'Camping'
      }
    ],
    inclusions: [
      'Full camping support',
      'Experienced mountain guides',
      'Safety equipment',
      'Emergency support'
    ],
    exclusions: [
      'Personal gear',
      'Helicopter evacuation insurance'
    ],
    best_season: ['Summer'],
    altitude_range: '3,500m - 5,300m',
    min_participants: 2,
    max_participants: 6,
    min_age: 18,
    physical_fitness_level: 'expert',
    sort_order: 5
  },
  {
    title: 'Custom Private Tour',
    slug: 'custom-private-tour',
    tagline: 'Design your perfect Bhutan experience',
    description: 'Create your own itinerary with our expert guidance. Choose your destinations, pace, and experiences for a truly personalized journey.',
    hero_image_public_id: 'wangchuk-tour/custom-hero',
    hero_image_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg',
    thumbnail_public_id: 'wangchuk-tour/custom-thumb',
    thumbnail_url: 'https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg',
    gallery_public_ids: ['wangchuk-tour/custom-1'],
    category: 'custom',
    duration: 5,
    duration_nights: 4,
    price: 2000,
    difficulty_level: 'easy',
    is_featured: false,
    is_active: true,
    tour_type: 'custom',
    locations: ['Flexible'],
    highlights: [
      'Fully customizable itinerary',
      'Private guide and vehicle',
      'Flexible scheduling',
      'Personalized experiences'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival and Planning',
        location: 'Paro',
        description: 'Arrive and meet with your guide to finalize your custom itinerary.',
        activities: ['Consultation', 'Itinerary planning'],
        meals: 'Dinner',
        accommodation: 'Premium hotel'
      }
    ],
    inclusions: [
      'Custom planning service',
      'Premium accommodation',
      'Private transportation',
      'Specialized experiences'
    ],
    exclusions: [
      'Extra activities',
      'Premium upgrades'
    ],
    best_season: ['All year'],
    altitude_range: 'Variable',
    min_participants: 1,
    max_participants: 20,
    min_age: 5,
    physical_fitness_level: 'flexible',
    sort_order: 6
  }
];

async function importTours() {
  console.log('Starting tour import...');

  let successCount = 0;
  let errorCount = 0;

  for (const tour of tours) {
    try {
      console.log(`Importing tour: ${tour.title}`);

      const { data, error } = await supabase
        .from('tours')
        .insert({
          ...tour,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error(`Error importing ${tour.title}:`, error);
        errorCount++;
      } else {
        console.log(`✓ Successfully imported: ${tour.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`Exception importing ${tour.title}:`, err);
      errorCount++;
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total tours: ${tours.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  if (successCount === tours.length) {
    console.log('\n✓ All tours imported successfully!');
  } else {
    console.log('\n⚠ Some tours failed to import. Please check the errors above.');
  }
}

// Run the import
importTours().catch(console.error);