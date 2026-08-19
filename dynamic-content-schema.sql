-- =====================================================
-- DYNAMIC CONTENT PAGES - PHASE 3
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. CREATE CONTENT_PAGES TABLE
-- This stores all the editable page content (About, Contact, FAQ, etc.)
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_type VARCHAR(50) UNIQUE NOT NULL, -- 'about', 'contact', 'faq', 'travel-info'
  content JSONB NOT NULL, -- Flexible JSON structure for page-specific content
  metadata JSONB DEFAULT '{}', -- Additional metadata like SEO, revision info
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- 2. CREATE FAQS TABLE
-- Stores frequently asked questions and answers
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL UNIQUE,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- 3. CREATE UPDATED_AT TRIGGER FOR NEW TABLES
CREATE OR REPLACE FUNCTION update_content_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_pages_updated_at
  BEFORE UPDATE ON content_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_content_pages_updated_at();

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_content_pages_updated_at();

-- 4. INITIAL CONTENT FOR ABOUT PAGE
INSERT INTO content_pages (page_type, content, metadata) VALUES (
  'about',
  '{
    "hero": {
      "title": "Discover the Last Shangri-La",
      "subtitle": "Experience authentic Bhutanese culture and breathtaking Himalayan landscapes",
      "backgroundImage": "https://res.cloudinary.com/hckgrdeh/image/upload/v1782911267/tigernest_paro_wdenqu.jpg",
      "cta": {
        "text": "Explore Our Tours",
        "link": "/tours"
      }
    },
    "story": {
      "title": "Our Story",
      "content": "Wangchuks Bhutan Tours & Treks is a Bhutanese-owned and operated tour company dedicated to showing travelers the authentic beauty of the Land of the Thunder Dragon. Founded with a passion for sharing our rich cultural heritage and pristine natural environment, we specialize in creating personalized journeys that go beyond typical tourist trails.",
      "founded": "2010"
    },
    "values": [
      {
        "title": "Authentic Experiences",
        "description": "We provide genuine Bhutanese experiences that connect you with local culture, traditions, and people."
      },
      {
        "title": "Sustainable Tourism",
        "description": "We practice responsible tourism that respects our environment and preserves Bhutan''s unique heritage."
      },
      {
        "title": "Personalized Service",
        "description": "Every journey is crafted to your interests, pace, and preferences for a truly personalized experience."
      },
      {
        "title": "Expert Local Guides",
        "description": "Our certified Bhutanese guides bring deep knowledge of history, culture, and spirituality to every tour."
      }
    ],
    "statistics": [
      { "number": "500+", "label": "Happy Travelers" },
      { "number": "15+", "label": "Years Experience" },
      { "number": "50+", "label": "Unique Tours" },
      { "number": "100%", "label": "Bhutanese Owned" }
    ],
    "timeline": [
      {
        "year": "2010",
        "title": "Company Founded",
        "description": "Wangchuks Bhutan Tours & Treks was established with a vision to share Bhutan''s beauty with the world."
      },
      {
        "year": "2015",
        "title": "Expansion",
        "description": "Grew from a small family business to a recognized tour operator with international partnerships."
      },
      {
        "year": "2020",
        "title": "Sustainability Focus",
        "description": "Committed to carbon-neutral operations and community-based tourism initiatives."
      }
    ],
    "team": [
      {
        "name": "Wangchuk Dorji",
        "role": "Founder & Director",
        "bio": "Born and raised in Bhutan, Wangchuk has over 20 years of experience in tourism and a deep passion for sharing his country''s unique culture.",
        "image": "https://via.placeholder.com/400x400"
      },
      {
        "name": "Tshering Pema",
        "role": "Head Guide",
        "bio": "Our lead guide has traveled every mountain pass in Bhutan and knows hidden temples, villages, and trails.",
        "image": "https://via.placeholder.com/400x400"
      }
    ]
  }',
  '{"seoTitle": "About Us - Wangchuks Bhutan Tours & Treks", "seoDescription": "Learn about our story, values, and the team behind authentic Bhutanese travel experiences."}'
) ON CONFLICT (page_type) DO NOTHING;

-- 5. INITIAL FAQ CONTENT
INSERT INTO faqs (question, answer, category, sort_order) VALUES
('What is the best time to visit Bhutan?', 'The best time to visit Bhutan is during spring (March-May) and autumn (September-November). These seasons offer clear skies, pleasant temperatures, and coincide with popular festivals like Paro Tsechu and Thimphu Tsechu.', 'General', 1),
('Do I need a visa to visit Bhutan?', 'Yes, all international visitors (except Indians, Bangladeshis, and Maldivians) require a visa to enter Bhutan. We will assist you in obtaining your visa through the online system or at your point of entry.', 'General', 2),
('What is the daily fee for tourists?', 'Bhutan has a Minimum Daily Package for tourists: $200-250 per day during peak seasons and $200 per day during off-peak seasons. This fee includes accommodation, meals, guide services, and transportation.', 'General', 3),
('Is Bhutan safe for tourists?', 'Bhutan is considered one of the safest travel destinations. Crime rates are very low, and the people are known for their hospitality and friendliness towards visitors.', 'Safety', 4),
('What should I pack for a Bhutan trip?', 'We recommend comfortable walking shoes, layered clothing for varying temperatures, rain gear, sunscreen, and any personal medications. For treks, sturdy hiking boots and warm clothing are essential.', 'Preparation', 5),
('Can I customize my tour itinerary?', 'Absolutely! All our tours can be customized to your interests, time frame, and budget. We specialize in creating personalized experiences that match your travel style.', 'Booking', 6)
ON CONFLICT (question) DO NOTHING;

-- 6. CREATE CONTACT SETTINGS
INSERT INTO content_pages (page_type, content, metadata) VALUES (
  'contact',
  '{
    "hero": {
      "title": "Get in Touch",
      "subtitle": "We''re here to help you plan your perfect Bhutanese adventure",
      "backgroundImage": "https://res.cloudinary.com/hckgrdeh/image/upload/v1782965945/punakhadzong_xkcrcu.jpg"
    },
    "contactInfo": {
      "email": "info@wangchuktour.com",
      "phone": "+975 2 327654",
      "address": "Thimphu, Bhutan",
      "whatsapp": "+975 17 00 00 00"
    },
    "officeHours": {
      "weekdays": "9:00 AM - 6:00 PM",
      "saturdays": "10:00 AM - 4:00 PM",
      "sundays": "Closed"
    },
    "socialMedia": {
      "facebook": "https://facebook.com/wangchuktours",
      "instagram": "https://instagram.com/wangchuktours",
      "twitter": "https://twitter.com/wangchuktours",
      "youtube": "https://youtube.com/@wangchuktours"
    },
    "formFields": {
      "showName": true,
      "showEmail": true,
      "showPhone": true,
      "showTravelDates": true,
      "showGroupSize": true,
      "showMessage": true,
      "requiredFields": ["name", "email", "message"]
    },
    "autoReply": {
      "enabled": true,
      "subject": "Thank you for contacting Wangchuks Bhutan Tours!",
      "message": "We have received your inquiry and will respond within 24 hours. In the meantime, explore our tour packages for inspiration!"
    }
  }',
  '{"seoTitle": "Contact Us - Wangchuks Bhutan Tours & Treks", "seoDescription": "Get in touch with our team for personalized Bhutan travel planning and inquiries."}'
) ON CONFLICT (page_type) DO NOTHING;

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_content_pages_type ON content_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_content_pages_active ON content_pages(is_active) WHERE is_active = true;

-- 8. SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DYNAMIC CONTENT PAGES SETUP COMPLETE! ✅';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  • content_pages table (About, Contact, FAQ content)';
  RAISE NOTICE '  • faqs table (Frequently Asked Questions)';
  RAISE NOTICE '  • Initial content seeded';
  RAISE NOTICE '  • Indexes created for performance';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Use the admin forms to edit About, FAQ, and Contact pages';
  RAISE NOTICE '  2. Frontend pages will automatically fetch from database';
  RAISE NOTICE '  3. All content changes are instant and require no code changes';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;