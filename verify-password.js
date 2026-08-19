// Test if password matches existing hash
const bcrypt = require('bcrypt');

async function verifyPassword() {
  const existingHash = '$2b$12$MjIeB94YRg8UUG1R4TsM/eQUrivlXwxT2e4U3qZ5vkuZj6TnUeUh2';
  const password = 'Admin@123';

  console.log('Testing password:', password);
  console.log('Against hash:', existingHash);

  const isValid = await bcrypt.compare(password, existingHash);
  console.log('Password valid:', isValid);

  // If not valid, generate correct hash
  if (!isValid) {
    console.log('\n❌ Password does not match hash!');
    console.log('Generating correct hash for:', password);

    const correctHash = await bcrypt.hash(password, 12);
    console.log('Correct hash:', correctHash);
    console.log('\nRun this SQL in Supabase:');
    console.log(`UPDATE admin_users SET password_hash = '${correctHash}' WHERE email = 'admin@wangchuktour.com';`);
  } else {
    console.log('\n✅ Password is correct! The issue might be elsewhere.');
  }
}

verifyPassword().catch(console.error);