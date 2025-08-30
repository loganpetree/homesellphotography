import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApp } from 'firebase/app';
import sharp from 'sharp';
import { FirebaseSite } from '../types/site';

const firebaseConfig = {
  apiKey: "AIzaSyCRtePKFmrnmxjii31HqSkPtrFeMAMem3U",
  authDomain: "homesell-photography-562f2.firebaseapp.com",
  projectId: "homesell-photography-562f2",
  storageBucket: "homesell-photography-562f2.firebasestorage.app",
  messagingSenderId: "922897935847",
  appId: "1:922897935847:web:4bb6e114221252b9f22142"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  app = getApp();
}
const db = getFirestore(app);
const storage = getStorage(app);

interface ImageSizes {
  small: Buffer;    // 400px width - for thumbnails and previews
  medium: Buffer;   // 800px width - for grid displays and galleries
  large: Buffer;    // 1600px width - for detailed views and full-screen
}

interface ProcessedImageUrls {
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

interface ProcessingStats {
  total: number;
  skipped: {
    noSourceUrl: number;
    sourceNotFound: number;
    downloadFailed: number;
    authError: number;
  };
  processed: number;
}

async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Failed to download image: ${response.statusText}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error downloading image:`, error);
    return null;
  }
}

async function processImageBuffer(buffer: Buffer): Promise<ImageSizes> {
  const [small, medium, large] = await Promise.all([
    sharp(buffer)
      .resize(400, null, { withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer(),
    sharp(buffer)
      .resize(800, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer(),
    sharp(buffer)
      .resize(1600, null, { withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer(),
  ]);

  return { small, medium, large };
}

async function uploadProcessedImages(
  siteId: string,
  mediaId: string,
  order: number,
  processedImages: ImageSizes
): Promise<ProcessedImageUrls | null> {
  const padOrder = order.toString().padStart(3, '0');
  const baseFileName = `${padOrder}_${mediaId}`;

  try {
    // Upload all sizes in parallel
    const [smallUrl, mediumUrl, largeUrl] = await Promise.all([
      uploadImageSize(siteId, baseFileName, 'small', processedImages.small),
      uploadImageSize(siteId, baseFileName, 'medium', processedImages.medium),
      uploadImageSize(siteId, baseFileName, 'large', processedImages.large)
    ]);

    return { smallUrl, mediumUrl, largeUrl };
  } catch (error: any) {
          const errorDetails = {
        siteId,
        mediaId,
        errorCode: error?.code,
        errorMessage: error?.message,
        fullError: error
      };
      console.error('Upload error details:', errorDetails);
    return null;
  }
}

async function uploadImageSize(
  siteId: string,
  baseFileName: string,
  size: 'small' | 'medium' | 'large',
  buffer: Buffer
): Promise<string> {
  // Keep optimized versions in the same directory as original
  const fileName = `${baseFileName}_${size}ID.jpg`;  // Add ID suffix to match existing pattern
  const path = `sites/${siteId}/media/${fileName}`;
  console.log('Attempting upload to:', path);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, buffer);
  return getDownloadURL(storageRef);
}

async function processSiteImages(site: FirebaseSite): Promise<ProcessingStats> {
  console.log(`\nProcessing site ${site.siteId}...`);
  
  const stats: ProcessingStats = {
    total: site.media.length,
    skipped: {
      noSourceUrl: 0,
      sourceNotFound: 0,
      downloadFailed: 0,
      authError: 0
    },
    processed: 0
  };

  const updatedMedia = await Promise.all(
    site.media.map(async (media) => {
      try {
        console.log(`\nProcessing image ${media.mediaId} (order: ${media.order})...`);
        
        // Check for source URL
        const sourceUrl = media.storageUrl || media.originalUrl;
        if (!sourceUrl) {
          console.log(`No source URL available for image ${media.mediaId}`);
          stats.skipped.noSourceUrl++;
          return media;
        }

        // Check if source image exists
        const exists = await checkImageExists(sourceUrl);
        if (!exists) {
          console.log(`Source image not found: ${sourceUrl}`);
          stats.skipped.sourceNotFound++;
          return media;
        }

        // Download the original image
        console.log('Downloading original image...');
        const imageBuffer = await downloadImage(sourceUrl);
        if (!imageBuffer) {
          stats.skipped.downloadFailed++;
          return media;
        }
        
        // Process into different sizes
        console.log('Processing image sizes...');
        const processedImages = await processImageBuffer(imageBuffer);
        
        // Upload processed versions
        console.log('Uploading processed images...');
        const urls = await uploadProcessedImages(
          site.siteId,
          media.mediaId,
          media.order,
          processedImages
        );
        
        if (!urls) {
          stats.skipped.authError++;
          return media;
        }

        stats.processed++;
        
        // Return updated media object
        return {
          ...media,
          smallUrl: urls.smallUrl,
          mediumUrl: urls.mediumUrl,
          largeUrl: urls.largeUrl,
          updatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error processing image ${media.mediaId}:`, error);
        return media;
      }
    })
  );
  
  // Update Firestore document
  console.log(`\nUpdating Firestore document for site ${site.siteId}`);
  const siteRef = doc(db, 'sites', site.siteId);
  await updateDoc(siteRef, {
    media: updatedMedia,
    updatedAt: new Date().toISOString()
  });
  
  return stats;
}

async function migrateAllSites() {
  try {
    const sitesSnapshot = await getDocs(collection(db, 'sites'));
    const totalSites = sitesSnapshot.size;
    console.log(`Found ${totalSites} sites to process`);
    
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    
    const totalStats: ProcessingStats = {
      total: 0,
      skipped: {
        noSourceUrl: 0,
        sourceNotFound: 0,
        downloadFailed: 0,
        authError: 0
      },
      processed: 0
    };
    
    // Process sites in batches of 3 to avoid overwhelming storage
    const BATCH_SIZE = 3;
    const sites = sitesSnapshot.docs.map(doc => doc.data() as FirebaseSite);
    
    for (let i = 0; i < sites.length; i += BATCH_SIZE) {
      const batch = sites.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(sites.length/BATCH_SIZE)}`);
      
      const results = await Promise.all(
        batch.map(async (site) => {
          try {
            const stats = await processSiteImages(site);
            // Aggregate stats
            totalStats.total += stats.total;
            totalStats.skipped.noSourceUrl += stats.skipped.noSourceUrl;
            totalStats.skipped.sourceNotFound += stats.skipped.sourceNotFound;
            totalStats.skipped.downloadFailed += stats.skipped.downloadFailed;
            totalStats.skipped.authError += stats.skipped.authError;
            totalStats.processed += stats.processed;
            return true;
          } catch (error) {
            console.error(`Failed to process site ${site.siteId}:`, error);
            return false;
          }
        })
      );
      
      succeeded += results.filter(r => r).length;
      failed += results.filter(r => !r).length;
      processed += batch.length;
      
      console.log(`\nProgress: ${processed}/${totalSites} sites processed`);
      console.log(`Success: ${succeeded}, Failed: ${failed}`);
      
      // Print batch stats
      console.log('\nCumulative Statistics:');
      console.log(`Total images: ${totalStats.total}`);
      console.log('Skipped:');
      console.log(`  - No source URL: ${totalStats.skipped.noSourceUrl}`);
      console.log(`  - Source not found: ${totalStats.skipped.sourceNotFound}`);
      console.log(`  - Download failed: ${totalStats.skipped.downloadFailed}`);
      console.log(`  - Auth errors: ${totalStats.skipped.authError}`);
      console.log(`Successfully processed: ${totalStats.processed}`);
    }
    
    console.log('\n=== Final Migration Summary ===');
    console.log(`Total sites processed: ${processed}`);
    console.log(`Successfully processed: ${succeeded}`);
    console.log(`Failed to process: ${failed}`);
    console.log('\nImage Statistics:');
    console.log(`Total images: ${totalStats.total}`);
    console.log('Skipped:');
    console.log(`  - No source URL: ${totalStats.skipped.noSourceUrl}`);
    console.log(`  - Source not found: ${totalStats.skipped.sourceNotFound}`);
    console.log(`  - Download failed: ${totalStats.skipped.downloadFailed}`);
    console.log(`  - Auth errors: ${totalStats.skipped.authError}`);
    console.log(`Successfully processed: ${totalStats.processed}`);
    
  } catch (error) {
    console.error('\nMigration failed:', error);
    throw error;
  }
}

// Execute migration
migrateAllSites().catch(console.error);