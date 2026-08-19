// Check admin users in database
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUsers() {
  console.log('Checking admin users...');

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*');

    if (error) {
      console.error('Error fetching admin users:', error);
      if (error.code === '42P01') {
        console.log('\n❌ The admin_users table does not exist in the database.');
        console.log('You need to create the admin_users table first.');
      }
      return;
    }

    if (!data || data.length === 0) {
      console.log('\n❌ No admin users found in the database.');
      console.log('You need to create at least one admin user.');
    } else {
      console.log('\n=== Admin Users ===');
      data.forEach((user, i) => {
        console.log(`\nAdmin User ${i + 1}:`);
        console.log('  ID:', user.id);
        console.log('  Name:', user.name);
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  Active:', user.is_active);
        console.log('  Created:', user.created_at);
      });
    }

    // Check if audit_logs table exists
    console.log('\n=== Checking audit_logs table ===');
    const { data: auditData, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);

    if (auditError) {
      console.log('⚠️  audit_logs table does not exist');
    } else {
      console.log('✅ audit_logs table exists');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkAdminUsers();