/**
 * QUICK DATABASE SETUP
 * Run: node setup-database.js
 * This will check your database connection and guide you through setup
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please ensure you have:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🔧 Setting up Wangchuks Bhutan Tours Database...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing database connection...');
    const { data, error } = await supabase.from('admin_users').select('count').limit(1);

    if (error) {
      console.log('   ⚠️  Table might not exist. You need to run the SQL schema in Supabase.');
      console.log('   📋 Go to: https://supabase.com/dashboard');
      console.log('   📋 Navigate to your project → SQL Editor');
      console.log('   📋 Copy and run the SQL from: supabase-enhanced-schema.sql\n');

      console.log('📝 Quick SQL to create admin_users table:');
      console.log(`
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin user
INSERT INTO admin_users (email, password_hash, name, role, is_active, email_verified)
VALUES (
  'admin@wangchuktour.com',
  '$2b$12$HgtvGJqEgu3DKhvRbmPFP.rkixdtzcEr31F5HvgcoxjuDVSEp4rZu',
  'Admin User',
  'super_admin',
  true,
  true
);
      `);
      return;
    }

    console.log('   ✅ Database connection successful!\n');

    // Check for admin users
    console.log('2️⃣ Checking for admin users...');
    const { data: users, error: usersError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('   ❌ Error checking admin users:', usersError.message);
      return;
    }

    if (users && users.length > 0) {
      console.log(`   ✅ Found ${users.length} admin user(s):`);
      users.forEach((user, i) => {
        console.log(`      ${i + 1}. ${user.name || 'Admin'} (${user.email})`);
        console.log(`         Role: ${user.role}, Active: ${user.is_active ? 'Yes' : 'No'}`);
      });
      console.log('\n   🌐 You can login at: http://localhost:3000/admin/login');
      console.log('   📧 Use the email and password shown above\n');
    } else {
      console.log('   ❌ No admin users found. Creating one...\n');

      // Create admin user
      const { data: newUser, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: 'admin@wangchuktour.com',
          password_hash: '$2b$12$HgtvGJqEgu3DKhvRbmPFP.rkixdtzcEr31F5HvgcoxjuDVSEp4rZu',
          name: 'Admin User',
          role: 'super_admin',
          is_active: true,
          email_verified: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('   ❌ Error creating admin user:', createError.message);
        console.log('   📝 You may need to create the admin_users table first.');
      } else {
        console.log('   ✅ Admin user created successfully!');
        console.log('\n   📋 Login Credentials:');
        console.log('   📧 Email: admin@wangchuktour.com');
        console.log('   🔑 Password: Admin@123');
        console.log('   🌐 Login at: http://localhost:3000/admin/login\n');
      }
    }

    // Check for required tables
    console.log('3️⃣ Checking required tables...');
    const requiredTables = ['tours', 'blog_posts', 'bookings', 'inquiries', 'hero_slides', 'testimonials'];

    for (const table of requiredTables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (tableError) {
        console.log(`   ⚠️  Table '${table}' not found - run the full schema`);
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();