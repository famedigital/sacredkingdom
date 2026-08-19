// Diagnose blogs table schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseBlogSchema() {
  try {
    console.log('🔍 Diagnosing blogs table schema...\n');

    // Try to get one row to see the actual structure
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying blogs table:', error);
      return;
    }

    if (blogs && blogs.length > 0) {
      const sampleBlog = blogs[0];
      console.log('📊 Current columns in blogs table:');
      console.log(Object.keys(sampleBlog).map(key => `  ✅ ${key}`).join('\n'));
    } else {
      console.log('ℹ️ No blogs in table yet, checking schema information...');
    }

    // Check for expected columns
    const expectedColumns = [
      'id',
      'title',
      'slug',
      'excerpt',
      'content',
      'featured_image',
      'featured_image_public_id',
      'category',
      'tags',
      'author_name',
      'author_bio',
      'is_published',
      'is_featured',
      'published_date',
      'published_at',
      'read_time',
      'meta_title',
      'meta_description',
      'meta_keywords',
      'created_by',
      'updated_by',
      'created_at',
      'updated_at'
    ];

    if (blogs && blogs.length > 0) {
      const existingColumns = Object.keys(blogs[0]);
      const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));

      if (missingColumns.length > 0) {
        console.log('\n❌ Missing columns:');
        missingColumns.forEach(col => console.log(`  ❌ ${col}`));
      } else {
        console.log('\n✅ All expected columns exist!');
      }
    }

    // Try a test insert to see what errors we get
    console.log('\n🧪 Testing insert operation...');
    const testPost = {
      title: 'Test Post',
      slug: 'test-post',
      excerpt: 'Test excerpt',
      content: 'Test content',
      category: 'Travel',
      tags: ['test'],
      author_name: 'Test Author',
      is_published: false,
      is_featured: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('blogs')
      .insert(testPost)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      console.log('🔧 This indicates which columns are missing or have issues');

      // Clean up test data if it was partially created
      if (!insertError.message.includes('column')) {
        await supabase.from('blogs').delete().eq('slug', 'test-post');
      }
    } else {
      console.log('✅ Insert test successful!');
      // Clean up test data
      await supabase.from('blogs').delete().eq('slug', 'test-post');
    }

  } catch (error) {
    console.error('❌ Diagnosis error:', error);
  }
}

diagnoseBlogSchema().then(() => {
  console.log('\n🏁 Diagnosis complete');
  process.exit(0);
});