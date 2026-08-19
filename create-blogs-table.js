// Script to create blogs table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createBlogsTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('Creating blogs table...\n');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS blogs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      featured_image_url TEXT,
      featured_image_public_id TEXT,
      category TEXT,
      tags TEXT[],
      author_name TEXT,
      author_bio TEXT,
      is_published BOOLEAN DEFAULT false,
      is_featured BOOLEAN DEFAULT false,
      published_date TIMESTAMP WITH TIME ZONE,
      read_time INTEGER,
      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create index on slug for faster lookups
    CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);

    -- Create index on published status for filtering
    CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published, published_date DESC);

    -- Create index on category for filtering
    CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);

    -- Create trigger for updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
    CREATE TRIGGER update_blogs_updated_at
      BEFORE UPDATE ON blogs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    // Execute the SQL directly using Supabase client
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      // If rpc fails, try using raw SQL through the rest API
      console.log('RPC failed, trying direct SQL execution...');
      console.log('Please run the following SQL in your Supabase SQL Editor:\n');
      console.log(createTableSQL);
    } else {
      console.log('✅ Blogs table created successfully!');
    }
  } catch (error) {
    console.log('Error creating table. Please run the following SQL in your Supabase SQL Editor:\n');
    console.log(createTableSQL);
  }
}

createBlogsTable().catch(console.error);
