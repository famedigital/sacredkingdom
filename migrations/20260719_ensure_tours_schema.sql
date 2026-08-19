-- Ensure tours table supports the admin create/edit tour form.
-- Safe to re-run (idempotent).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tours ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS long_description TEXT;

ALTER TABLE tours ADD COLUMN IF NOT EXISTS hero_image_public_id VARCHAR(500);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS thumbnail_public_id VARCHAR(500);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gallery_public_ids TEXT[];
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];

ALTER TABLE tours ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);
-- Currency is derived from category in the app (international → USD, regional → INR).
-- Optional stored column for future explicit overrides:
ALTER TABLE tours ADD COLUMN IF NOT EXISTS currency VARCHAR(3);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS max_group_size INTEGER;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS min_group_size INTEGER;

ALTER TABLE tours ADD COLUMN IF NOT EXISTS highlights TEXT[];
ALTER TABLE tours ADD COLUMN IF NOT EXISTS included_items TEXT[];
ALTER TABLE tours ADD COLUMN IF NOT EXISTS excluded_items TEXT[];

-- itinerary JSONB shape (per day):
-- {
--   "day": 1,
--   "title": "...",
--   "location": "Paro" | "Thimphu" | "Punakha" | "Wangdue" | "Phobjkha" | "Bumthang" | "Phuntsholing",
--   "description": "...",
--   "meals": "Breakfast only" | "Breakfast and dinner" | "All meals",
--   "accommodation": "3 Star" | "4 Star" | "5 Star"
-- }
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS departure_dates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

ALTER TABLE tours ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tours_published ON tours(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_tours_gallery_urls ON tours USING GIN (gallery_urls);
CREATE INDEX IF NOT EXISTS idx_tours_included_items ON tours USING GIN (included_items);
CREATE INDEX IF NOT EXISTS idx_tours_itinerary ON tours USING GIN (itinerary);

COMMENT ON COLUMN tours.itinerary IS 'Day-by-day plan: day, title, location, description, meals, accommodation';
COMMENT ON COLUMN tours.included_items IS 'Tickable inclusions e.g. SDF, Rooms, Guides, Cars';
COMMENT ON COLUMN tours.excluded_items IS 'Tickable exclusions — same option set as included_items';
COMMENT ON COLUMN tours.gallery_urls IS 'Cloudinary (or CDN) image URLs for tour gallery';
