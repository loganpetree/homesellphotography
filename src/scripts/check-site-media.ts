import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkSiteMedia() {
  try {
    // Get all sites
    const sitesSnapshot = await db.collection('sites').get();
    
    console.log(`Found ${sitesSnapshot.size} total sites`);
    
    for (const siteDoc of sitesSnapshot.docs) {
      const siteData = siteDoc.data();
      console.log(`\nSite ${siteDoc.id}:`);
      console.log(`- Media count in Firestore: ${siteData.media?.length || 0}`);
      
      // Log first few and last few media items to check for truncation
      if (siteData.media && siteData.media.length > 0) {
        console.log('First 3 media items:');
        siteData.media.slice(0, 3).forEach((media: any, index: number) => {
          console.log(`${index + 1}. ${media.name} (${media.mediaId})`);
        });
        
        if (siteData.media.length > 6) {
          console.log('...');
          console.log('Last 3 media items:');
          siteData.media.slice(-3).forEach((media: any, index: number) => {
            console.log(`${siteData.media.length - 2 + index}. ${media.name} (${media.mediaId})`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking site media:', error);
  }
}

checkSiteMedia();
