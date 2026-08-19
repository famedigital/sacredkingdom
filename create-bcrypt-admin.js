// Create admin user with proper bcrypt password hash
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key exists:', !!serviceRoleKey);
console.log('Service Role Key length:', serviceRoleKey?.length);

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
  console.log('Creating admin user with bcrypt password hash...');

  // Hash password with bcrypt (matching the auth system)
  const password = 'Admin@123';
  const saltRounds = 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  const adminUser = {
    id: crypto.randomUUID(),
    email: 'admin@wangchuktour.com',
    name: 'Admin User',
    password_hash: password_hash,
    role: 'admin',
    is_active: true,
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([adminUser])
      .select();

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('✅ Successfully created admin user!');
    console.log('\n=== Admin Login Credentials ===');
    console.log('Email:', adminUser.email);
    console.log('Password:', password);
    console.log('\n⚠️  Please change these credentials after first login!');
    console.log('Login URL: http://localhost:3000/admin/login');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createAdminUser();