-- ============================================================================
-- CANONICAL DATABASE SCHEMA FOR WANGCHUK TOUR CMS
-- ============================================================================
-- This is the single source of truth for the database schema.
-- All other schema files should be deleted and this one should be used instead.
-- Last Updated: 2026-07-10
-- ============================================================================

-- ============================================================================
-- BLOG POSTS TABLE
-- ============================================================================
-- Drop existing problematic tables if they exist
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- Create correctly structured blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_name TEXT NOT NULL,
  author_bio TEXT,
  author_avatar_url TEXT,
  author_avatar_public_id TEXT,
  featured_image_url TEXT,
  featured_image_public_id TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  meta_description TEXT,
  meta_keywords TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  read_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_name);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust these based on your authentication system)
-- Allow all users (including unauthenticated) to read published posts
CREATE POLICY "Allow public read access for published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to read all posts
CREATE POLICY "Allow authenticated read access" ON blog_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins full access
CREATE POLICY "Allow admin full access" ON blog_posts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- COMMENTS ON COLUMNS
-- ============================================================================
COMMENT ON TABLE blog_posts IS 'Blog posts with full CMS functionality';
COMMENT ON COLUMN blog_posts.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN blog_posts.title IS 'Blog post title';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN blog_posts.content IS 'Main blog content (HTML/Markdown)';
COMMENT ON COLUMN blog_posts.excerpt IS 'Short summary for listing pages';
COMMENT ON COLUMN blog_posts.author_name IS 'Primary author name';
COMMENT ON COLUMN blog_posts.author_bio IS 'Author biographical information';
COMMENT ON COLUMN blog_posts.author_avatar_url IS 'Author profile picture URL';
COMMENT ON COLUMN blog_posts.author_avatar_public_id IS 'Cloudinary public ID for author avatar';
COMMENT ON COLUMN blog_posts.featured_image_url IS 'Featured image URL';
COMMENT ON COLUMN blog_posts.featured_image_public_id IS 'Cloudinary public ID for featured image';
COMMENT ON COLUMN blog_posts.category IS 'Blog category/classification';
COMMENT ON COLUMN blog_posts.tags IS 'Array of tags for filtering';
COMMENT ON COLUMN blog_posts.meta_description IS 'SEO meta description';
COMMENT ON COLUMN blog_posts.meta_keywords IS 'SEO meta keywords array';
COMMENT ON COLUMN blog_posts.published_at IS 'Publication timestamp';
COMMENT ON COLUMN blog_posts.status IS 'Post status: draft, published, archived';
COMMENT ON COLUMN blog_posts.views IS 'View counter for analytics';
COMMENT ON COLUMN blog_posts.read_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN blog_posts.created_at IS 'Creation timestamp';
COMMENT ON COLUMN blog_posts.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN blog_posts.created_by IS 'User ID of creator';
COMMENT ON COLUMN blog_posts.updated_by IS 'User ID of last updater';

-- ============================================================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - REMOVE IN PRODUCTION)
-- ============================================================================
-- Insert sample blog post for testing
INSERT INTO blog_posts (
  title,
  slug,
  content,
  excerpt,
  author_name,
  author_bio,
  category,
  tags,
  meta_description,
  status,
  published_at
) VALUES (
  'Welcome to Wangchuks Bhutan Tours',
  'welcome-to-wangchuk-tours',
  '<h2>Welcome to Wangchuks Bhutan Tours</h2><p>This is your first blog post. You can edit or delete it, or start a new post.</p>',
  'Welcome to our new blog - explore the beautiful Kingdom of Bhutan with us.',
  'Wangchuks Bhutan Tours Team',
  'Your trusted travel partner for Bhutan adventures',
  'Announcements',
  ARRAY['travel', 'bhutan', 'welcome'],
  'Welcome to Wangchuks Bhutan Tours - your premier travel partner for exploring the Kingdom of Bhutan.',
  'published',
  NOW()
);

-- ============================================================================
-- NOTES FOR DEPLOYMENT
-- ============================================================================
-- 1. Run this schema file in your Supabase SQL editor or via migration
-- 2. Verify that the blog_posts table was created successfully
-- 3. Test the RLS policies with your authentication system
-- 4. Remove the sample data INSERT statement for production
-- 5. Grant necessary permissions to your application user
-- ============================================================================