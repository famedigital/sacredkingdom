// Mock tour data for Wangchuk Tour

export interface Tour {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  duration: number;
  duration_nights: number;
  price: number;
  currency: string;
  category: 'cultural' | 'trekking' | 'festival' | 'spiritual' | 'adventure';
  tour_type: 'fixed' | 'custom';
  hero_image: string;
  gallery_images: string[];
  video_url?: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  best_season: string[];
  difficulty_level: 'easy' | 'moderate' | 'challenging';
  locations: string[];
  altitude_range: string;
  itinerary: ItineraryDay[];
  is_featured: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location: string;
  activities: string[];
  meals: string;
  accommodation: string;
}

export const mockTours: Tour[] = [
  {
    id: '1',
    title: 'Cultural Highlights of Bhutan',
    slug: 'cultural-highlights-bhutan',
    tagline: 'Discover the essence of the Land of the Thunder Dragon',
    description: 'Immerse yourself in Bhutan\'s rich cultural heritage as we journey through ancient monasteries, majestic dzongs, and sacred valleys. This carefully curated tour offers an authentic experience of Bhutanese life, from the bustling markets of Thimphu to the serene beauty of Punakha\'s valley.',
    duration: 7,
    duration_nights: 6,
    price: 1850,
    currency: 'USD',
    category: 'cultural',
    tour_type: 'fixed',
    hero_image: 'https://images.unsplash.com/photo-1629196914371-f43e0ff70bb5?w=1200&h=800&fit=crop',
    gallery_images: [
      'https://images.unsplash.com/photo-1629196914371-f43e0ff70bb5?w=800',
      'https://images.unsplash.com/photo-1609138138345-27f310103c61?w=800',
      'https://images.unsplash.com/photo-1617801443561-8f0d0343b9d9?w=800',
    ],
    highlights: [
      'Visit the iconic Tiger\'s Nest Monastery',
      'Explore ancient dzongs and monasteries',
      'Experience traditional Bhutanese hospitality',
      'Witness the changing of guards at Tashichho Dzong',
      'Shop at local handicraft markets'
    ],
    inclusions: [
      'All accommodation (3-4 star hotels)',
      'All meals (breakfast, lunch, dinner)',
      'English-speaking licensed guide',
      'Private transportation',
      'Airport transfers',
      'Permit fees',
      'Bottled water during tours'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Tips and gratuities',
      'Optional activities'
    ],
    best_season: ['spring', 'autumn'],
    difficulty_level: 'easy',
    locations: ['Paro', 'Thimphu', 'Punakha'],
    altitude_range: '1,200m - 3,100m',
    itinerary: [
      {
        day: 1,
        title: 'Arrive in Paro - Journey to Thimphu',
        description: 'Land at Paro International Airport, one of the world\'s most scenic airports. Enjoy the breathtaking drive to Thimphu, Bhutan\'s capital city.',
        location: 'Paro to Thimphu',
        activities: ['Airport pickup', 'Scenic drive to Thimphu', 'Evening walk in Thimphu town'],
        meals: 'Welcome dinner at local restaurant',
        accommodation: 'Hotel Thimphu Comfort'
      },
      {
        day: 2,
        title: 'Thimphu Sightseeing',
        description: 'Explore the capital city and its unique blend of tradition and modernity.',
        location: 'Thimphu',
        activities: ['Tashichho Dzong', 'Buddha Dordenma statue', 'National Library', 'Folk Heritage Museum'],
        meals: 'Breakfast, Lunch, Dinner',
        accommodation: 'Hotel Thimphu Comfort'
      },
      {
        day: 3,
        title: 'Thimphu to Punakha',
        description: 'Drive over Dochula Pass with stunning Himalayan views.',
        location: 'Thimphu to Punakha',
        activities: ['Dochula Pass (108 chortens)', 'Punakha Dzong', 'Chimi Lhakhang'],
        meals: 'Breakfast, Lunch, Dinner',
        accommodation: 'Hotel Punakha'
      },
      {
        day: 4,
        title: 'Punakha Valley Exploration',
        description: 'Discover the beautiful Punakha Valley.',
        location: 'Punakha',
        activities: ['Suspension bridge', 'Khamsum Yulley Namgyal Chorten', 'Rice terraces walk'],
        meals: 'Breakfast, Lunch, Dinner',
        accommodation: 'Hotel Punakha'
      },
      {
        day: 5,
        title: 'Punakha to Paro',
        description: 'Return to Paro with stops along the way.',
        location: 'Punakha to Paro',
        activities: ['Drive to Paro', 'Tiger\'s Nest viewpoint', 'Paro town exploration'],
        meals: 'Breakfast, Lunch, Dinner',
        accommodation: 'Hotel Paro'
      },
      {
        day: 6,
        title: 'Tiger\'s Nest Monastery',
        description: 'Hike to the iconic Taktsang Palphug Monastery.',
        location: 'Paro',
        activities: ['Tiger\'s Nest hike', 'Lunch at monastery cafeteria', 'Kyichu Lhakhang'],
        meals: 'Breakfast, Lunch, Farewell Dinner',
        accommodation: 'Hotel Paro'
      },
      {
        day: 7,
        title: 'Departure',
        description: 'Transfer to airport for your journey home.',
        location: 'Paro',
        activities: ['Airport transfer', 'Farewell'],
        meals: 'Breakfast',
        accommodation: ''
      }
    ],
    is_featured: true
  },
  {
    id: '2',
    title: 'Druk Path Trek - Himalayan Adventure',
    slug: 'druk-path-trek-bhutan',
    tagline: 'Journey through pristine Himalayan landscapes',
    description: 'Experience the breathtaking beauty of Bhutan\'s Himalayan mountains on this classic trekking route. The Druk Path Trek offers stunning views of sacred peaks, pristine lakes, and ancient rhododendron forests as you traverse high mountain passes between Paro and Thimphu.',
    duration: 10,
    duration_nights: 9,
    price: 2450,
    currency: 'USD',
    category: 'trekking',
    tour_type: 'fixed',
    hero_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
    gallery_images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    ],
    highlights: [
      'Trek through pristine Himalayan scenery',
      'Camp by sacred mountain lakes',
      'Views of Mount Jomolhari and Jichu Drake',
      'Experience traditional Bhutanese hospitality',
      'Visit ancient monasteries along the route'
    ],
    inclusions: [
      'All trekking equipment',
      'Experienced trekking guide and cook',
      'Tents and sleeping arrangements',
      'All meals during trek',
      'Pack animals and porters',
      'Permit fees',
      'Hotel accommodation before and after trek'
    ],
    exclusions: [
      'Personal trekking gear',
      'Travel insurance',
      'International flights',
      'Tips for trekking crew'
    ],
    best_season: ['spring', 'autumn'],
    difficulty_level: 'moderate',
    locations: ['Paro', 'Thimphu', 'Jili Dzong', 'Jimilang Tsho'],
    altitude_range: '2,400m - 4,200m',
    itinerary: [
      { day: 1, title: 'Arrive Paro', description: 'Airport pickup and hotel check-in', location: 'Paro', activities: ['Acclimatization walk'], meals: 'Dinner', accommodation: 'Hotel Paro' },
      { day: 2, title: 'Paro Acclimatization', description: 'Short hikes to prepare for trek', location: 'Paro', activities: ['Visit Tiger\'s Nest viewpoint', 'Kyichu Lhakhang'], meals: 'All meals', accommodation: 'Hotel Paro' },
      { day: 3, title: 'Trek Begins - Paro to Jili Dzong', description: 'Start the trek with climb to Jili Dzong', location: 'Paro to Jili Dzong', activities: ['Trek 5-6 hours', 'Camp at Jili Dzong'], meals: 'All meals', accommodation: 'Camping' },
      { day: 4, title: 'Jili Dzong to Jimilang Tsho', description: 'Trek to sacred lake', location: 'Jili Dzong to Jimilang Tsho', activities: ['Trek 6-7 hours', 'Lake views'], meals: 'All meals', accommodation: 'Camping' },
      { day: 5, title: 'Rest Day at Jimilang Tsho', description: 'Acclimatization and exploration', location: 'Jimilang Tsho', activities: ['Explore lake area', 'Rest'], meals: 'All meals', accommodation: 'Camping' },
      { day: 6, title: 'Jimilang Tsho to Simkota', description: 'Continue through rhododendron forests', location: 'Jimilang Tsho to Simkota', activities: ['Trek 5-6 hours', 'Mountain views'], meals: 'All meals', accommodation: 'Camping' },
      { day: 7, title: 'Simkota to Phajoding', description: 'Cross high passes with panoramic views', location: 'Simkota to Phajoding', activities: ['Trek 5-6 hours', 'Visit Phajoding monastery'], meals: 'All meals', accommodation: 'Camping' },
      { day: 8, title: 'Phajoding to Thimphu', description: 'Final descent to Thimphu', location: 'Phajoding to Thimphu', activities: ['Trek 3-4 hours', 'Hotel check-in'], meals: 'All meals', accommodation: 'Hotel Thimphu' },
      { day: 9, title: 'Thimphu Exploration', description: 'Rest and explore the capital', location: 'Thimphu', activities: ['City sightseeing'], meals: 'All meals', accommodation: 'Hotel Thimphu' },
      { day: 10, title: 'Departure', description: 'Airport transfer', location: 'Thimphu to Paro', activities: ['Transfer to airport'], meals: 'Breakfast', accommodation: '' }
    ],
    is_featured: true
  },
  {
    id: '3',
    title: 'Paro Tsechu Festival Experience',
    slug: 'paro-tsechu-festival-tour',
    tagline: 'Witness Bhutan\'s most spectacular religious festival',
    description: 'Join us for the annual Paro Tsechu, one of Bhutan\'s most vibrant and sacred festivals. Watch monks perform ancient masked dances, receive blessings, and immerse yourself in centuries-old Buddhist traditions. This special departure coincides with the festival dates.',
    duration: 8,
    duration_nights: 7,
    price: 2200,
    currency: 'USD',
    category: 'festival',
    tour_type: 'fixed',
    hero_image: 'https://images.unsplash.com/photo-1545564806-29367ab2a0ca?w=1200&h=800&fit=crop',
    gallery_images: [
      'https://images.unsplash.com/photo-1545564806-29367ab2a0ca?w=800',
    ],
    highlights: [
      'Witness the Paro Tsechu festival',
      'See the unfurling of the Thongdrel',
      'Receive blessings from sacred relics',
      'Experience traditional Bhutanese culture',
      'Join in the festive celebrations'
    ],
    inclusions: [
      'Festival viewing arrangements',
      'All accommodation',
      'All meals',
      'English-speaking guide',
      'Transportation',
      'Permit fees'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal expenses'
    ],
    best_season: ['spring'],
    difficulty_level: 'easy',
    locations: ['Paro', 'Thimphu'],
    altitude_range: '2,100m - 2,400m',
    itinerary: [
      { day: 1, title: 'Arrive Paro', description: 'Airport pickup', location: 'Paro', activities: ['Welcome ceremony'], meals: 'Dinner', accommodation: 'Hotel Paro' },
      { day: 2, title: 'Paro Sightseeing', description: 'Explore Paro valley', location: 'Paro', activities: ['National Museum', 'Paro Dzong'], meals: 'All meals', accommodation: 'Hotel Paro' },
      { day: 3, title: 'Tsechu Day 1', description: 'First day of festival', location: 'Paro', activities: ['Festival viewing', 'Masked dances'], meals: 'All meals', accommodation: 'Hotel Paro' },
      { day: 4, title: 'Tsechu Day 2', description: 'Festival continues', location: 'Paro', activities: ['Festival viewing', 'Religious ceremonies'], meals: 'All meals', accommodation: 'Hotel Paro' },
      { day: 5, title: 'Tsechu Day 3', description: 'Thongdrel unfurling', location: 'Paro', activities: ['Early morning ceremony', 'Thongdrel viewing'], meals: 'All meals', accommodation: 'Hotel Paro' },
      { day: 6, title: 'Thimphu Excursion', description: 'Visit capital city', location: 'Thimphu', activities: ['City tour'], meals: 'All meals', accommodation: 'Hotel Thimphu' },
      { day: 7, title: 'Return to Paro', description: 'Travel back to Paro', location: 'Paro', activities: ['Free time', 'Shopping'], meals: 'All meals', accommodation: 'Hotel Paro' },
      { day: 8, title: 'Departure', description: 'Airport transfer', location: 'Paro', activities: ['Transfer'], meals: 'Breakfast', accommodation: '' }
    ],
    is_featured: true
  },
  {
    id: '4',
    title: 'Sacred Buddhist Trail',
    slug: 'sacred-buddhist-trail-bhutan',
    tagline: 'Pilgrimage to Bhutan\'s most sacred sites',
    description: 'Follow in the footsteps of Buddhist saints and masters on this spiritual journey through Bhutan\'s most sacred monasteries and temples. Experience the profound peace and wisdom of Buddhist practice in the Land of the Thunder Dragon.',
    duration: 9,
    duration_nights: 8,
    price: 2100,
    currency: 'USD',
    category: 'spiritual',
    tour_type: 'fixed',
    hero_image: 'https://images.unsplash.com/photo-1609138138345-27f310103c61?w=1200&h=800&fit=crop',
    gallery_images: [],
    highlights: [
      'Visit Tiger\'s Nest (Taktsang Palphug)',
      'Meditation at sacred sites',
      'Meet Buddhist monks and masters',
      'Experience traditional ceremonies',
      'Visit ancient temples and chortens'
    ],
    inclusions: [
      'All accommodation',
      'All meals',
      'Spiritual guide',
      'Transportation',
      'Permit fees',
      'Meditation sessions'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Offerings/donations'
    ],
    best_season: ['spring', 'autumn', 'winter'],
    difficulty_level: 'easy',
    locations: ['Paro', 'Thimphu', 'Punakha', 'Bumthang'],
    altitude_range: '1,500m - 3,100m',
    itinerary: [],
    is_featured: false
  },
  {
    id: '5',
    title: 'Custom Bhutan Adventure',
    slug: 'custom-bhutan-adventure',
    tagline: 'Design your perfect Bhutanese journey',
    description: 'Create your own unique Bhutan experience with our custom tour option. Choose your destinations, activities, and pace. Our expert team will craft a personalized itinerary just for you.',
    duration: 0,
    duration_nights: 0,
    price: 0,
    currency: 'USD',
    category: 'adventure',
    tour_type: 'custom',
    hero_image: 'https://images.unsplash.com/photo-1617801443561-8f0d0343b9d9?w=1200&h=800&fit=crop',
    gallery_images: [],
    highlights: [
      'Fully customizable itinerary',
      'Flexible dates and duration',
      'Personal guide and driver',
      'Hand-picked accommodations',
      'Authentic local experiences'
    ],
    inclusions: [
      'Customized itinerary planning',
      'Choice of accommodation level',
      'Private transportation',
      'Personal guide',
      'All meals',
      'Permit fees'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal expenses'
    ],
    best_season: ['spring', 'summer', 'autumn', 'winter'],
    difficulty_level: 'easy',
    locations: [],
    altitude_range: 'Variable',
    itinerary: [],
    is_featured: false
  }
];

export const getTourBySlug = (slug: string): Tour | undefined => {
  return mockTours.find(tour => tour.slug === slug);
};

export const getFeaturedTours = (): Tour[] => {
  return mockTours.filter(tour => tour.is_featured);
};

export const getToursByCategory = (category: string): Tour[] => {
  return mockTours.filter(tour => tour.category === category);
};
