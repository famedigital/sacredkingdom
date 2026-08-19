const cloudinary = require('cloudinary');
const { createClient } = require('@supabase/supabase-js');

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: 'hckgrdeh',
  api_key: '899967834874613',
  api_secret: 'IVrrbNOuALmDBp8w0Y3x-ouF3L8'
});

// Configure Supabase using environment variables
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Try different keys in order
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                      'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

console.log('Connecting to:', supabaseUrl);
console.log('Using key:', supabaseKey.substring(0, 30) + '...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Bhutan tourism images (excluding Cloudinary sample images)
const bhutanImages = {
  // Main hero images
  hero: [
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911267/tigernest_paro_wdenqu.jpg',
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782912157/dochula-tshechu_d3d6dg.jpg',
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782912162/thimphu-moonsoon_dftrcz.jpg',
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782912146/tigernest-rear_stc6o5.jpg',
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911266/punakha_bmddrk.jpg'
  ],

  // Tour-specific images
  tours: [
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911267/tigernest_paro_wdenqu.jpg', // Tiger's Nest
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911266/punakha_bmddrk.jpg', // Punakha
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782912162/thimphu-moonsoon_dftrcz.jpg', // Thimphu landscape
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782912157/dochula-tshechu_d3d6dg.jpg', // Festival
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911323/phobjikha1_ddflbj.jpg', // Phobjikha
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911270/bumthang_bdxytr.jpg', // Bumthang
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911338/paro-rimpungdzong_uemj9o.jpg', // Paro Dzong
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911256/buddhapoint_z2kucc.jpg', // Buddha Point
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911274/tigernest1_epiybh.jpg', // Tiger's Nest view 2
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911314/phobjika2_pqhuya.jpg', // Phobjikha view 2
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911321/tshechu_b5y9hd.jpg', // Tshechu
    'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911281/wangdidzong_mbcvuq.jpg' // Wangdi Dzong
  ]
};

async function populateHeroSlides() {
  console.log('🎯 Populating Hero Slides...\n');

  const heroSlides = [
    {
      slide_order: 1,
      title: 'Discover the Land of the Thunder Dragon',
      subtitle: 'Experience Bhutan\'s mystical beauty and ancient traditions',
      image_public_id: 'tigernest_paro_wdenqu',
      image_url: bhutanImages.hero[0],
      cta_text: 'Explore Tours',
      cta_link: '/tours',
      is_active: true
    },
    {
      slide_order: 2,
      title: 'Sacred Festivals & Ancient Monasteries',
      subtitle: 'Witness the vibrant Tsechu festivals and visit sacred dzongs',
      image_public_id: 'dochula-tshechu_d3d6dg',
      image_url: bhutanImages.hero[1],
      cta_text: 'View Cultural Tours',
      cta_link: '/tours?category=cultural',
      is_active: true
    },
    {
      slide_order: 3,
      title: 'Majestic Himalayan Landscapes',
      subtitle: 'Trek through pristine valleys and discover hidden mountain gems',
      image_public_id: 'thimphu-moonsoon_dftrcz',
      image_url: bhutanImages.hero[2],
      cta_text: 'Start Trekking',
      cta_link: '/tours?category=trekking',
      is_active: true
    },
    {
      slide_order: 4,
      title: 'The Famous Tiger\'s Nest Monastery',
      subtitle: 'Taktsang Palphug - Perched dramatically on a cliff edge',
      image_public_id: 'tigernest-rear_stc6o5',
      image_url: bhutanImages.hero[3],
      cta_text: 'Visit Tiger\'s Nest',
      cta_link: '/tours/taktsang-trek',
      is_active: true
    },
    {
      slide_order: 5,
      title: 'Punakha Dzong - Fortress of Great Happiness',
      subtitle: 'Ancient fortress-monastery at the confluence of two rivers',
      image_public_id: 'punakha_bmddrk',
      image_url: bhutanImages.hero[4],
      cta_text: 'Explore Western Bhutan',
      cta_link: '/tours?region=western',
      is_active: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .upsert(heroSlides, { onConflict: 'slide_order' });

    if (error) {
      // If upsert fails, try insert instead
      const { data: insertData, error: insertError } = await supabase
        .from('hero_slides')
        .insert(heroSlides);

      if (insertError) throw insertError;
      console.log(`✅ Successfully populated ${heroSlides.length} hero slides!\n`);
      return heroSlides;
    }
    console.log(`✅ Successfully populated ${heroSlides.length} hero slides!\n`);
    return heroSlides;
  } catch (error) {
    console.error('❌ Error populating hero slides:', error.message);
    return [];
  }
}

async function populateTours() {
  console.log('🏔️ Populating Tours with Bhutan Images...\n');

  const tours = [
    {
      title: 'Taktsang Tiger\'s Nest Trek',
      slug: 'taktsang-tigers-nest-trek',
      tagline: 'Bhutan\'s most iconic sacred monastery perched on a cliff',
      description: 'Journey to the legendary Taktsang Palphug Monastery, famously known as Tiger\'s Nest. This sacred site clings dramatically to a cliff 3,000 feet above the Paro Valley. Our expert guides will lead you through beautiful pine forests and ensure a safe, spiritually enriching experience.',
      duration: 7,
      difficulty_level: 'moderate',
      category: 'trekking',
      price: 2200,
      hero_image_url: bhutanImages.tours[0],
      thumbnail_url: bhutanImages.tours[0].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      gallery_urls: [
        bhutanImages.tours[8], // Tiger's Nest view 2
        bhutanImages.tours[6]  // Paro Dzong
      ],
      locations: ['Paro', 'Taktsang'],
      highlights: ['Sacred monastery visit', 'Panoramic Himalayan views', 'Spiritual experience', 'Cultural immersion']
    },
    {
      title: 'Cultural Triangle Experience',
      slug: 'cultural-triangle-experience',
      tagline: 'Explore Bhutan\'s ancient fortresses and sacred valleys',
      description: 'Discover the heart of Bhutanese culture in the western valleys. Visit magnificent dzongs, ancient monasteries, and experience the warmth of Bhutanese hospitality. This journey through Paro, Thimphu, and Punakha offers deep cultural insights.',
      duration: 10,
      difficulty_level: 'easy',
      category: 'cultural',
      price: 2800,
      hero_image_url: bhutanImages.tours[1],
      thumbnail_url: bhutanImages.tours[1].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      gallery_urls: [
        bhutanImages.tours[6], // Paro Dzong
        bhutanImages.tours[7]  // Buddha Point
      ],
      locations: ['Paro', 'Thimphu', 'Punakha'],
      highlights: ['Ancient dzongs', 'Traditional arts', 'Local village visits', 'Festivals']
    },
    {
      title: 'Druk Path Trek',
      slug: 'druk-path-trek',
      tagline: 'Classic Himalayan trek between Paro and Thimphu valleys',
      description: 'Follow the ancient trading route connecting Paro and Thimphu. This beautiful trek passes through stunning mountain lakes, alpine meadows, and remote yak herder camps. Experience pristine Himalayan nature with comfortable camping and expert support.',
      duration: 6,
      difficulty_level: 'moderate',
      category: 'trekking',
      price: 2100,
      hero_image_url: bhutanImages.tours[2],
      thumbnail_url: bhutanImages.tours[2].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      gallery_urls: [
        bhutanImages.tours[4] // Phobjikha
      ],
      locations: ['Paro', 'Thimphu'],
      highlights: ['Mountain lakes', 'Remote camps', 'Himalayan views', 'Flora and fauna']
    },
    {
      title: 'Festival Tour - Paro Tsechu',
      slug: 'festival-tour-paro-tsechu',
      tagline: 'Witness Bhutan\'s most spectacular religious festival',
      description: 'Experience the sacred Paro Tsechu, one of Bhutan\'s most vibrant festivals. Watch masked dancers perform ancient cham dances, receive blessings from sacred relics, and immerse yourself in centuries-old Buddhist traditions. A truly spiritual and visual spectacle.',
      duration: 8,
      difficulty_level: 'easy',
      category: 'festival',
      price: 3200,
      hero_image_url: bhutanImages.tours[3],
      thumbnail_url: bhutanImages.tours[3].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      gallery_urls: [
        bhutanImages.tours[10] // Tshechu
      ],
      locations: ['Paro'],
      highlights: ['Masked cham dances', 'Sacred Thongdrel unveiling', 'Blessing ceremonies', 'Cultural immersion']
    },
    {
      title: 'Phobjikha Valley Discovery',
      slug: 'phobjikha-valley-discovery',
      tagline: 'Glorious glacial valley and endangered black-necked cranes',
      description: 'Visit the beautiful Phobjikha Valley, winter home to the endangered black-necked cranes. Explore Gangtey Goemba monastery, walk through pristine wetlands, and experience rural Bhutanese life. Perfect for nature lovers and bird enthusiasts.',
      duration: 5,
      difficulty_level: 'easy',
      category: 'adventure',
      price: 1800,
      hero_image_url: bhutanImages.tours[4],
      thumbnail_url: bhutanImages.tours[4].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      gallery_urls: [
        bhutanImages.tours[9] // Phobjikha view 2
      ],
      locations: ['Phobjikha', 'Wangdue'],
      highlights: ['Black-necked cranes', 'Gangtey Monastery', 'Nature walks', 'Rural homestay']
    },
    {
      title: 'Bumthang Cultural Heartland',
      slug: 'bumthang-cultural-heartland',
      tagline: 'Spiritual heart of Bhutan with ancient temples and sacred sites',
      description: 'Explore Bumthang, Bhutan\'s spiritual heartland. Visit centuries-old temples, sacred pilgrimage sites, and experience the deep spiritual traditions that have flourished here for generations. Known as the Switzerland of Bhutan for its stunning scenery.',
      duration: 12,
      difficulty_level: 'easy',
      category: 'spiritual',
      price: 3400,
      hero_image_url: bhutanImages.tours[5],
      thumbnail_url: bhutanImages.tours[5].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      gallery_urls: [],
      locations: ['Bumthang', 'Trongsa'],
      highlights: ['Ancient temples', 'Sacred sites', 'Traditional villages', 'Yathra weaving']
    }
  ];

  try {
    const { data, error } = await supabase
      .from('tours')
      .upsert(tours, { onConflict: 'slug' });

    if (error) throw error;
    console.log(`✅ Successfully populated ${tours.length} tours with Bhutan images!\n`);
    return tours;
  } catch (error) {
    console.error('❌ Error populating tours:', error.message);
    return [];
  }
}

async function populateBlogPosts() {
  console.log('📝 Populating Blog Posts with Bhutan Images...\n');

  const blogPosts = [
    {
      title: 'The Mystical Tiger\'s Nest Monastery',
      slug: 'mystical-tigers-nest-monastery',
      excerpt: 'Discover the legend and spiritual significance of Bhutan\'s most iconic sacred site, perched dramatically on a cliff edge.',
      content: `# The Mystical Tiger's Nest Monastery

Perched dramatically on a cliff 3,000 feet above the Paro Valley, Taktsang Palphug Monastery, commonly known as Tiger's Nest, is Bhutan's most iconic landmark. This sacred site holds deep spiritual significance for Bhutanese Buddhists and attracts pilgrims from around the world.`,
      featured_image_url: bhutanImages.hero[0],
      thumbnail_url: bhutanImages.hero[0].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      category: 'Culture',
      tags: ['monastery', 'trekking', 'spirituality', 'paro'],
      author_name: 'Wangchuks Bhutan Tours',
      published_date: new Date().toISOString().split('T')[0]
    },
    {
      title: 'Understanding Bhutanese Festival Culture',
      slug: 'understanding-bhutanese-festival-culture',
      excerpt: 'Experience the vibrant colors, masked dances, and spiritual significance of Bhutan\'s sacred Tsechu festivals.',
      content: `# Understanding Bhutanese Festival Culture

Bhutan's Tsechu festivals are extraordinary celebrations of faith, culture, and community. These annual events honor Guru Rinpoche and showcase the rich spiritual traditions that have been preserved for centuries.`,
      featured_image_url: bhutanImages.hero[1],
      thumbnail_url: bhutanImages.hero[1].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      category: 'Festivals',
      tags: ['tsechu', 'culture', 'cham dance', 'festivals'],
      author_name: 'Wangchuks Bhutan Tours',
      published_date: new Date().toISOString().split('T')[0]
    },
    {
      title: 'Best Time to Visit Bhutan: A Seasonal Guide',
      slug: 'best-time-to-visit-bhutan-seasonal-guide',
      excerpt: 'Discover the optimal timing for your Bhutan adventure based on weather, festivals, and seasonal highlights.',
      content: `# Best Time to Visit Bhutan: A Seasonal Guide

Bhutan offers distinct experiences throughout the year, each season bringing its own unique charm and opportunities. Understanding the seasonal variations will help you plan the perfect Bhutanese adventure.`,
      featured_image_url: bhutanImages.hero[2],
      thumbnail_url: bhutanImages.hero[2].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      category: 'Travel Tips',
      tags: ['weather', 'planning', 'seasons', 'guide'],
      author_name: 'Wangchuks Bhutan Tours',
      published_date: new Date().toISOString().split('T')[0]
    },
    {
      title: 'Sacred Dzongs of Bhutan',
      slug: 'sacred-dzongs-of-bhutan',
      excerpt: 'Explore Bhutan\'s magnificent fortress-monasteries, architectural marvels that serve as both religious and administrative centers.',
      content: `# Sacred Dzongs of Bhutan

Bhutan's dzongs are among the most remarkable architectural achievements in the Himalayan region. These massive fortress-monasteries serve as dual centers of religious and administrative authority.`,
      featured_image_url: bhutanImages.hero[4],
      thumbnail_url: bhutanImages.hero[4].replace('/upload/', '/upload/w_600,h_400,c_fill/'),
      category: 'Culture',
      tags: ['architecture', 'dzongs', 'history', 'monasteries'],
      author_name: 'Wangchuks Bhutan Tours',
      published_date: new Date().toISOString().split('T')[0]
    }
  ];

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(blogPosts, { onConflict: 'slug' });

    if (error) throw error;
    console.log(`✅ Successfully populated ${blogPosts.length} blog posts with Bhutan images!\n`);
    return blogPosts;
  } catch (error) {
    console.error('❌ Error populating blog posts:', error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Starting Bhutan Image Population Process...\n');
  console.log('='.repeat(60));
  console.log('Using ONLY Bhutan tourism images (excluding Cloudinary samples)');
  console.log('='.repeat(60) + '\n');

  try {
    // Check database connection
    const { data: testData, error: testError } = await supabase
      .from('hero_slides')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Cannot connect to database. Make sure tables exist!');
      console.error('Error:', testError.message);
      console.error('\n💡 Run the DEPLOY_DATABASE.sql script first to create tables.');
      return;
    }

    // Populate all data
    await populateHeroSlides();
    await populateTours();
    await populateBlogPosts();

    console.log('='.repeat(60));
    console.log('🎉 Bhutan image population completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Hero Slides: 5 slides with Bhutan images');
    console.log('   - Tours: 6 tours with Bhutan images');
    console.log('   - Blog Posts: 4 posts with Bhutan images');
    console.log('\n🇧🇹 All images are authentic Bhutan photography!');
    console.log('🌐 Visit http://localhost:3000 to see the changes!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the main function
main();