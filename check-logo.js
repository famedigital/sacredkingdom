require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary');

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: 'hckgrdeh',
  api_key: '899967834874613',
  api_secret: 'IVrrbNOuALmDBp8w0Y3x-ouF3L8'
});

async function checkLogos() {
  try {
    const result = await cloudinary.v2.search
      .expression('folder:tourphoto/LOGO')
      .sort_by('public_id', 'asc')
      .max_results(30)
      .execute();

    console.log('📁 LOGO Files Found:', result.total_count);
    console.log('\n🔍 Available Logos:');

    if (result.resources && result.resources.length > 0) {
      result.resources.forEach((resource, index) => {
        console.log(`\n${index + 1}. ${resource.public_id}`);
        console.log('   URL:', resource.secure_url);
        console.log('   Format:', resource.format);
        console.log('   Size:', `${resource.width}x${resource.height}`);
      });
    } else {
      console.log('❌ No logos found in tourphoto/LOGO folder');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkLogos();