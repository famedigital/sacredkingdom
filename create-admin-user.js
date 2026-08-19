// Create default admin user
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, publishableKey);

// Simple password hashing (for demo - use bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createAdminUser() {
  console.log('Creating default admin user...');

  const adminUser = {
    id: crypto.randomUUID(),
    email: 'admin@wangchuktour.com',
    name: 'Admin User',
    password_hash: hashPassword('admin123'),
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
    console.log('Password:', 'admin123');
    console.log('\n⚠️  Please change these credentials after first login!');
    console.log('Login URL: http://localhost:3000/admin/login');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createAdminUser();