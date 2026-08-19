const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Sample itinerary data for each tour
const tourItineraries = {
  'taktsang-tigers-nest-trek': [
    {
      day: 1,
      title: 'Arrival in Paro',
      location: 'Paro',
      description: 'Arrive at Paro International Airport. Welcome by your guide and transfer to hotel. Relax and acclimatize to the altitude (2,250m). Evening stroll through Paro town.',
      activities: ['Airport pickup', 'Hotel check-in', 'Paro town exploration'],
      meals: 'Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 2,
      title: 'Paro Sightseeing',
      location: 'Paro',
      description: 'Visit National Museum of Bhutan (Ta Dzong), Rinpung Dzong, and Kyichu Lhakhang temple. Prepare for tomorrow\'s trek with briefing.',
      activities: ['Museum visit', 'Dzong tour', 'Temple visit', 'Trek briefing'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 3,
      title: 'Tiger\'s Nest Trek',
      location: 'Paro Taktsang',
      description: 'Hike to the iconic Taktsang Palphug Monastery (Tiger\'s Nest). The trail climbs 900m through pine forests. Reach the sacred temple perched on cliff edge. Picnic lunch with spectacular views.',
      activities: ['Tiger\'s Nest trek', 'Monastery visit', 'Scenic photography'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 4,
      title: 'Departure',
      location: 'Paro',
      description: 'Morning at leisure. Last minute shopping for souvenirs. Transfer to airport for departure.',
      activities: ['Shopping', 'Airport transfer'],
      meals: 'Breakfast',
      accommodation: 'None'
    }
  ],
  'festival-tour-paro-tsechu': [
    {
      day: 1,
      title: 'Arrival in Paro',
      location: 'Paro',
      description: 'Welcome to Bhutan! Transfer to hotel. Attend evening preparations for the festival. Meet your guide who will explain the significance of the Tsechu.',
      activities: ['Airport pickup', 'Festival briefing', 'Evening chanting'],
      meals: 'Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 2,
      title: 'Paro Tsechu Festival Day 1',
      location: 'Paro Dzong',
      description: 'Full day at Paro Tsechu festival. Witness masked cham dances performed by monks. See the unfurling of the giant Thangka (Throngdrel). Join locals in celebration.',
      activities: ['Festival viewing', 'Cham dances', 'Thongdrel ceremony'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 3,
      title: 'Paro Tsechu Festival Day 2',
      location: 'Paro Dzong',
      description: 'Second day of festival celebrations. View different cham dances and rituals. Experience the vibrant atmosphere with locals in traditional dress. Visit local craft markets.',
      activities: ['Festival viewing', 'Craft market', 'Cultural immersion'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 4,
      title: 'Paro Valley Exploration',
      location: 'Paro',
      description: 'Visit Tiger\'s Nest monastery viewpoint (short hike). Explore Dumtse Lhakhang and traditional farmhouses. Evening at leisure.',
      activities: ['Tiger\'s Nest view', 'Temple visits', 'Farmhouse visit'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 5,
      title: 'Departure',
      location: 'Paro',
      description: 'Morning shopping for festival masks and textiles. Transfer to airport for departure.',
      activities: ['Souvenir shopping', 'Airport transfer'],
      meals: 'Breakfast',
      accommodation: 'None'
    }
  ],
  'phobjikha-valley-discovery': [
    {
      day: 1,
      title: 'Arrival in Paro',
      location: 'Paro',
      description: 'Arrive at Paro International Airport. Transfer to hotel. Brief orientation about your journey to the beautiful glacial valley of Phobjikha.',
      activities: ['Airport pickup', 'Orientation', 'Evening rest'],
      meals: 'Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 2,
      title: 'Paro to Gangtey',
      location: 'Gangtey',
      description: 'Scenic drive to Phobjikha Valley (2,900m) via Dochula Pass (3,150m). Visit 108 Druk Wangyal Chortens. Check into Gangtey. Evening nature walk in the valley.',
      activities: ['Mountain drive', 'Dochula Pass visit', 'Nature walk'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Gangtey'
    },
    {
      day: 3,
      title: 'Gangtey Nature Trail',
      location: 'Phobjikha Valley',
      description: 'Hike the beautiful Gangtey Nature Trail through the valley. Spot black-necked cranes (winter months). Visit Gangtey Gonpa monastery overlooking the valley.',
      activities: ['Nature trail hike', 'Crane spotting', 'Monastery visit'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Gangtey'
    },
    {
      day: 4,
      title: 'Black-necked Crane Center',
      location: 'Phobjikha',
      description: 'Visit the Black-necked Crane Information Center. Learn about these endangered birds. Visit local farmhouses and experience rural Bhutanese life.',
      activities: ['Crane center visit', 'Farmhouse visit', 'Cultural interaction'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Gangtey'
    },
    {
      day: 5,
      title: 'Return to Paro',
      location: 'Paro',
      description: 'Morning drive back to Paro. Afternoon at leisure for shopping or relaxation. Farewell dinner with cultural program.',
      activities: ['Scenic drive', 'Cultural program', 'Farewell dinner'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 6,
      title: 'Departure',
      location: 'Paro',
      description: 'Last minute shopping. Transfer to airport for departure.',
      activities: ['Shopping', 'Airport transfer'],
      meals: 'Breakfast',
      accommodation: 'None'
    }
  ],
  'bumthang-cultural-heartland': [
    {
      day: 1,
      title: 'Arrival in Paro',
      location: 'Paro',
      description: 'Welcome to Bhutan! Transfer to hotel. Prepare for your journey to the cultural heartland of Bumthang.',
      activities: ['Airport pickup', 'Hotel check-in', 'Trip briefing'],
      meals: 'Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 2,
      title: 'Paro to Bumthang',
      location: 'Bumthang',
      description: 'Scenic flight or drive to Bumthang (2,600m). The journey takes you through spectacular mountain scenery. Check into hotel in Jakar.',
      activities: ['Mountain travel', 'Scenic views', 'Jakar exploration'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Jakar'
    },
    {
      day: 3,
      title: 'Jakar Dzong and Village',
      location: 'Jakar',
      description: 'Visit Jakar Dzong (Fortress of the White Bird). Explore the village and meet local artisans. Visit Wangdue Choling Palace.',
      activities: ['Dzong visit', 'Village walk', 'Artisan visits'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Jakar'
    },
    {
      day: 4,
      title: 'Sacred Temples of Bumthang',
      location: 'Bumthang',
      description: 'Visit Jambay Lhakhang, Kurje Lhakhang (sacred temples dating to 7th century), and Tamshing Lhakhang. Learn about Buddhist history and legends.',
      activities: ['Temple visits', 'History tour', 'Spiritual sites'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Jakar'
    },
    {
      day: 5,
      title: 'Mebar Tsho (Burning Lake)',
      location: 'Tang Valley',
      description: 'Visit the sacred Mebar Tsho where Pema Lingpa discovered treasures. Drive through beautiful Tang Valley. Visit local cheese factory.',
      activities: ['Sacred lake visit', 'Tang Valley tour', 'Cheese factory'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Jakar'
    },
    {
      day: 6,
      title: 'Return to Paro',
      location: 'Paro',
      description: 'Fly back to Paro. Afternoon visit Tiger\'s Nest viewpoint. Evening cultural show.',
      activities: ['Return flight', 'Tiger\'s Nest view', 'Cultural show'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 7,
      title: 'Departure',
      location: 'Paro',
      description: 'Final shopping for Bumthang textiles and local products. Airport transfer.',
      activities: ['Shopping', 'Airport transfer'],
      meals: 'Breakfast',
      accommodation: 'None'
    }
  ],
  'cultural-triangle-experience': [
    {
      day: 1,
      title: 'Arrival in Paro',
      location: 'Paro',
      description: 'Welcome to Bhutan! Transfer to hotel. Introduction to the Cultural Triangle tour covering Paro, Thimphu, and Punakha.',
      activities: ['Airport pickup', 'Trip briefing', 'Evening rest'],
      meals: 'Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 2,
      title: 'Paro to Thimphu',
      location: 'Thimphu',
      description: 'Drive to Thimphu (2,350m) - the capital city. Visit Memorial Chorten, Buddha Point, and Takin Preserve. Explore weekend market (if weekend).',
      activities: ['Capital city tour', 'Monastery visits', 'Market exploration'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Thimphu'
    },
    {
      day: 3,
      title: 'Thimphu Sightseeing',
      location: 'Thimphu',
      description: 'Visit Tashichho Dzong, Folk Heritage Museum, and School of Traditional Arts. See the paper factory and postage museum. Evening at leisure.',
      activities: ['Dzong visit', 'Museum tours', 'Craft demonstrations'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Thimphu'
    },
    {
      day: 4,
      title: 'Thimphu to Punakha',
      location: 'Punakha',
      description: 'Drive over Dochula Pass (3,150m) with panoramic Himalayan views. Visit Punakha Dzong - the most beautiful dzong in Bhutan. Walk through rice terraces.',
      activities: ['Mountain pass drive', 'Dzong visit', 'Rice field walk'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Punakha'
    },
    {
      day: 5,
      title: 'Punakha Valley',
      location: 'Punakha',
      description: 'Visit Chimi Lhakhang (Fertility Temple). Hike to Khamsum Yuelley Namgyal Chorten. raft on Punakha River (seasonal).',
      activities: ['Temple visit', 'Chorten hike', 'River rafting'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Punakha'
    },
    {
      day: 6,
      title: 'Return to Paro',
      location: 'Paro',
      description: 'Drive back to Paro via Dochula Pass. Afternoon visit Tiger\'s Nest viewpoint. Evening farewell dinner.',
      activities: ['Scenic drive', 'Tiger\'s Nest view', 'Farewell dinner'],
      meals: 'Breakfast, Lunch, Dinner',
      accommodation: 'Hotel in Paro'
    },
    {
      day: 7,
      title: 'Paro and Departure',
      location: 'Paro',
      description: 'Morning visit National Museum and Rinpung Dzong. Last minute shopping. Airport transfer.',
      activities: ['Museum visit', 'Shopping', 'Airport transfer'],
      meals: 'Breakfast',
      accommodation: 'None'
    }
  ]
};

async function addItineraries() {
  try {
    console.log('🏔️ Adding itinerary data to tours...\n');

    for (const [slug, itinerary] of Object.entries(tourItineraries)) {
      console.log(`Processing: ${slug}`);

      const { data: tour, error: findError } = await supabase
        .from('tours')
        .select('id, title')
        .eq('slug', slug)
        .single();

      if (findError) {
        console.log(`❌ Error finding ${slug}:`, findError.message);
        continue;
      }

      if (!tour) {
        console.log(`⚠️  Tour not found: ${slug}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('tours')
        .update({
          itinerary: itinerary,
          updated_at: new Date().toISOString()
        })
        .eq('id', tour.id);

      if (updateError) {
        console.log(`❌ Error updating ${tour.title}:`, updateError.message);
      } else {
        console.log(`✅ Updated: ${tour.title} (${itinerary.length} days)`);
      }
    }

    console.log('\n✨ Itinerary data added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addItineraries();