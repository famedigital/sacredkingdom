/**
 * Update Admin Password
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAdminPassword() {
  try {
    const newPassword = 'Admin@123';
    const hash = await bcrypt.hash(newPassword, 12);

    console.log('Updating admin password...');

    const { data, error } = await supabase
      .from('admin_users')
      .update({ password_hash: hash })
      .eq('email', 'admin@wangchuktour.com')
      .select();

    if (error) {
      console.error('Error updating password:', error.message);
      process.exit(1);
    }

    console.log('Password updated successfully!');
    console.log('Email:', data[0].email);
    console.log('You can now login with:', 'admin@wangchuktour.com / Admin@123');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));