const cloudinary = require('cloudinary');

// Configure Cloudinary with your credentials
cloudinary.v2.config({
  cloud_name: 'hckgrdeh',
  api_key: '899967834874613',
  api_secret: 'IVrrbNOuALmDBp8w0Y3x-ouF3L8'
});

async function checkCloudinaryAssets() {
  try {
    console.log('🔍 Fetching all assets from Cloudinary...\n');

    // Fetch all resources
    const result = await cloudinary.v2.api.resources({
      type: 'upload',
      max_results: 500
    });

    console.log(`📊 Total assets found: ${result.resources.length}\n`);

    // Group by resource_type
    const images = result.resources.filter(r => r.resource_type === 'image');
    const videos = result.resources.filter(r => r.resource_type === 'video');

    console.log(`🖼️  Images: ${images.length}`);
    console.log(`🎥 Videos: ${videos.length}\n`);

    // Display images with details
    if (images.length > 0) {
      console.log('=== IMAGES ===\n');
      images.forEach((image, index) => {
        console.log(`${index + 1}. ${image.public_id}`);
        console.log(`   URL: ${image.secure_url}`);
        console.log(`   Format: ${image.format}`);
        console.log(`   Size: ${Math.round(image.bytes / 1024)}KB`);
        console.log(`   Width: ${image.width}px, Height: ${image.height}px`);
        if (image.context) {
          console.log(`   Context: ${JSON.stringify(image.context)}`);
        }
        console.log(`   Tags: ${image.tags ? image.tags.join(', ') : 'none'}`);
        console.log(`   Folder: ${image.folder || 'root'}`);
        console.log('');
      });
    }

    // Display videos
    if (videos.length > 0) {
      console.log('=== VIDEOS ===\n');
      videos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.public_id}`);
        console.log(`   URL: ${video.secure_url}`);
        console.log(`   Format: ${video.format}`);
        console.log('');
      });
    }

    // Check for folders
    console.log('\n=== FOLDERS ===\n');
    try {
      const folders = await cloudinary.v2.api.root_folders();
      folders.forEach(folder => {
        console.log(`📁 ${folder.name} (${folder.path})`);
      });
    } catch (error) {
      console.log('No folders found or error fetching folders');
    }

    // Search for Bhutan/tourism related images
    console.log('\n=== RELEVANT SEARCHES ===\n');

    const searchTerms = ['bhutan', 'tour', 'temple', 'mountain', 'landscape', 'culture', 'festival'];

    for (const term of searchTerms) {
      try {
        const searchResult = await cloudinary.v2.search
          .expression(term)
          .max_results(10)
          .execute();

        if (searchResult.resources.length > 0) {
          console.log(`🔍 "${term}" - Found ${searchResult.resources.length} images:`);
          searchResult.resources.forEach(img => {
            console.log(`   - ${img.public_id}`);
          });
        }
      } catch (error) {
        console.log(`⚠️  Error searching for "${term}": ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error fetching Cloudinary assets:', error.message);
  }
}

// Run the check
checkCloudinaryAssets();