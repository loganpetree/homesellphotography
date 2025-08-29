import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { HDPhotoHubSite, fetchAllSites } from './hdphotohub';
import { HDPhotoHubOrder, fetchAllOrders } from './hdphotohub-migration';

const db = admin.firestore();

interface VerificationResult {
  success: boolean;
  errors: string[];
  stats: {
    totalSites: number;
    totalOrders: number;
    totalMedia: number;
    failedSites: number;
    failedOrders: number;
    failedMedia: number;
  };
}

export async function verifyMigration(): Promise<VerificationResult> {
  const result: VerificationResult = {
    success: true,
    errors: [],
    stats: {
      totalSites: 0,
      totalOrders: 0,
      totalMedia: 0,
      failedSites: 0,
      failedOrders: 0,
      failedMedia: 0
    }
  };

  try {
    // Verify Sites
    const hdSites = await fetchAllSites();
    const fbSites = await db.collection('sites').get();
    
    result.stats.totalSites = hdSites.length;
    
    // Check if all sites were migrated
    if (hdSites.length !== fbSites.docs.length) {
      result.success = false;
      result.errors.push(`Site count mismatch: HDPhotoHub has ${hdSites.length} sites, Firebase has ${fbSites.docs.length} sites`);
    }

    // Verify each site's data
    for (const hdSite of hdSites) {
      const fbSite = await db.collection('sites').doc(hdSite.sid.toString()).get();
      
      if (!fbSite.exists) {
        result.success = false;
        result.stats.failedSites++;
        result.errors.push(`Site ${hdSite.sid} not found in Firebase`);
        continue;
      }

      const fbData = fbSite.data();
      
      // Verify media count
      result.stats.totalMedia += hdSite.media.length;
      if (hdSite.media.length !== fbData?.media?.length) {
        result.success = false;
        result.stats.failedMedia += Math.abs((fbData?.media?.length || 0) - hdSite.media.length);
        result.errors.push(`Media count mismatch for site ${hdSite.sid}: HDPhotoHub has ${hdSite.media.length} media items, Firebase has ${fbData?.media?.length || 0}`);
      }

      // Verify core site data
      const coreFields = ['address', 'city', 'state', 'zip', 'status', 'purchased'] as const;
      for (const field of coreFields) {
        if (hdSite[field] !== fbData?.[field]) {
          result.success = false;
          result.errors.push(`Data mismatch for site ${hdSite.sid} field ${field}: HDPhotoHub has "${String(hdSite[field])}", Firebase has "${String(fbData?.[field])}"`);
        }
      }
    }

    // Verify Orders
    const hdOrders = await fetchAllOrders();
    const fbOrders = await db.collection('orders').get();
    
    result.stats.totalOrders = hdOrders.length;
    
    if (hdOrders.length !== fbOrders.docs.length) {
      result.success = false;
      result.errors.push(`Order count mismatch: HDPhotoHub has ${hdOrders.length} orders, Firebase has ${fbOrders.docs.length} orders`);
    }

    // Verify each order's data
    for (const hdOrder of hdOrders) {
      const fbOrder = await db.collection('orders').doc(hdOrder.oid.toString()).get();
      
      if (!fbOrder.exists) {
        result.success = false;
        result.stats.failedOrders++;
        result.errors.push(`Order ${hdOrder.oid} not found in Firebase`);
        continue;
      }

      const fbData = fbOrder.data();
      
      // Verify financial data
      const financialFields = ['subtotal', 'taxamount', 'balancedue', 'total', 'returned'] as const;
      type FinancialField = typeof financialFields[number];
      
      if (fbData) {
        for (const field of financialFields) {
          const fbField = field.replace('amount', 'Amount') as keyof typeof fbData.financial;
          if (hdOrder[field as keyof HDPhotoHubOrder] !== fbData.financial?.[fbField]) {
            result.success = false;
            result.errors.push(`Financial data mismatch for order ${hdOrder.oid} field ${field}`);
          }
        }
      }

      // Verify tasks count
      if (hdOrder.tasks.length !== fbData?.tasks?.length) {
        result.success = false;
        result.errors.push(`Tasks count mismatch for order ${hdOrder.oid}: HDPhotoHub has ${hdOrder.tasks.length} tasks, Firebase has ${fbData?.tasks?.length || 0}`);
      }

      // Verify payments count
      if (hdOrder.payments.length !== fbData?.payments?.length) {
        result.success = false;
        result.errors.push(`Payments count mismatch for order ${hdOrder.oid}: HDPhotoHub has ${hdOrder.payments.length} payments, Firebase has ${fbData?.payments?.length || 0}`);
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Verification failed with error: ${(error as Error).message}`);
  }

  return result;
}

// Helper function to log verification results
export async function runVerification() {
  console.log('Starting migration verification...');
  
  const result = await verifyMigration();
  
  console.log('\nVerification Results:');
  console.log('===================');
  console.log(`Success: ${result.success ? 'Yes' : 'No'}`);
  
  console.log('\nStatistics:');
  console.log('-----------');
  console.log(`Total Sites: ${result.stats.totalSites} (Failed: ${result.stats.failedSites})`);
  console.log(`Total Orders: ${result.stats.totalOrders} (Failed: ${result.stats.failedOrders})`);
  console.log(`Total Media Items: ${result.stats.totalMedia} (Failed: ${result.stats.failedMedia})`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    console.log('-------');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  return result;
}
