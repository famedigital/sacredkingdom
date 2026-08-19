// Check if blogs table exists and show current blogs
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkBlogs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('Checking blogs table...\n');

  try {
    // Try to query the blogs table
    const { data, error, status } = await supabase
      .from('blogs')
      .select('id, title, slug, is_published, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error accessing blogs table:');
      console.log('   Status:', status);
      console.log('   Message:', error.message);
      console.log('\n💡 The blogs table might not exist yet.');
      console.log('   Please run the SQL from "create-blogs-table.sql" in your Supabase SQL Editor.');
      return;
    }

    if (!data || data.length === 0) {
      console.log('✅ Blogs table exists but is empty.');
      console.log('   You can import blog posts using: node import-blogs.js');
      return;
    }

    console.log(`✅ Found ${data.length} blog post(s):\n`);
    data.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Published: ${blog.is_published ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(blog.created_at).toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkBlogs().catch(console.error);
