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
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const API_KEY = '26EF5EABF6A24412AF4C7974475C2D34';
const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';

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
}

async function processMedia(siteId: string, media: HDPhotoHubMedia): Promise<ProcessedMedia> {
  return {
    mediaId: media.mid.toString(),
    name: media.name,
    type: media.type,
    hidden: media.hidden,
    highlight: media.highlight,
    extension: media.extension,
    size: media.size,
    originalUrl: media.url,
    url: media.url,
    order: media.order,
    branded: media.branded
  };
}

async function fetchSite(siteId: string): Promise<HDPhotoHubSiteResponse> {
  const url = new URL(`${API_BASE_URL}/site`);
  url.searchParams.append('sid', siteId);
  
  console.log(`Fetching site ${siteId}...`);
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
  [key: string]: string;
}

async function processSites(csvPath: string, skip: number = 5, limit: number = 5): Promise<CSVSite[]> {
  return new Promise((resolve, reject) => {
    const results: CSVSite[] = [];
    let count = 0;
    
    fs.createReadStream(csvPath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }))
      .on('data', (data: CSVSite) => {
        if (count >= skip && results.length < limit) {
          results.push(data);
        }
        count++;
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
    console.log('Starting batch 2 migration (sites 6-10)...');
    
    // Read next 5 sites from CSV (skip first 5)
    const csvPath = '/Users/loganpetree/Desktop/report.csv';
    const sites = await processSites(csvPath, 5, 5);
    console.log(`Read ${sites.length} sites from CSV (sites 6-10)`);
    
    // Process each site
    for (const site of sites) {
      try {
        console.log('\n--- Processing site ---');
        console.log('CSV Data:', site);
        
        const siteId = site['Site ID'];
        const siteData = await fetchSite(siteId);
        console.log('API Response:', JSON.stringify(siteData, null, 2));
        
        // Process media data
        console.log(`Processing ${siteData.media.length} media files for site ${siteId}...`);
        const processedMedia = await Promise.all(
          siteData.media.map(media => processMedia(siteId, media))
        );

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

        // Save to Firestore
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
          user: userData,
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
          reviewed: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✓ Successfully processed and saved site ${siteId}`);
      } catch (error) {
        console.error(`Error processing site ${site['Site ID']}:`, error);
      }
    }
    
    console.log('\nBatch 2 migration completed!');
  } catch (error) {
    console.error('Batch 2 migration failed:', error);
    process.exit(1);
  }
}

main();