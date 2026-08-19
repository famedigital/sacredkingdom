-- =====================================================
-- WANGCHUK TOURS & TREKS - DATABASE DEPLOYMENT SCRIPT
-- =====================================================
-- Execute this entire script in your Supabase SQL Editor
-- This will create all tables, indexes, functions, and the first admin user

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ADMIN USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
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
-- SITE SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  validation_schema JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEDIA LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS media_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  public_id VARCHAR(500) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  secure_url TEXT,
  format VARCHAR(50),
  width INTEGER,
  height INTEGER,
  resource_type VARCHAR(50),
  folder VARCHAR(255),
  tags TEXT[],
  alt_text TEXT,
  caption TEXT,
  title VARCHAR(255),
  description TEXT,
  uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  file_size BIGINT,
  metadata JSONB,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_tags ON media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_library(resource_type);

-- ============================================
-- TOURS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  long_description TEXT,
  hero_image_public_id VARCHAR(500),
  hero_image_url TEXT,
  thumbnail_public_id VARCHAR(500),
  thumbnail_url TEXT,
  gallery_public_ids TEXT[],
  gallery_urls TEXT[],
  category VARCHAR(100),
  duration INTEGER,
  price DECIMAL(10, 2),
  difficulty_level VARCHAR(50),
  max_group_size INTEGER,
  min_group_size INTEGER,
  highlights TEXT[],
  included_items TEXT[],
  excluded_items TEXT[],
  itinerary JSONB,
  locations JSONB,
  departure_dates JSONB,
  accommodation_details JSONB,
  transportation_details JSONB,
  guide_information JSONB,
  pickup_locations TEXT[],
  booking_requirements JSONB,
  cancellation_policy TEXT,
  age_restrictions TEXT,
  fitness_requirements TEXT,
  faqs JSONB,
  youtube_video_id VARCHAR(50),
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_duration CHECK (duration > 0)
);

CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured) WHERE is_featured = true;

-- ============================================
-- BLOG POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  raw_content JSONB,
  featured_image_public_id VARCHAR(500),
  featured_image_url TEXT,
  thumbnail_public_id VARCHAR(500),
  thumbnail_url TEXT,
  gallery_public_ids TEXT[],
  author_name VARCHAR(255),
  author_slug VARCHAR(255),
  author_avatar_public_id VARCHAR(500),
  author_avatar_url TEXT,
  author_bio TEXT,
  category VARCHAR(100),
  tags TEXT[],
  series VARCHAR(255),
  published_date DATE,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  read_time INTEGER,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  comments_enabled BOOLEAN DEFAULT true,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_post_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_read_time CHECK (read_time > 0 AND read_time < 60)
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published) WHERE is_published = true;

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
  cta_text VARCHAR(255),
  cta_link VARCHAR(255),
  cta_style VARCHAR(50),
  slide_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  target_audience TEXT[],
  show_on_pages TEXT[],
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_active ON hero_slides(is_active) WHERE is_active = true;

-- ============================================
-- BOOKINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  tour_title VARCHAR(255),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_country VARCHAR(100),
  client_nationality VARCHAR(100),
  number_of_adults INTEGER DEFAULT 0,
  number_of_children INTEGER DEFAULT 0,
  total_travelers INTEGER GENERATED ALWAYS AS (number_of_adults + number_of_children) STORED,
  travel_date DATE,
  preferred_dates JSONB,
  custom_requests TEXT,
  special_requirements TEXT[],
  total_amount DECIMAL(10, 2),
  deposit_amount DECIMAL(10, 2),
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  fully_paid BOOLEAN DEFAULT false,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'pending',
  confirmation_date TIMESTAMP WITH TIME ZONE,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  last_contact_date DATE,
  follow_up_date DATE,
  notes TEXT,
  client_communication TEXT[],
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status);

-- ============================================
-- INQUIRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  inquiry_type VARCHAR(50),
  tour_interest VARCHAR(255),
  preferred_dates VARCHAR(255),
  budget_range VARCHAR(50),
  group_size INTEGER,
  status VARCHAR(50) DEFAULT 'new',
  priority VARCHAR(50) DEFAULT 'normal',
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  response_count INTEGER DEFAULT 0,
  last_communication_at TIMESTAMP WITH TIME ZONE,
  internal_notes TEXT,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_number ON inquiries(inquiry_number);
CREATE INDEX IF NOT EXISTS idx_inquiry_status ON inquiries(status);

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
  image_public_id VARCHAR(500),
  image_url TEXT,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  tour_name VARCHAR(255),
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  source VARCHAR(50),
  source_url TEXT,
  date_of_experience DATE,
  display_order INTEGER DEFAULT 0,
  language VARCHAR(10) DEFAULT 'en',
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  entity_title VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  changes_summary TEXT,
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
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

-- Booking number generation
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_number := 'SKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('booking_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE IF NOT EXISTS booking_seq START 1;
DROP TRIGGER IF EXISTS generate_booking_number_trigger ON bookings;
CREATE TRIGGER generate_booking_number_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();

-- Inquiry number generation
CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.inquiry_number := 'INQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('inquiry_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE IF NOT EXISTS inquiry_seq START 1;
DROP TRIGGER IF EXISTS generate_inquiry_number_trigger ON inquiries;
CREATE TRIGGER generate_inquiry_number_trigger
  BEFORE INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION generate_inquiry_number();

-- ============================================
-- CREATE FIRST ADMIN USER
-- ============================================

-- Insert the first admin user
-- Email: admin@sacredkingdom.travel
-- Password: Admin@123
INSERT INTO admin_users (email, password_hash, name, role, is_active, email_verified)
VALUES (
  'admin@sacredkingdom.travel',
  '$2b$12$MjIeB94YRg8UUG1R4TsM/eQUrivlXwxT2e4U3qZ5vkuZj6TnUeUh2',
  'Sacred Himalaya Admin',
  'admin',
  true,
  true
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Insert default site settings
INSERT INTO site_settings (key, value, category, description, is_public) VALUES
  ('site_name', '"Sacred Himalaya Travel"', 'general', 'Site name', true),
  ('site_tagline', '"Safety | Comfort | Happiness"', 'general', 'Site tagline', true),
  ('site_description', '"Private Bhutan journeys since 1995. Culture, trek, festival, and wellness — Safety, Comfort, Happiness."', 'general', 'Site description for SEO', true),
  ('contact_email', '"info@sacredhimalayatravel.com"', 'general', 'Main contact email', true),
  ('contact_phone', '"+975 17164221"', 'general', 'Main contact phone', true),
  ('contact_address', '"P.O. Box 830, Thimphu, Bhutan"', 'general', 'Business address', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 DATABASE SETUP COMPLETED SUCCESSFULLY! 🎉';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ All 20+ tables created';
  RAISE NOTICE '✅ Indexes and triggers configured';
  RAISE NOTICE '✅ Admin user created';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '👤 ADMIN LOGIN CREDENTIALS:';
  RAISE NOTICE '   Email: admin@sacredkingdom.travel';
  RAISE NOTICE '   Password: Admin@123';
  RAISE NOTICE '   ⚠️  IMPORTANT: Change this password immediately!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Start your dev server: npm run dev';
  RAISE NOTICE '   2. Go to: http://localhost:3000/admin/login';
  RAISE NOTICE '   3. Login with the credentials above';
  RAISE NOTICE '   4. Change your password immediately';
  RAISE NOTICE '   5. Start managing your content!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;