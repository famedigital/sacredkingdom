// Test Cloudinary API with proper environment loading
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

console.log('Testing Cloudinary Integration...\n');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('Cloudinary Config:');
console.log('- Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('');

// Test fetching all images
cloudinary.api.resources({
  type: 'upload',
  max_results: 10
})
.then(result => {
  console.log('✅ Cloudinary Connection Successful!');
  console.log(`📁 Found ${result.resources?.length || 0} images in your account:\n`);

  result.resources?.slice(0, 5).forEach((img, i) => {
    console.log(`${i + 1}. ${img.public_id}`);
    console.log(`   URL: ${img.secure_url}`);
    console.log(`   Size: ${img.width}x${img.height}`);
    console.log(`   Format: ${img.format}`);
    console.log('');
  });

  console.log('✨ Cloudinary is working correctly!');
  console.log('📝 Your media picker should now load these images when you log in.');
})
.catch(error => {
  console.error('❌ Cloudinary Error:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Check your .env.local file has correct Cloudinary credentials');
  console.log('2. Verify your Cloudinary account is active');
  console.log('3. Make sure API keys have proper permissions');
});
