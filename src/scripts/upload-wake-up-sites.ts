import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import type { CSVSite, WakeUpSite } from '@/types/wake-up';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require('../../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'homesell-photography-562f2.firebasestorage.app'
});

const db = admin.firestore();

async function readCSVSites(csvPath: string): Promise<CSVSite[]> {
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

async function uploadWakeUpSites(csvSites: CSVSite[]): Promise<void> {
  console.log(`Uploading ${csvSites.length} sites to wake-up-sites collection...`);
  
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500; // Firestore batch limit
  
  for (let i = 0; i < csvSites.length; i++) {
    const csvSite = csvSites[i];
    const siteId = csvSite['Site ID'];
    
    if (!siteId) {
      console.warn(`Skipping site with missing Site ID at index ${i}`);
      continue;
    }
    
    const wakeUpUrl = `https://homesellphotography.hd.pics/Sites/media.asp?nSiteID=${siteId}`;
    
    const wakeUpSite: WakeUpSite = {
      siteId,
      isAwake: false,
      wakeUpUrl,
      migrationStatus: 'pending',
      csvData: csvSite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const siteRef = db.collection('wake-up-sites').doc(siteId);
    batch.set(siteRef, wakeUpSite);
    batchCount++;
    
    // Commit batch when it reaches the limit
    if (batchCount === BATCH_SIZE) {
      console.log(`Committing batch of ${batchCount} sites...`);
      await batch.commit();
      // Create a new batch for the next set of operations
      batch = db.batch();
      batchCount = 0;
    }
  }
  
  // Commit any remaining sites in the batch
  if (batchCount > 0) {
    console.log(`Committing final batch of ${batchCount} sites...`);
    await batch.commit();
  }
  
  console.log(`✅ Successfully uploaded ${csvSites.length} sites to wake-up-sites collection`);
}

async function main() {
  try {
    console.log('Starting wake-up sites upload...');
    
    // Read CSV file
    const csvPath = '/Users/loganpetree/Desktop/report.csv';
    console.log(`Reading CSV from: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }
    
    const csvSites = await readCSVSites(csvPath);
    console.log(`✅ Read ${csvSites.length} sites from CSV`);
    
    // Show sample data
    if (csvSites.length > 0) {
      console.log('Sample site data:', {
        siteId: csvSites[0]['Site ID'],
        address: csvSites[0].Address,
        agent: csvSites[0]['Agent Name'],
        city: csvSites[0].City,
        state: csvSites[0].State
      });
    }
    
    // Upload to Firebase
    await uploadWakeUpSites(csvSites);
    
    // Verify upload
    const wakeUpCollection = await db.collection('wake-up-sites').get();
    console.log(`✅ Verification: ${wakeUpCollection.size} documents in wake-up-sites collection`);
    
    console.log('\n🎉 Wake-up sites upload completed successfully!');
    console.log('You can now visit /wake to see all your sites.');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

main();
