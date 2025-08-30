import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp, getApp } from 'firebase/app';
import { firebaseConfig } from '../lib/firebase-config';

console.log('Environment variables loaded:');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' : 'undefined');

// Initialize Firebase
console.log('Firebase config:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
});

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.log('Firebase app already exists, getting existing app');
  app = getApp();
}

const db = getFirestore(app);
console.log('Firestore initialized');

async function checkWakeSites() {
  try {
    console.log('Checking wake-up sites...');

    const wakeUpSitesRef = collection(db, 'wake-up-sites');
    const snapshot = await getDocs(wakeUpSitesRef);

    console.log(`Found ${snapshot.size} wake-up sites total`);

    if (snapshot.size === 0) {
      console.log('No wake-up sites found. The collection might be empty.');
      return;
    }

    const pendingSites: Array<{ siteId: string; siteUrl: string; migrationStatus: string }> = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Site ${doc.id}:`, {
        ...data, // Log all fields
        siteUrl: data.siteUrl,
        migrationStatus: data.migrationStatus,
        hasCsvData: !!data.csvData
      });

      if (data.migrationStatus !== 'completed') {
        pendingSites.push({
          siteId: doc.id,
          siteUrl: data.wakeUpUrl || data.siteUrl,
          migrationStatus: data.migrationStatus
        });
      }
    });

    console.log(`\nFound ${pendingSites.length} pending sites:`);
    pendingSites.slice(0, 5).forEach(site => {
      console.log(`- ${site.siteId}: ${site.siteUrl} (${site.migrationStatus})`);
    });

  } catch (error) {
    console.error('Error checking wake-up sites:', error);
  }
}

checkWakeSites().catch(console.error);
