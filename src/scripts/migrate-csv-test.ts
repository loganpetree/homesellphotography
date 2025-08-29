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

// Check if media already exists in Firebase Storage
async function checkExistingMedia(siteId: string, mediaId: string): Promise<string | null> {
  try {
    const files = await bucket.getFiles({
      prefix: `${siteId}/`
    });
    
    const existingFile = files[0].find(file => file.name.includes(mediaId));
    if (existingFile) {
      return existingFile.publicUrl();
    }
    return null;
  } catch (error) {
    console.error(`Error checking existing media for site ${siteId}:`, error);
    return null;
  }
}
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

async function processMedia(siteId: string, media: HDPhotoHubMedia): Promise<ProcessedMedia> {
  try {
    console.log(`Processing media ${media.mid} for site ${siteId}...`);
    
    // Create a clean filename
    const filename = `${media.order.toString().padStart(3, '0')}_${media.name.replace(/[^a-zA-Z0-9]/g, '')}.${media.extension}`;
    const storagePath = `sites/${siteId}/media/${filename}`;
    
    // Download and upload
    const imageBuffer = await downloadImage(media.url);
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
      branded: media.branded
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing media ${media.mid}:`, errorMessage);
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
}

interface HDPhotoHubSiteResponse {
  sid: number;
  bid: number;
  status: string;
  purchased: string;
  user: HDPhotoHubUser;
  address: string;
  city: string;
  state: string;
  zip: string;
  created: string;
  media: HDPhotoHubMedia[];
  unpaid?: number;
  unpaidall?: number;
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
  [key: string]: string; // Allow for other columns we might need later
}

async function processSites(csvPath: string, limit: number = 5): Promise<CSVSite[]> {
  return new Promise((resolve, reject) => {
    const results: CSVSite[] = [];
    
    fs.createReadStream(csvPath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }))
      .on('data', (data: CSVSite) => {
        if (results.length < limit) {
          results.push(data);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function main() {
  try {
    console.log('Starting test migration...');
    
    // Skip Firebase Storage bucket verification for test
    // await verifyBucket();
    
    // Read first 5 sites from CSV
    const csvPath = '/Users/loganpetree/Desktop/report.csv';
    const sites = await processSites(csvPath, 5);
    console.log(`Read ${sites.length} sites from CSV`);
    
    // Test fetch each site
    for (const site of sites) {
      try {
        console.log('\n--- Processing site ---');
        console.log('CSV Data:', site);
        
        const siteId = site['Site ID'];
        const siteData = await fetchSite(siteId);
        console.log('API Response:', JSON.stringify(siteData, null, 2));
        
        // Save to Firestore for testing
        // Process media data
        console.log(`Processing ${siteData.media.length} media files for site ${siteId}...`);
        const processedMedia = await Promise.all(
          siteData.media.map(media => processMedia(siteId, media))
        );
        await db.collection('sites').doc(siteId).set({
          siteId: siteId,
          businessId: siteData.bid.toString(),
          status: siteData.status,
          purchased: siteData.purchased,
          address: {
            street: siteData.address,
            city: siteData.city,
            state: siteData.state,
            zip: siteData.zip
          },
          user: {
            userId: siteData.user.uid.toString(),
            name: siteData.user.name,
            email: siteData.user.email,
            phone: siteData.user.phone || '',
            type: siteData.user.type,
            status: siteData.user.status
          },
          created: siteData.created,
          media: processedMedia,
          csvData: {
            orderId: site['Order ID'],
            orderStatus: site['Order Status'],
            orderTotal: parseFloat(site['Order Total']),
            siteType: site['Site Type'],
            siteUrl: site['Site URL'],
            mlsNumber: site['MLS Number'],
            coordinates: {
              longitude: parseFloat(site.Longitude),
              latitude: parseFloat(site.Latitude)
            }
          },
          migrationTest: true,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✓ Successfully processed and saved site ${siteId}`);
      } catch (error) {
        console.error(`Error processing site ${site['Site ID']}:`, error);
      }
    }
    
    console.log('\nTest migration completed!');
  } catch (error) {
    console.error('Test migration failed:', error);
    process.exit(1);
  }
}

main();
