import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { HDPhotoHubSite, fetchAllSites } from './hdphotohub';

// Initialize Firebase Admin
const serviceAccount = require('../../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'homesell-photography.appspot.com'
});

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

export interface HDPhotoHubOrder {
  oid: number;
  bid: number;
  sid: number;
  date: string;
  tags: string;
  tasks: Array<{
    tid: number;
    name: string;
    category: string;
    type: string;
    memberassigned: string;
    memberpay: number;
    apptdate: string;
    apptconfirmationemailsent: string;
    onsitetime: number;
    clientpay: number;
    taxable: boolean;
    done: string;
    canceled: boolean;
  }>;
  subtotal: number;
  taxamount: number;
  balancedue: number;
  total: number;
  returned: number;
  invoiceurl: string;
  taxes: Array<{
    otid: number;
    trid: number;
    district: string;
    rate: number;
    amount: number;
  }>;
  payments: Array<{
    pid: number;
    type: string;
    checknumber: number;
    paidby: string;
    amount: number;
  }>;
}

const API_KEY = process.env.HDPHOTOHUB_API_KEY;
const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';

export async function fetchAllOrders(limit?: number): Promise<HDPhotoHubOrder[]> {
  const url = new URL(`${API_BASE_URL}/orders`);
  if (limit) {
    url.searchParams.append('limit', limit.toString());
  }
  console.log('Making request to', url.toString());
  
  const response = await fetch(url, {
    headers: new Headers({
      'api_key': API_KEY || ''
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }

  // Read the response as a stream and process it
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  let jsonText = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    jsonText += new TextDecoder().decode(value);
  }

  try {
    // Clean the JSON text
    jsonText = jsonText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    const data = JSON.parse(jsonText);
    console.log('Successfully parsed JSON. Number of orders:', Array.isArray(data) ? data.length : 'Not an array');
    
    if (!Array.isArray(data)) {
      console.log('Data structure:', data);
      throw new Error('Response is not an array of orders');
    }
    
    return data as HDPhotoHubOrder[];
  } catch (e) {
    console.error('JSON parse error:', e);
    console.error('First 1000 chars of response:', jsonText.substring(0, 1000));
    console.error('Last 1000 chars of response:', jsonText.substring(jsonText.length - 1000));
    throw new Error(`Invalid JSON response: ${(e as Error).message}`);
  }
}

async function downloadAndUploadImage(url: string, destinationPath: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
  
  const buffer = await response.buffer();
  const file = bucket.file(destinationPath);
  
  await file.save(buffer, {
    metadata: {
      contentType: response.headers.get('content-type') || 'image/jpeg'
    }
  });
  
  return file.publicUrl();
}

async function migrateSite(site: HDPhotoHubSite) {
  console.log(`Migrating site ${site.sid}...`);
  
  // Process media files
  const mediaPromises = site.media.map(async (media) => {
    const destinationPath = `sites/${site.sid}/media/${media.order.toString().padStart(3, '0')}_${media.mid}${media.extension}`;
    const storageUrl = await downloadAndUploadImage(media.url, destinationPath);
    
    return {
      mediaId: media.mid.toString(),
      name: media.name,
      type: media.type,
      hidden: media.hidden,
      highlight: media.highlight,
      extension: media.extension,
      size: media.size,
      url: storageUrl,
      order: media.order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const processedMedia = await Promise.all(mediaPromises);

  // Store site data in Firestore
  await db.collection('sites').doc(site.sid.toString()).set({
    siteId: site.sid.toString(),
    businessId: site.bid.toString(),
    status: site.status,
    purchased: site.purchased,
    address: site.address,
    city: site.city,
    state: site.state,
    zip: site.zip,
    media: processedMedia,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

async function migrateOrder(order: HDPhotoHubOrder) {
  console.log(`Migrating order ${order.oid}...`);
  
  // Convert order data to Firestore format
  const firestoreOrder = {
    orderId: order.oid.toString(),
    businessId: order.bid.toString(),
    siteId: order.sid.toString(),
    date: new Date(order.date).toISOString(),
    tags: order.tags.split(',').map(tag => tag.trim()),
    tasks: order.tasks.map(task => ({
      taskId: task.tid.toString(),
      name: task.name,
      category: task.category,
      type: task.type,
      memberAssigned: task.memberassigned,
      memberPay: task.memberpay,
      appointmentDate: new Date(task.apptdate).toISOString(),
      confirmationEmailSent: task.apptconfirmationemailsent ? new Date(task.apptconfirmationemailsent).toISOString() : null,
      onSiteTime: task.onsitetime,
      clientPay: task.clientpay,
      taxable: task.taxable,
      done: task.done === 'true',
      canceled: task.canceled
    })),
    financial: {
      subtotal: order.subtotal,
      taxAmount: order.taxamount,
      balanceDue: order.balancedue,
      total: order.total,
      returned: order.returned
    },
    invoiceUrl: order.invoiceurl,
    taxes: order.taxes.map(tax => ({
      taxId: tax.otid.toString(),
      transactionId: tax.trid.toString(),
      district: tax.district,
      rate: tax.rate,
      amount: tax.amount
    })),
    payments: order.payments.map(payment => ({
      paymentId: payment.pid.toString(),
      type: payment.type,
      checkNumber: payment.checknumber,
      paidBy: payment.paidby,
      amount: payment.amount
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Store order in Firestore
  await db.collection('orders').doc(order.oid.toString()).set(firestoreOrder);
}

export async function startMigration(options: { limit?: number } = {}) {
  try {
    // Fetch sites with limit
    const sites = await fetchAllSites(10); // Get only 10 sites for testing
    console.log(`Found ${sites.length} sites to migrate`);

    // Fetch orders with limit
    const orders = await fetchAllOrders(5); // Get only 5 orders for testing
    console.log(`Found ${orders.length} orders total`);

    // If limit is specified, only take that many orders
    const ordersToMigrate = options.limit ? orders.slice(0, options.limit) : orders;
    console.log(`Will migrate ${ordersToMigrate.length} orders`);

    // Get unique site IDs from the orders we'll migrate
    const siteIdsToMigrate = new Set(ordersToMigrate.map(order => order.sid));
    const sitesToMigrate = sites.filter((site: HDPhotoHubSite) => siteIdsToMigrate.has(site.sid));
    console.log(`Will migrate ${sitesToMigrate.length} sites associated with these orders`);

    // Migrate the required sites first
    for (const site of sitesToMigrate) {
      await migrateSite(site);
      console.log(`✓ Migrated site ${site.sid}`);
    }

    // Then migrate the limited set of orders
    for (const order of ordersToMigrate) {
      await migrateOrder(order);
      console.log(`✓ Migrated order ${order.oid}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
