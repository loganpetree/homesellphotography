import sharp from 'sharp';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase-storage';

interface ImageSizes {
  small: Buffer;    // 400px width - for thumbnails and previews
  medium: Buffer;   // 800px width - for grid displays and galleries
  large: Buffer;    // 1600px width - for detailed views and full-screen
  original: Buffer; // Original size - preserved for maximum quality needs
}

interface ProcessedImageUrls {
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  originalUrl: string;
}

export async function processImage(imageBuffer: Buffer): Promise<ImageSizes> {
  const original = imageBuffer;

  // Process different sizes in parallel
  const [small, medium, large] = await Promise.all([
    sharp(imageBuffer)
      .resize(400, null, { withoutEnlargement: true })
      .jpeg({ quality: 75 })  // Higher compression for small preview
      .toBuffer(),
    sharp(imageBuffer)
      .resize(800, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })  // Balanced compression for medium size
      .toBuffer(),
    sharp(imageBuffer)
      .resize(1600, null, { withoutEnlargement: true })
      .jpeg({ quality: 90 })  // Light compression for large size
      .toBuffer(),
  ]);

  return {
    small,
    medium,
    large,
    original
  };
}

export async function uploadProcessedImages(
  siteId: string,
  mediaId: string,
  order: number,
  processedImages: ImageSizes
): Promise<ProcessedImageUrls> {
  const padOrder = order.toString().padStart(3, '0');
  const baseFileName = `${padOrder}_${mediaId}`;

  // Upload all sizes in parallel
  const [smallUrl, mediumUrl, largeUrl, originalUrl] = await Promise.all([
    uploadImageSize(siteId, baseFileName, 'small', processedImages.small),
    uploadImageSize(siteId, baseFileName, 'medium', processedImages.medium),
    uploadImageSize(siteId, baseFileName, 'large', processedImages.large),
    uploadImageSize(siteId, baseFileName, 'original', processedImages.original)
  ]);

  return {
    smallUrl,
    mediumUrl,
    largeUrl,
    originalUrl
  };
}

async function uploadImageSize(
  siteId: string,
  baseFileName: string,
  size: 'small' | 'medium' | 'large' | 'original',
  buffer: Buffer
): Promise<string> {
  // Store different sizes in their own subdirectories
  const fileName = size === 'original' 
    ? `${baseFileName}ID.jpg`  // Keep original naming convention
    : `${baseFileName}_${size}.jpg`;
  
  const storageRef = ref(storage, `sites/${siteId}/media/${size}/${fileName}`);
  
  try {
    // Upload the buffer
    await uploadBytes(storageRef, buffer);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error uploading ${size} image:`, error);
    throw error;
  }
}