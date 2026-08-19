/**
 * Database Check Script - Check all blog posts in the database
 * Run with: node check-blog-posts.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Error: Missing Supabase URL');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL is set in .env.local');
  process.exit(1);
}

// Use service role key for admin access (more permissions)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ Error: Missing Supabase key');
  console.error('Please ensure SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is set in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey
);

async function checkBlogPosts() {
  console.log('🔍 Checking blog posts in database...\n');

  try {
    // Query all blog posts
    const { data: posts, error, count } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error.message);
      throw error;
    }

    console.log(`✅ Successfully connected to database`);
    console.log(`📊 Total blog posts found: ${posts ? posts.length : 0}\n`);

    if (!posts || posts.length === 0) {
      console.log('📭 No blog posts found in database');
      console.log('💡 Try creating a blog post through the admin panel');
      return;
    }

    // Display summary
    console.log('📋 BLOG POSTS SUMMARY:');
    console.log('═'.repeat(80));

    posts.forEach((post, index) => {
      const num = index + 1;
      console.log(`\n${num}. ${post.title}`);
      console.log('   ' + '─'.repeat(76));
      console.log(`   🆔 ID:         ${post.id}`);
      console.log(`   📝 Slug:       ${post.slug}`);
      console.log(`   📂 Status:     ${post.status}`);
      console.log(`   👤 Author:     ${post.author_name || 'Not set'}`);
      console.log(`   📅 Created:    ${new Date(post.created_at).toLocaleString()}`);
      console.log(`   📄 Excerpt:    ${post.excerpt?.substring(0, 60) || 'No excerpt'}...`);

      if (post.featured_image_url) {
        console.log(`   🖼️  Image:      ${post.featured_image_url}`);
      }

      if (post.category) {
        console.log(`   🏷️  Category:   ${post.category}`);
      }

      if (post.tags && post.tags.length > 0) {
        console.log(`   🏷️  Tags:       ${post.tags.join(', ')}`);
      }

      console.log(`   📊 Stats:      ${post.views || 0} views, ${post.read_time || 0} min read`);

      if (post.published_at) {
        console.log(`   📖 Published:  ${new Date(post.published_at).toLocaleString()}`);
      }
    });

    // Status breakdown
    console.log('\n\n📈 STATUS BREAKDOWN:');
    console.log('═'.repeat(80));

    const statusCount = posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {});

    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} posts`);
    });

    // Recent activity
    console.log('\n⏰ MOST RECENT ACTIVITY:');
    console.log('═'.repeat(80));
    const recentPosts = posts.slice(0, 3);
    recentPosts.forEach((post, index) => {
      const timeAgo = getTimeAgo(post.created_at);
      console.log(`   ${index + 1}. ${post.title} (${timeAgo})`);
    });

    console.log('\n✅ Database check complete!');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check your Supabase credentials in .env.local');
    console.error('2. Ensure the blog_posts table exists in your database');
    console.error('3. Verify your Supabase project is active');
    console.error('4. Check your internet connection');
    process.exit(1);
  }
}

function getTimeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
}

// Run the check
checkBlogPosts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});