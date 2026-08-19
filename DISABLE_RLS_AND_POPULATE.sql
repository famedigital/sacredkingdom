-- =====================================================
-- TEMPORARILY DISABLE RLS TO POPULATE DATA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Disable RLS for the tables we need to populate
ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE tours DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- You can now run your populate-images.js script
-- After population, run the RLS_RE_ENABLE.sql script to restore RLS