-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  hero_image_public_id VARCHAR(255),
  hero_image_url TEXT,
  thumbnail_public_id VARCHAR(255),
  thumbnail_url TEXT,
  gallery_public_ids TEXT[],
  category VARCHAR(100),
  duration INTEGER, -- in days
  price DECIMAL(10, 2),
  difficulty_level VARCHAR(50), -- 'easy', 'moderate', 'challenging'
  max_group_size INTEGER,
  min_group_size INTEGER,
  highlights TEXT[],
  included_items TEXT[],
  excluded_items TEXT[],
  itinerary JSONB, -- structured itinerary data
  departure_dates JSONB, -- array of departure dates
  locations JSONB, -- tour locations
  accommodation_details JSONB,
  transportation_details JSONB,
  guide_information JSONB,
  booking_requirements JSONB,
  cancellation_policy TEXT,
  faqs JSONB, -- array of FAQ objects
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero slideshow table
-- NOTE: Blog posts table is now in database-schema-canonical.sql
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255),
  subtitle TEXT,
  description TEXT,
  image_public_id VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  mobile_image_public_id VARCHAR(255),
  mobile_image_url TEXT,
  cta_text VARCHAR(255),
  cta_link VARCHAR(255),
  slide_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_public_id VARCHAR(255),
  image_url TEXT,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tours_sort_order ON tours(sort_order);

CREATE INDEX IF NOT EXISTS idx_hero_active ON hero_slides(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hero_order ON hero_slides(slide_order);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();