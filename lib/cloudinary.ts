import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  url: string;
  secure_url: string;
}

export interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
  tags?: string[];
  context?: Record<string, string>;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: File | string,
  options?: {
    folder?: string;
    tags?: string[];
    transformation?: string;
    overwrite?: boolean;
  }
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      folder: options?.folder || 'sacred-himalaya',
      tags: options?.tags || [],
      overwrite: options?.overwrite ?? true,
      transformation: options?.transformation,
      resource_type: 'auto' as const,
    };

    let result;

    if (typeof file === 'string') {
      // Upload from URL
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // Upload from File object
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      result = await cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) throw error;
          return result;
        }
      );

      // For file uploads, we need to use a different approach
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        ).end(buffer);
      });
    }

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Get all images from Cloudinary with optional filtering
 */
export async function getCloudinaryImages(options?: {
  folder?: string;
  tags?: string[];
  maxResults?: number;
  resource_type?: string;
}): Promise<CloudinaryResource[]> {
  try {
    const params: any = {
      type: 'upload',
      max_results: options?.maxResults || 100,
      resource_type: options?.resource_type || 'image',
    };

    // Only add prefix if folder is specified
    if (options?.folder) {
      params.prefix = options.folder;
    }

    if (options?.tags && options.tags.length > 0) {
      params.tags = options.tags.join(',');
    }

    const result = await cloudinary.api.resources(params);
    return result.resources || [];
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    throw new Error('Failed to fetch images from Cloudinary');
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Get optimized image URL for frontend display
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
  }
): string {
  const transformations = [];

  if (options?.width || options?.height) {
    transformations.push(`w_${options?.width || 'auto'},h_${options?.height || 'auto'}`);
  }

  if (options?.crop) {
    transformations.push(`c_${options.crop}`);
  }

  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options?.format) {
    transformations.push(`f_${options.format}`);
  }

  // Default optimizations
  if (transformations.length === 0) {
    transformations.push('q_auto,f_auto');
  }

  const transformationString = transformations.join('/');

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(cloudinaryUrl: string): string {
  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/');

    // Find the index of 'upload' in the path
    const uploadIndex = pathParts.indexOf('upload');

    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL');
    }

    // Extract everything after 'upload/' and before file extension
    const publicIdWithExtension = pathParts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Failed to extract public ID from URL:', error);
    throw new Error('Invalid Cloudinary URL');
  }
}