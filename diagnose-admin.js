// Diagnose admin user and RLS issues
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = 'sb_publishable_MqZ5yaGAk5xptfpSM1iKmg_D7TP6zeO';

const supabase = createClient(supabaseUrl, publishableKey);

async function diagnose() {
  console.log('🔍 DIAGNOSING ADMIN USER ISSUE...\n');

  try {
    // Check 1: Try to count admin users
    console.log('📊 Checking admin_users table access...');
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Cannot access admin_users table:', countError.message);
      if (countError.code === '42501') {
        console.log('   ⚠️  RLS is blocking access to admin_users table');
      }
    } else {
      console.log(`✅ Found ${count} admin users in table`);
    }

    // Check 2: Try to select all users (might be blocked by RLS)
    console.log('\n🔍 Attempting to fetch all admin users...');
    const { data: users, error: selectError } = await supabase
      .from('admin_users')
      .select('*');

    if (selectError) {
      console.error('❌ Cannot select admin users:', selectError.message);
    } else {
      console.log(`✅ Successfully fetched ${users?.length || 0} users`);
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`   👤 User: ${user.email} (${user.name}) - Active: ${user.is_active}`);
        });
      }
    }

    // Check 3: Try to insert a test user (might be blocked by RLS)
    console.log('\n🔍 Testing RLS write permissions...');
    const { data: insertData, error: insertError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (insertError) {
      console.error('❌ Cannot even select for test:', insertError.message);
    } else {
      console.log('✅ Basic select works');
    }

  } catch (err) {
    console.error('❌ Diagnostic error:', err.message);
  }

  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('If you see RLS errors above, the issue is Row Level Security.');
  console.log('Solution: Run the SQL script in Supabase SQL Editor to fix RLS.');
}

diagnose();