// Generate bcrypt hash for admin password
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'Admin@123';
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);

  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nCopy this hash into your SQL file');
}

generateHash().catch(console.error);