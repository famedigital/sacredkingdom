// Simple script to generate bcrypt hash for admin user
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'Admin@123'; // Default admin password
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generateHash().catch(console.error);