import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require('../../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'homesell-photography-562f2.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();
const PROGRESS_DOC = 'migration_progress';
const BATCH_SIZE = 5; // Process 5 sites at a time
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds delay between batches
const API_KEY = '26EF5EABF6A24412AF4C7974475C2D34';
const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToStorage(buffer: Buffer, path: string, contentType: string = 'image/jpeg'): Promise<string> {
  const file = bucket.file(path);
  await file.save(buffer, {
    metadata: {
      contentType
    }
  });
  return file.publicUrl();
}

async function verifyBucket(): Promise<void> {
  try {
    const [exists] = await bucket.exists();
    if (!exists) {
      throw new Error('Firebase Storage bucket does not exist');
    }
    console.log('✓ Firebase Storage bucket verified');
  } catch (error) {
    console.error('Error verifying Firebase Storage bucket:', error);
    throw error;
  }
}

interface ProcessedMedia {
  mediaId: string;
  name: string;
  type: string;
  hidden: boolean;
  highlight: boolean;
  extension: string;
  size: number;
  originalUrl?: string;
  url: string;
  order: number;
  branded: string;
  processingError?: string;
}

interface MigrationProgress {
  lastProcessedIndex: number;
  completedSites: string[];
  startTime: string;
  lastUpdateTime: string;
  status: 'in_progress' | 'completed' | 'failed';
  error?: string;
}

interface HDPhotoHubMedia {
  mid: number;
  type: string;
  name: string;
  hidden: boolean;
  highlight: boolean;
  extension: string;
  size: number;
  url: string;
  order: number;
  branded: string;
}

interface HDPhotoHubUser {
  uid: number;
  bid: number;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  status: string;
  type: string;
  keyring: string;
  group?: {
    gid: number;
    bid: number;
    name: string;
    status: string;
  };
}

interface HDPhotoHubSiteResponse {
  sid: number;
  bid: number;
  status: string;
  purchased: string;
  user: HDPhotoHubUser;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  created: string;
  media: HDPhotoHubMedia[];
}

interface CSVSite {
  'Site ID': string;
  'Order ID': string;
  'Order Status': string;
  'Invoice Date': string;
  'Order Total': string;
  'Site Type': string;
  'Site URL': string;
  'Site Created': string;
  Address: string;
  'Address 2': string;
  City: string;
  State: string;
  'Zip Code': string;
  'MLS Number': string;
  Longitude: string;
  Latitude: string;
  'Agent Name': string;
  'First Name': string;
  'Last Name': string;
  Email: string;
  Phone: string;
  Website: string;
  Group: string;
  [key: string]: string;
}

function prepareAddressData(siteData: HDPhotoHubSiteResponse) {
  // If no address data at all, return a default structure
  if (!siteData.address && !siteData.city && !siteData.state && !siteData.zip) {
    return {
      street: 'No address available',
      city: '',
      state: '',
      zip: ''
    };
  }

  return {
    street: siteData.address || 'No street address',
    city: siteData.city || '',
    state: siteData.state || '',
    zip: siteData.zip || ''
  };
}

async function getProgress(): Promise<MigrationProgress> {
  const progressDoc = await db.collection('system').doc(PROGRESS_DOC).get();
  if (!progressDoc.exists) {
    return {
      lastProcessedIndex: -1,
      completedSites: [],
      startTime: new Date().toISOString(),
      lastUpdateTime: new Date().toISOString(),
      status: 'in_progress'
    };
  }
  return progressDoc.data() as MigrationProgress;
}

async function updateProgress(progress: Partial<MigrationProgress>): Promise<void> {
  await db.collection('system').doc(PROGRESS_DOC).set({
    ...progress,
    lastUpdateTime: new Date().toISOString()
  }, { merge: true });
}

// Track sleeping media for reporting
const sleepingMediaReport: Array<{siteId: string, mediaId: number, mediaName: string}> = [];

async function logSleepingMedia(siteId: string, mediaId: number, mediaName: string): Promise<void> {
  sleepingMediaReport.push({ siteId, mediaId, mediaName });
  console.log(`💤 Logged sleeping media: Site ${siteId}, Media ${mediaId} (${mediaName})`);
}

async function printSleepingMediaReport(): Promise<void> {
  if (sleepingMediaReport.length > 0) {
    console.log(`\n📊 SLEEPING MEDIA REPORT:`);
    console.log(`Found ${sleepingMediaReport.length} sleeping media items that need manual wake-up:`);
    
    const groupedBySite = sleepingMediaReport.reduce((acc, item) => {
      if (!acc[item.siteId]) acc[item.siteId] = [];
      acc[item.siteId].push(item);
      return acc;
    }, {} as Record<string, typeof sleepingMediaReport>);
    
    for (const [siteId, items] of Object.entries(groupedBySite)) {
      console.log(`\n🏠 Site ${siteId}: ${items.length} sleeping media`);
      console.log(`   Manual wake-up URL: https://homesellphotography.hd.pics/${siteId}/admin`);
      items.forEach((item, index) => {
        console.log(`   ${index + 1}. Media ${item.mediaId}: ${item.mediaName}`);
      });
    }
    
    console.log(`\n💡 To wake up sleeping media:`);
    console.log(`   1. Log into HDPhotoHub dashboard`);
    console.log(`   2. Visit the admin URL for each site`);
    console.log(`   3. Press the wake-up button to activate sleeping media`);
    console.log(`   4. Re-run the migration for those sites`);
  }
}

async function processMedia(siteId: string, media: HDPhotoHubMedia): Promise<ProcessedMedia> {
  try {
    console.log(`Processing media ${media.mid} for site ${siteId}...`);
    
    // Check if URL is incomplete (sleeping media)
    let imageUrl = media.url;
    const urlsToTry: string[] = [];
    
    if (!imageUrl || imageUrl.endsWith('.jpg') && imageUrl.includes('/.jpg')) {
      console.log(`💤 Detected sleeping media ${media.mid} (${media.name})`);
      
      // Log this sleeping media for the report
      await logSleepingMedia(siteId, media.mid, media.name);
      
      // Try multiple URL patterns for sleeping media
      urlsToTry.push(`https://media.hd.pics/${media.mid}.${media.extension}`);
      urlsToTry.push(`https://homesellphotography.hd.pics/media/${media.mid}.${media.extension}`);
      urlsToTry.push(`https://media.hd.pics/1/${media.mid}.${media.extension}`);
      
      console.log(`🔄 Trying ${urlsToTry.length} fallback URLs for sleeping media ${media.mid}`);
    } else {
      console.log(`✅ Media ${media.mid} is already awake`);
      urlsToTry.push(imageUrl);
    }
    
    // Create a clean filename
    const filename = `${media.order.toString().padStart(3, '0')}_${media.name.replace(/[^a-zA-Z0-9]/g, '')}.${media.extension}`;
    const storagePath = `sites/${siteId}/media/${filename}`;
    
    // Try downloading from multiple URLs for sleeping media
    let imageBuffer: Buffer | null = null;
    let successfulUrl: string | null = null;
    
    for (let attempt = 0; attempt < urlsToTry.length; attempt++) {
      const tryUrl = urlsToTry[attempt];
      try {
        console.log(`Attempting download from: ${tryUrl}`);
        imageBuffer = await downloadImage(tryUrl);
        successfulUrl = tryUrl;
        console.log(`✓ Successfully downloaded from: ${tryUrl}`);
        break;
      } catch (error) {
        console.log(`✗ Failed to download from: ${tryUrl}`);
        
        // Short delay between attempts for sleeping media
        if (attempt < urlsToTry.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms
        }
        continue;
      }
    }
    
    if (!imageBuffer) {
      throw new Error(`Failed to download from any URL. Tried: ${urlsToTry.join(', ')}`);
    }
    
    const storageUrl = await uploadToStorage(imageBuffer, storagePath);
    
    return {
      mediaId: media.mid.toString(),
      name: media.name,
      type: media.type,
      hidden: media.hidden,
      highlight: media.highlight,
      extension: media.extension,
      size: media.size,
      originalUrl: media.url,
      url: storageUrl,
      order: media.order,
      branded: media.branded,
      // Add info about which URL worked
      ...(successfulUrl !== media.url && { workingUrl: successfulUrl })
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing media ${media.mid}:`, errorMessage);
    console.error(`Original URL: ${media.url}`);
    
    // Return original media object with original URL if processing fails
    return {
      mediaId: media.mid.toString(),
      name: media.name,
      type: media.type,
      hidden: media.hidden,
      highlight: media.highlight,
      extension: media.extension,
      size: media.size,
      url: media.url,
      order: media.order,
      branded: media.branded,
      processingError: errorMessage
    };
  }
}

async function fetchSite(siteId: string): Promise<HDPhotoHubSiteResponse> {
  const url = new URL(`${API_BASE_URL}/site`);
  url.searchParams.append('sid', siteId);
  // Try to include inactive/sleeping media
  url.searchParams.append('include_inactive', 'true');
  url.searchParams.append('include_archived', 'true');
  url.searchParams.append('show_all', 'true');
  
  console.log(`Fetching site ${siteId} with all media parameters...`);
  const response = await fetch(url.toString(), {
    headers: {
      'api_key': API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch site ${siteId}: ${response.statusText}`);
  }

  const data = await response.json();
  return data as HDPhotoHubSiteResponse;
}

async function readAllSites(csvPath: string): Promise<CSVSite[]> {
  return new Promise((resolve, reject) => {
    const results: CSVSite[] = [];
    
    fs.createReadStream(csvPath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }))
      .on('data', (data: CSVSite) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    console.log('Resuming full migration...');
    
    // Skip Firebase Storage bucket verification
    // await verifyBucket();
    
    // Get existing progress
    let progress = await getProgress();
    console.log('Current progress:', progress);
    
    // Read all sites from CSV
    const csvPath = '/Users/loganpetree/Desktop/report.csv';
    const allSites = await readAllSites(csvPath);
    console.log(`Found ${allSites.length} total sites in CSV`);
    
    // Start from index 50 (where we left off)
    const startIndex = 50;
    
    // Process sites in batches
    for (let i = startIndex; i < allSites.length; i += BATCH_SIZE) {
      const batch = allSites.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch starting at index ${i} (${batch.length} sites)`);
      
      for (let j = 0; j < batch.length; j++) {
        const site = batch[j];
        const currentIndex = i + j;
        
        try {
          // Force reprocess sites from index 50 onwards (where images weren't saved correctly)
          if (currentIndex < 50 && progress.completedSites.includes(site['Site ID'])) {
            console.log(`Skipping already processed site ${site['Site ID']} (index ${currentIndex}, before index 50)`);
            continue;
          }
          
          if (currentIndex >= 50) {
            console.log(`Force reprocessing site ${site['Site ID']} (index ${currentIndex}) to fix image storage`);
          }

          console.log('\n--- Processing site ---');
          console.log('CSV Data:', site);
          
          const siteId = site['Site ID'];
          const siteData = await fetchSite(siteId);
          console.log('API Response:', JSON.stringify(siteData, null, 2));
          
          // Process media data
          console.log(`Processing ${siteData.media.length} media files for site ${siteId}...`);
          let processedMedia = await Promise.all(
            siteData.media.map(media => processMedia(siteId, media))
          );
          
          // Check if too many images failed and retry once
          const failedCount = processedMedia.filter(m => m.processingError).length;
          const successRate = (processedMedia.length - failedCount) / processedMedia.length;
          
          if (successRate < 0.5 && processedMedia.length > 5) {
            console.log(`Low success rate (${Math.round(successRate * 100)}%), retrying site ${siteId} after delay...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            
            // Re-fetch site data in case more media became available
            const retrySiteData = await fetchSite(siteId);
            console.log(`Retry: Processing ${retrySiteData.media.length} media files for site ${siteId}...`);
            processedMedia = await Promise.all(
              retrySiteData.media.map(media => processMedia(siteId, media))
            );
          }

          // Prepare user data with proper group handling
          const userData = {
            userId: siteData.user.uid.toString(),
            name: siteData.user.name,
            email: siteData.user.email,
            phone: siteData.user.phone || '',
            type: siteData.user.type,
            status: siteData.user.status
          };

          // Only add group if it exists
          if (siteData.user.group) {
            Object.assign(userData, {
              group: {
                groupId: siteData.user.group.gid.toString(),
                businessId: siteData.user.group.bid.toString(),
                name: siteData.user.group.name,
                status: siteData.user.group.status
              }
            });
          }

          // Save to Firestore with proper address handling
          await db.collection('sites').doc(siteId).set({
            siteId: siteId,
            businessId: siteData.bid.toString(),
            status: siteData.status,
            purchased: siteData.purchased,
            address: prepareAddressData(siteData),
            user: userData,
            created: siteData.created,
            media: processedMedia,
            csvData: {
              orderId: site['Order ID'] || '',
              orderStatus: site['Order Status'] || '',
              orderTotal: site['Order Total'] ? parseFloat(site['Order Total']) : 0,
              siteType: site['Site Type'] || '',
              siteUrl: site['Site URL'] || '',
              mlsNumber: site['MLS Number'] || '',
              coordinates: {
                longitude: site.Longitude ? parseFloat(site.Longitude) : null,
                latitude: site.Latitude ? parseFloat(site.Latitude) : null
              }
            },
            reviewed: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Update progress after successful processing
          if (!progress.completedSites.includes(siteId)) {
            progress.completedSites.push(siteId);
          }
          await updateProgress({
            completedSites: progress.completedSites,
            lastProcessedIndex: currentIndex
          });
          
          console.log(`✓ Successfully processed and saved site ${siteId}`);
        } catch (error) {
          console.error(`Error processing site ${site['Site ID']}:`, error);
          // Continue with next site instead of stopping the entire process
          continue;
        }
      }
      
      // Add delay between batches unless it's the last batch
      if (i + BATCH_SIZE < allSites.length) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }
    
    // Mark migration as completed
    await updateProgress({
      status: 'completed',
      lastProcessedIndex: allSites.length - 1
    });
    
    console.log('\nFull migration completed successfully!');
    console.log(`Total sites processed: ${progress.completedSites.length}`);
    
    // Print sleeping media report
    await printSleepingMediaReport();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();