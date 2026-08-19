import cloudinary from './config';

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  createdAt: Date;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any;
}

/**
 * Upload an image to Cloudinary
 * @param file - File path, buffer, or base64 string
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadImage(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder: options.folder || 'sacred-himalaya',
      public_id: options.publicId,
      overwrite: options.overwrite ?? true,
      resource_type: options.resourceType || 'image',
      transformation: options.transformation,
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      createdAt: new Date(result.created_at),
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error}`);
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file paths, buffers, or base64 strings
 * @param options - Upload options
 * @returns Array of upload results
 */
export async function uploadMultipleImages(
  files: Array<string | Buffer>,
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadImage(file, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Delete result
 */
export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${error}`);
  }
}

/**
 * Get image metadata
 * @param publicId - Public ID of the image
 * @returns Image metadata
 */
export async function getImageMetadata(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary metadata error:', error);
    throw new Error(`Failed to get image metadata: ${error}`);
  }
}