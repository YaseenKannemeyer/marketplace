import { v2 as cloudinary } from 'cloudinary';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    '[Cloudinary] Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET. File uploads will fail in production.'
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - File buffer (from file.arrayBuffer())
 * @param folder - Upload folder (e.g., listings, avatars, stories, chat)
 * @param publicId - Optional custom public ID (otherwise auto-generated)
 * @returns Cloudinary upload result with secure_url and public_id
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
) {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: `${process.env.CLOUDINARY_UPLOAD_FOLDER || 'studentmarket'}/${folder}`,
      resource_type: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by public ID
 * @param publicId - The Cloudinary public ID (e.g., "studentmarket/listings/abc123")
 * @returns Deletion result
 */
export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
}

/**
 * Extract the Cloudinary public ID from a Cloudinary URL
 * @param url - Full Cloudinary URL (e.g., https://res.cloudinary.com/.../studentmarket/listings/abc123.jpg)
 * @returns The public ID portion (e.g., "studentmarket/listings/abc123")
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URLs look like:
    // https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}.{ext}
    // https://res.cloudinary.com/{cloud}/video/upload/v{version}/{folder}/{public_id}.{ext}
    const match = url.match(
      /\/(?:image|video|raw|auto)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
