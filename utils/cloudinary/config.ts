import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to get Cloudinary URL
export function getCloudinaryUrl(publicId: string, transformations?: any) {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
}

// Helper function to get optimized image URL
export function getOptimizedImageUrl(publicId: string, width?: number, height?: number) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width, height, crop: 'fit' }
    ].filter(Boolean)
  });
}

// Helper function to get thumbnail URL
export function getThumbnailUrl(publicId: string, width: number = 300, height: number = 200) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width, height, crop: 'fill' }
    ]
  });
}

// Helper function to get hero slideshow image URL
export function getHeroImageUrl(publicId: string, width: number = 1920, height: number = 1080) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width, height, crop: 'fill' }
    ]
  });
}

export default cloudinary;