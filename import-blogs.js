// Script to import blog posts from mock data to database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const mockBlogs = [
  {
    title: "The Ultimate Guide to Visiting Tiger's Nest Monastery",
    slug: 'ultimate-guide-tigers-nest-monastery',
    excerpt: "Discover everything you need to know about visiting Bhutan's most iconic sacred site - from preparation to the spiritual experience.",
    content: `# The Ultimate Guide to Visiting Tiger's Nest Monastery

Perched precariously on a cliff face at 3,120 meters, Taktsang Palphug Monastery, commonly known as Tiger's Nest, is Bhutan's most iconic landmark. This sacred site offers not just breathtaking views but a profound spiritual experience that draws pilgrims and travelers from around the world.

## History and Legend

The monastery's legend dates back to the 8th century when Guru Rinpoche, the Buddhist master who introduced Buddhism to Bhutan, meditated here. According to folklore, he flew to this location on the back of a tigress - hence the name "Tiger's Nest."

## Preparing for Your Visit

### Best Time to Visit
The monastery is accessible year-round, but spring (March-May) and autumn (September-November) offer the clearest weather and most comfortable hiking conditions.

### What to Bring
- Sturdy hiking shoes with good grip
- Water bottle
- Light jacket (mountain weather can change quickly)
- Camera for the incredible views
- Respectful attire (shoulders and knees covered)

## The Hike Experience

The hike to Tiger's Nest takes approximately 2-3 hours each way, covering about 3.5 kilometers. The trail winds through pine forests, past prayer wheels, and offers increasingly spectacular views.

### Key Points Along the Trail
1. **Base Camp**: Restaurants and rest area
2. **Mid-way Viewpoint**: Perfect photo opportunity
3. **The Ascent**: Ste final climb to the monastery

## Spiritual Significance

For Buddhists, Tiger's Nest is one of the most sacred sites in Bhutan. The cave where Guru Rinpoche meditated is considered a place of immense spiritual power. Many visitors report feeling a sense of peace and transformation.

## Photography Tips

The best views are from the opposite cliff face. Morning light offers dramatic illumination of the monastery against the mountain backdrop.

## Visiting Etiquette

- Remove shoes before entering temples
- Maintain silence in sacred spaces
- Ask permission before photographing monks or religious ceremonies
- Dress modestly

Whether you're seeking spiritual connection or simply one of the world's most stunning vistas, Tiger's Nest is an experience that will stay with you long after you've left Bhutan.`,
    featured_image: 'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911267/tigernest_paro_wdenqu.jpg',
    category: 'Travel Guide',
    tags: ['tigers-nest', 'monastery', 'paro', 'spiritual', 'hiking', 'bhutan-culture'],
    author_name: 'Wangchuk Dorji',
    author_bio: 'Founder of Wangchuk Tour with 15+ years of experience guiding travelers through Bhutan.',
    is_published: true,
    is_featured: true,
    published_date: '2024-03-15',
    meta_title: "The Ultimate Guide to Tiger's Nest Monastery - Wangchuk Tour",
    meta_description: "Complete guide to visiting Bhutan's sacred Tiger's Nest Monastery. Learn about the hike, history, and spiritual significance.",
  },
  {
    title: 'Bhutan in Spring: A Season of Transformation',
    slug: 'bhutan-spring-season-guide',
    excerpt: "Experience the magic of Bhutan's spring season when valleys bloom with rhododendrons and festivals come alive.",
    content: `# Bhutan in Spring: A Season of Transformation

Spring in Bhutan (March to May) is arguably the most magical time to visit the Land of the Thunder Dragon. As winter's grip loosens, the entire kingdom transforms into a tapestry of colors, sounds, and spiritual energy.

## Natural Beauty

### Rhododendron Blooms
The hillsides explode with rhododendrons of every hue - from delicate pinks to vibrant reds. The trekking routes, particularly the Druk Path and Jomolhari, offer spectacular displays of these Himalayan flowers.

### Wildlife Awakening
Spring brings new life to Bhutan's valleys. It's an excellent time for birdwatching, with migratory species returning and native birds beginning their breeding seasons.

## Festival Season

### Paro Tsechu
Usually held in March or April, the Paro Tsechu is one of Bhutan's most important festivals. The five-day celebration commemorates Guru Rinpoche with masked dances, religious ceremonies, and the unfurling of the sacred Thongdrel.

### Punakha Drubchen
This unique festival in February or March reenacts the 17th-century battle where Bhutanese forces expelled Tibetan invaders.

## Weather Conditions

Spring offers mild daytime temperatures (15-20°C in valleys) and clear skies. It's ideal for both cultural tours and trekking, with mountain passes becoming accessible as snow melts.

## Spring Itinerary Recommendations

### Cultural Highlights
- Paro Valley exploration
- Thimphu cultural sites
- Punakha Dzong and valley
- Phobjikha Valley (black-necked cranes before migration)

### Spring Treks
- Druk Path Trek (6 days)
- Jomolhari Trek (9 days)
- Bumthang Cultural Trek (5 days)

## Packing for Spring

Layers are essential. Days can be warm, but nights remain cool, especially at higher altitudes. Include:
- Light thermal wear
- Waterproof jacket
- Comfortable walking shoes
- Sun protection

Spring in Bhutan isn't just a season - it's a celebration of life, culture, and natural beauty that will leave you transformed.`,
    featured_image: 'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911323/phobjikha1_ddflbj.jpg',
    category: 'Seasonal',
    tags: ['spring', 'festivals', 'rhododendrons', 'best-time-to-visit'],
    author_name: 'Karma Wangchuk',
    author_bio: 'Senior guide at Wangchuk Tour with expertise in Bhutanese history and Buddhism.',
    is_published: true,
    is_featured: true,
    published_date: '2024-02-20',
    meta_title: 'Bhutan in Spring - Complete Season Guide',
    meta_description: 'Discover why spring is the perfect time to visit Bhutan. Rhododendrons, festivals, and ideal trekking conditions await.',
  },
  {
    title: 'Understanding Gross National Happiness',
    slug: 'understanding-gross-national-happiness-bhutan',
    excerpt: "Explore Bhutan's unique development philosophy that prioritizes wellbeing over economic growth.",
    content: `# Understanding Gross National Happiness

In a world obsessed with GDP, Bhutan offers a radically different approach to measuring progress - Gross National Happiness (GNH). This revolutionary philosophy, first articulated by the Fourth King of Bhutan in the 1970s, puts the wellbeing of citizens and the environment at the center of national policy.

## The Four Pillars of GNH

### 1. Sustainable Socio-Economic Development
Economic growth that serves people, not the other way around. Bhutan focuses on:
- Providing free education and healthcare
- Supporting traditional livelihoods
- Ensuring equitable distribution of resources

### 2. Environmental Conservation
Bhutan maintains:
- Over 70% forest cover (constitutional requirement)
- Carbon negative status
- Protected areas covering half the country
- One of the world's highest biodiversity indices

### 3. Preservation and Promotion of Culture
- Intangible cultural heritage protection
- Traditional arts and crafts support
- Bhutanese language promotion
- Traditional dress (kira and gho) encouraged

### 4. Good Governance
- Democratic institutions since 2008
- Regular citizen satisfaction surveys
- Transparency and accountability measures
- Decentralized decision-making

## GNH in Practice

### Tourism Policy
Bhutan's "high value, low volume" tourism approach embodies GNH principles:
- Daily tariff system ensures quality over quantity
- Cultural preservation over commercialization
- Environmental protection over mass tourism

### Education System
Schools include:
- GNH values in curriculum
- Environmental education
- Cultural activities
- Meditation and mindfulness

## What Visitors Notice

Travelers to Bhutan consistently remark on:
- The genuine happiness of people they meet
- The absence of advertising and consumer pressure
- Strong community bonds
- Respect for tradition while embracing progress

## Global Influence

Bhutan's GNH philosophy has inspired:
- UN World Happiness Reports
- Wellbeing economy movements globally
- Corporate wellbeing initiatives
- Alternative development metrics

## Experiencing GNH

As a visitor to Bhutan, you'll encounter GNH through:
- The warm hospitality of your hosts
- The preservation of sacred sites
- Sustainable tourism practices
- The balance of tradition and modernity

Gross National Happiness isn't just a policy - it's a lived philosophy that permeates every aspect of life in Bhutan, offering valuable lessons for our world.`,
    featured_image: 'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782911256/buddhapoint_z2kucc.jpg',
    category: 'Culture',
    tags: ['gnh', 'bhutan-philosophy', 'culture', 'sustainability'],
    author_name: 'Wangchuk Dorji',
    author_bio: 'Founder of Wangchuk Tour with 15+ years of experience guiding travelers through Bhutan.',
    is_published: true,
    is_featured: false,
    published_date: '2024-01-10',
    meta_title: 'Understanding Gross National Happiness in Bhutan',
    meta_description: "Learn about Bhutan's unique development philosophy that prioritizes citizen wellbeing over economic growth.",
  },
  {
    title: "A Beginner's Guide to Bhutanese Cuisine",
    slug: 'beginners-guide-bhutanese-cuisine',
    excerpt: 'From ema datshi to momos, discover the flavors that make Bhutanese food uniquely delicious.',
    content: `# A Beginner's Guide to Bhutanese Cuisine

Bhutanese cuisine is a delightful revelation for travelers - hearty, spicy, and deeply connected to the land. While influenced by neighboring Tibet, India, and Nepal, it has developed distinct characteristics that make it uniquely Bhutanese.

## The National Dish: Ema Datshi

Ema Datshi (chili cheese) is the heart and soul of Bhutanese cooking:
- Fresh green chilies cooked with local cheese
- Varying spice levels (usually quite hot!)
- Eaten with red rice

**Pro tip**: If you're sensitive to spice, ask for "easy on the chili" when ordering.

## Staple Ingredients

### Rice
- **Red rice**: Nutty, whole-grain variety
- **White rice**: More common, less nutritious
- Always served with meals

### Chilies
Used as vegetables, not just seasonings:
- Dried red chilies (winter)
- Fresh green chilies (summer)
- Chili powder (condiment)

### Cheese
- **Datshi**: Farmer's cheese, similar to paneer or feta
- Homemade in many households
- Essential ingredient in many dishes

## Must-Try Dishes

### Momos
Tibetan-style dumplings, wildly popular:
- **Beef momos**: Most common variety
- **Cheese momos**: Vegetarian option
- **Chicken momos**: Available in restaurants

### Shakam Paa
Dried beef cooked with chilies and radishes - a comfort food favorite.

### Kewa Datshi
Potato cheese curry - milder option for those avoiding spice.

### Phaksha Paa
Pork cooked with spicy chilies, radishes, and spinach.

### Suja
Butter tea - salty, rich tea consumed for breakfast and during cold weather.

### Ara
Traditional alcoholic beverage made from rice, maize, or wheat. Often served warm.

## Dining Etiquette

- Wash hands before eating (many places use fingers)
- Wait for elders to start first
- Leave a little food on your plate to show you're satisfied
- Try everything offered - it's respectful

## Where to Eat

### Local Eateries
Best for authentic flavors and affordable prices:
- Thimphu weekend market
- Paro town restaurants
- Local homestays

### Hotel Restaurants
Offer both local and international cuisine, with milder spice levels.

## Food Tours

Consider including:
- Cooking classes with local families
- Market visits with guides
- Traditional meals in villages

## Dietary Considerations

### Vegetarians
Bhutan is vegetarian-friendly:
- Many cheese-based dishes
- Buddhist influence means meat is less central
- Always available options

### Spice Levels
Most dishes can be adjusted:
- Ask for "no chili" if very sensitive
- "Easy chili" for moderate heat
- "Local style" for authentic spice level

Bhutanese cuisine is more than just food - it's a window into the culture, reflecting the country's mountainous terrain, Buddhist values, and communal spirit. Approach with an open mind and adventurous palate!`,
    featured_image: 'https://res.cloudinary.com/hckgrdeh/image/upload/q_auto,f_auto/v1782912157/dochula-tshechu_d3d6dg.jpg',
    category: 'Food & Culture',
    tags: ['food', 'cuisine', 'ema-datshi', 'bhutanese-culture'],
    author_name: 'Tashi Deki',
    author_bio: 'Operations Manager at Wangchuk Tour. Born and raised in Thimphu with deep knowledge of Bhutanese culture.',
    is_published: true,
    is_featured: false,
    published_date: '2023-12-05',
    meta_title: "A Beginner's Guide to Bhutanese Cuisine",
    meta_description: 'Discover the flavors of Bhutan - from spicy ema datshi to delicious momos. Complete guide to Bhutanese food.',
  },
];

async function importBlogs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('Starting blog import...\n');

  for (const blog of mockBlogs) {
    try {
      // Check if blog already exists
      const { data: existing } = await supabase
        .from('blogs')
        .select('id')
        .eq('slug', blog.slug)
        .single();

      if (existing) {
        console.log(`⚠️  Blog "${blog.title}" already exists (slug: ${blog.slug})`);
        continue;
      }

      // Insert blog
      const { data, error } = await supabase
        .from('blogs')
        .insert({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: blog.content,
          featured_image_url: blog.featured_image,
          category: blog.category,
          tags: blog.tags,
          author_name: blog.author_name,
          author_bio: blog.author_bio,
          is_published: blog.is_published,
          is_featured: blog.is_featured,
          published_date: blog.published_date,
          meta_title: blog.meta_title,
          meta_description: blog.meta_description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error(`❌ Error inserting "${blog.title}":`, error.message);
      } else {
        console.log(`✅ Successfully imported "${blog.title}" (ID: ${data[0].id})`);
      }
    } catch (error) {
      console.error(`❌ Error processing "${blog.title}":`, error.message);
    }
  }

  console.log('\n✨ Blog import complete!');
}

importBlogs().catch(console.error);
