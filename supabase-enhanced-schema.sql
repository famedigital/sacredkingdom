-- Enhanced Database Schema for Wangchuks Bhutan Tours & Treks
-- This schema supports full backend functionality with world-class best practices

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- ADMIN USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- admin, editor, contributor
  avatar_public_id VARCHAR(500),
  avatar_url TEXT,
  permissions JSONB DEFAULT '{}',
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip INET,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================
-- SITE SETTINGS (Global Content Management)
-- ============================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100), -- general, navigation, hero, seo, appearance, social
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can be accessed via public API
  validation_schema JSONB, -- For validating input
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEDIA LIBRARY (Centralized Cloudinary Management)
-- ============================================

CREATE TABLE IF NOT EXISTS media_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  public_id VARCHAR(500) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  secure_url TEXT,
  format VARCHAR(50),
  width INTEGER,
  height INTEGER,
  resource_type VARCHAR(50), -- image, video, raw
  folder VARCHAR(255),
  tags TEXT[],
  alt_text TEXT,
  caption TEXT,
  title VARCHAR(255),
  description TEXT,
  uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  file_size BIGINT,
  metadata JSONB, -- Additional Cloudinary metadata
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for media search
CREATE INDEX IF NOT EXISTS idx_media_tags ON media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_library(resource_type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media_library(uploaded_by);

-- ============================================
-- ENHANCED TOURS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  long_description TEXT,

  -- Images
  hero_image_public_id VARCHAR(500),
  hero_image_url TEXT,
  thumbnail_public_id VARCHAR(500),
  thumbnail_url TEXT,
  gallery_public_ids TEXT[], -- Array of public IDs
  gallery_urls TEXT[], -- Array of URLs

  -- Tour Details
  category VARCHAR(100), -- cultural, trekking, festival, spiritual, adventure
  duration INTEGER, -- in days
  price DECIMAL(10, 2),
  difficulty_level VARCHAR(50), -- easy, moderate, challenging
  max_group_size INTEGER,
  min_group_size INTEGER,

  -- Itinerary & Locations
  highlights TEXT[],
  included_items TEXT[],
  excluded_items TEXT[],
  itinerary JSONB, -- Structured day-by-day itinerary
  locations JSONB, -- Tour locations with coordinates
  departure_dates JSONB, -- Available departure dates

  -- Logistics
  accommodation_details JSONB,
  transportation_details JSONB,
  guide_information JSONB,
  pickup_locations TEXT[],

  -- Booking & Requirements
  booking_requirements JSONB,
  cancellation_policy TEXT,
  age_restrictions TEXT,
  fitness_requirements TEXT,

  -- Content
  faqs JSONB, -- Array of FAQ objects
  youtube_video_id VARCHAR(50), -- For video embeds

  -- SEO & Meta
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Status & Display
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Relations
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_duration CHECK (duration > 0)
);

-- Create indexes for tours
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tours_published ON tours(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_tours_sort_order ON tours(sort_order);
CREATE INDEX IF NOT EXISTS idx_tours_category_active ON tours(category, is_active) WHERE is_active = true;

-- ============================================
-- ENHANCED BLOG POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT, -- Rich text HTML content
  raw_content JSONB, -- Structured content for editing

  -- Images
  featured_image_public_id VARCHAR(500),
  featured_image_url TEXT,
  thumbnail_public_id VARCHAR(500),
  thumbnail_url TEXT,
  gallery_public_ids TEXT[],

  -- Author & Category
  author_name VARCHAR(255),
  author_slug VARCHAR(255),
  author_avatar_public_id VARCHAR(500),
  author_avatar_url TEXT,
  author_bio TEXT,

  category VARCHAR(100),
  tags TEXT[],
  series VARCHAR(255), -- For post series

  -- Publishing
  published_date DATE,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  read_time INTEGER, -- in minutes

  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  comments_enabled BOOLEAN DEFAULT true,

  -- SEO & Meta
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT, -- Open Graph image

  -- Relations
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_post_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_read_time CHECK (read_time > 0 AND read_time < 60)
);

-- Create indexes for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_published_date ON blog_posts(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_author ON blog_posts(author_slug);

-- ============================================
-- HERO SLIDES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255),
  subtitle TEXT,
  description TEXT,
  image_public_id VARCHAR(500) NOT NULL,
  image_url TEXT NOT NULL,
  mobile_image_public_id VARCHAR(500),
  mobile_image_url TEXT,
  tablet_image_public_id VARCHAR(500),
  tablet_image_url TEXT,

  -- Call to Action
  cta_text VARCHAR(255),
  cta_link VARCHAR(255),
  cta_style VARCHAR(50), -- primary, secondary, outline

  -- Display
  slide_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,

  -- Targeting
  target_audience TEXT[], -- ["cultural", "trekking"]
  show_on_pages TEXT[], -- ["home", "tours", "about"]

  -- Relations
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for hero slides
CREATE INDEX IF NOT EXISTS idx_hero_active ON hero_slides(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hero_order ON hero_slides(slide_order);
CREATE INDEX IF NOT EXISTS idx_hero_dates ON hero_slides(start_date, end_date);

-- ============================================
-- BOOKINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_number VARCHAR(50) UNIQUE NOT NULL,

  -- Tour Information
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  tour_title VARCHAR(255), -- Denormalized for history

  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_country VARCHAR(100),
  client_nationality VARCHAR(100),

  -- Booking Details
  number_of_adults INTEGER DEFAULT 0,
  number_of_children INTEGER DEFAULT 0,
  total_travelers INTEGER GENERATED ALWAYS AS (number_of_adults + number_of_children) STORED,
  travel_date DATE,
  preferred_dates JSONB, -- For flexible dates
  custom_requests TEXT,
  special_requirements TEXT[], -- dietary, accessibility, etc.

  -- Pricing
  total_amount DECIMAL(10, 2),
  deposit_amount DECIMAL(10, 2),
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  fully_paid BOOLEAN DEFAULT false,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, partial, paid, refunded

  -- Status & Workflow
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
  confirmation_date TIMESTAMP WITH TIME ZONE,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,

  -- Communication
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  last_contact_date DATE,
  follow_up_date DATE,
  notes TEXT, -- Internal notes
  client_communication TEXT[], -- Array of communication logs

  -- Relations
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_email CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_travelers CHECK (number_of_adults >= 0 AND number_of_children >= 0),
  CONSTRAINT valid_total CHECK (total_amount >= 0)
);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_booking_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_client_email ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_booking_travel_date ON bookings(travel_date);
CREATE INDEX IF NOT EXISTS idx_booking_assigned_to ON bookings(assigned_to);
CREATE INDEX IF NOT EXISTS idx_booking_payment_status ON bookings(payment_status);

-- ============================================
-- INQUIRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_number VARCHAR(50) UNIQUE NOT NULL,

  -- Contact Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),

  -- Inquiry Details
  subject VARCHAR(255),
  message TEXT NOT NULL,
  inquiry_type VARCHAR(50), -- general, booking, custom_tour, complaint, feedback
  tour_interest VARCHAR(255), -- Specific tour of interest
  preferred_dates VARCHAR(255),
  budget_range VARCHAR(50),
  group_size INTEGER,

  -- Status & Priority
  status VARCHAR(50) DEFAULT 'new', -- new, read, responding, responded, closed
  priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent

  -- Assignment & Resolution
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,

  -- Communication
  response_count INTEGER DEFAULT 0,
  last_communication_at TIMESTAMP WITH TIME ZONE,
  internal_notes TEXT,

  -- Relations
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_inquiry_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for inquiries
CREATE INDEX IF NOT EXISTS idx_inquiry_number ON inquiries(inquiry_number);
CREATE INDEX IF NOT EXISTS idx_inquiry_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_priority ON inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiry_assigned_to ON inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiry_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiry_created_at ON inquiries(created_at DESC);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  location VARCHAR(255),
  text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Images
  image_public_id VARCHAR(500),
  image_url TEXT,

  -- Tour Relation
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  tour_name VARCHAR(255), -- Denormalized

  -- Status
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false, -- Verified as actual customer

  -- Source
  source VARCHAR(50), -- google, tripadvisor, website, email
  source_url TEXT,
  date_of_experience DATE,

  -- Display
  display_order INTEGER DEFAULT 0,
  language VARCHAR(10) DEFAULT 'en',

  -- Relations
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_tour ON testimonials(tour_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name VARCHAR(255), -- Denormalized for history
  user_email VARCHAR(255),

  action VARCHAR(100) NOT NULL, -- create, update, delete, publish, unpublish, login, logout
  entity_type VARCHAR(100) NOT NULL, -- tour, blog, booking, media, settings
  entity_id UUID,
  entity_title VARCHAR(255), -- Denormalized for easy reading

  -- Change Details
  old_values JSONB,
  new_values JSONB,
  changes_summary TEXT, -- Human-readable summary

  -- Request Details
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(255), -- For correlation

  -- Additional Context
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

-- ============================================
-- NAVIGATION MENU TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR(100), -- header, footer, sidebar
  items JSONB NOT NULL, -- Nested menu structure
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT[], -- Array of variable names that can be used
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL, -- page_view, tour_view, booking_initiated, etc.
  entity_type VARCHAR(100),
  entity_id UUID,
  session_id VARCHAR(255),
  user_id UUID,

  -- Event Data
  properties JSONB,
  metadata JSONB,

  -- Request Info
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_library_updated_at ON media_library;
CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tours_updated_at ON tours;
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON hero_slides;
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_navigation_menus_updated_at ON navigation_menus;
CREATE TRIGGER update_navigation_menus_updated_at BEFORE UPDATE ON navigation_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking numbers
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_number := 'SKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('booking_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for booking numbers
CREATE SEQUENCE IF NOT EXISTS booking_seq START 1;

-- Create trigger for booking number generation
DROP TRIGGER IF EXISTS generate_booking_number_trigger ON bookings;
CREATE TRIGGER generate_booking_number_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();

-- Function to generate inquiry numbers
CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.inquiry_number := 'INQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('inquiry_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for inquiry numbers
CREATE SEQUENCE IF NOT EXISTS inquiry_seq START 1;

-- Create trigger for inquiry number generation
DROP TRIGGER IF EXISTS generate_inquiry_number_trigger ON inquiries;
CREATE TRIGGER generate_inquiry_number_trigger
  BEFORE INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION generate_inquiry_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admin users (only admins can manage users)
CREATE POLICY "Admins can manage all users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for bookings (admin users can see all, editors can see assigned)
CREATE POLICY "Admins can see all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Editors can see assigned bookings"
  ON bookings FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Policy for inquiries (similar to bookings)
CREATE POLICY "Admins can see all inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Editors can see assigned inquiries"
  ON inquiries FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Policy for audit logs (read-only for admins)
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Insert default site settings
INSERT INTO site_settings (key, value, category, description, is_public) VALUES
  ('site_name', '"Wangchuks Bhutan Tours & Treks"', 'general', 'Site name', true),
  ('site_tagline', '"Discover the Last Shangri-La"', 'general', 'Site tagline', true),
  ('site_description', '"Experience authentic Bhutanese culture, breathtaking Himalayan landscapes, and spiritual journeys that will transform your soul."', 'general', 'Site description for SEO', true),
  ('contact_email', '"info@wangchuktour.com"', 'general', 'Main contact email', true),
  ('contact_phone', '"+975 2 327654"', 'general', 'Main contact phone', true),
  ('contact_address', '"Thimphu, Bhutan"', 'general', 'Business address', true),
  ('social_facebook', '"https://facebook.com/wangchuktour"', 'social', 'Facebook page URL', true),
  ('social_instagram', '"https://instagram.com/wangchuktour"', 'social', 'Instagram profile URL', true),
  ('social_youtube', '"https://youtube.com/@wangchuktour"', 'social', 'YouTube channel URL', true),
  ('seo_title_template', '"{title} | Wangchuks Bhutan Tours & Treks"', 'seo', 'Title template for pages', false),
  ('seo_description_template', '"{description}"', 'seo', 'Meta description template', false),
  ('booking_deposit_percentage', '20', 'booking', 'Default deposit percentage', false),
  ('booking_confirmation_email', 'true', 'booking', 'Send confirmation email automatically', false),
  ('hero_autoplay', 'true', 'appearance', 'Autoplay hero slideshow', true),
  ('hero_interval', '6000', 'appearance', 'Hero slideshow interval in milliseconds', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default navigation menu
INSERT INTO navigation_menus (name, slug, location, items) VALUES
  ('Main Navigation', 'main-nav', 'header', '[
    {
      "label": "Home",
      "href": "/",
      "order": 1
    },
    {
      "label": "Tours",
      "href": "/tours",
      "order": 2
    },
    {
      "label": "About",
      "href": "/about",
      "order": 3
    },
    {
      "label": "Blog",
      "href": "/blog",
      "order": 4
    },
    {
      "label": "Contact",
      "href": "/contact",
      "order": 5
    }
  ]'::jsonb),
  ('Footer Navigation', 'footer-nav', 'footer', '[
    {
      "label": "Privacy Policy",
      "href": "/privacy",
      "order": 1
    },
    {
      "label": "Terms of Service",
      "href": "/terms",
      "order": 2
    },
    {
      "label": "Cancellation Policy",
      "href": "/cancellation",
      "order": 3
    }
  ]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for active tours with all necessary data
CREATE OR REPLACE VIEW active_tours_view AS
SELECT
  id,
  title,
  slug,
  tagline,
  hero_image_url,
  thumbnail_url,
  category,
  duration,
  price,
  difficulty_level,
  is_featured,
  view_count,
  created_at,
  updated_at
FROM tours
WHERE is_active = true AND is_published = true
ORDER BY sort_order ASC, created_at DESC;

-- View for published blog posts
CREATE OR REPLACE VIEW published_blog_posts_view AS
SELECT
  id,
  title,
  slug,
  excerpt,
  featured_image_url,
  thumbnail_url,
  author_name,
  author_avatar_url,
  category,
  tags,
  published_date,
  read_time,
  is_featured,
  views,
  created_at,
  updated_at
FROM blog_posts
WHERE is_published = true AND (scheduled_at IS NULL OR scheduled_at <= NOW())
ORDER BY published_date DESC;

-- View for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats_view AS
SELECT
  (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') AS confirmed_bookings,
  (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE) AS today_bookings,
  (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE payment_status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS monthly_revenue,
  (SELECT COUNT(*) FROM tours WHERE is_active = true AND is_published = true) AS active_tours,
  (SELECT COUNT(*) FROM blog_posts WHERE is_published = true) AS published_posts,
  (SELECT COUNT(*) FROM inquiries WHERE status = 'new') AS new_inquiries,
  (SELECT COUNT(*) FROM bookings WHERE travel_date >= CURRENT_DATE AND travel_date <= CURRENT_DATE + INTERVAL '7 days') AS upcoming_departures;

-- ============================================
-- COMPLETE
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced database schema created successfully!';
  RAISE NOTICE 'Remember to:';
  RAISE NOTICE '1. Run this schema in your Supabase SQL editor';
  RAISE NOTICE '2. Set up proper authentication in Supabase';
  RAISE NOTICE '3. Configure Row Level Security policies';
  RAISE NOTICE '4. Set up the first admin user manually';
END $$;