require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'hckgrdeh',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

console.log('Searching for Punakha Dzong images in Cloudinary...');

async function findPunakhaImages() {
  try {
    const result = await cloudinary.search
      .expression('punakha*')
      .sort_by('public_id', 'desc')
      .max_results(20)
      .execute();

    console.log('\n📊 Found Punakha images:');
    if (result.resources && result.resources.length > 0) {
      result.resources.forEach((image) => {
        console.log(`\n📸 ${image.public_id}`);
        console.log(`   URL: ${image.secure_url}`);
        console.log(`   Format: ${image.format}`);
        console.log(`   Width: ${image.width}, Height: ${image.height}`);
      });
    } else {
      console.log('No Punakha images found');
    }

    // Also search for dzong
    const dzongResult = await cloudinary.search
      .expression('dzong')
      .sort_by('public_id', 'desc')
      .max_results(20)
      .execute();

    console.log('\n📊 Found Dzong images:');
    if (dzongResult.resources && dzongResult.resources.length > 0) {
      dzongResult.resources.forEach((image) => {
        console.log(`\n📸 ${image.public_id}`);
        console.log(`   URL: ${image.secure_url}`);
        console.log(`   Format: ${image.format}`);
        console.log(`   Width: ${image.width}, Height: ${image.height}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findPunakhaImages();