import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { HDPhotoHubSite, FirebaseSite, FirebaseMedia } from '@/types/site-migration';

const API_KEY = '3EEF3DD2A8E14AD8B1356C7F1914B20C';
const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';

// Initialize Firebase (you'll need to provide your config)
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

interface CSVRow {
  'Site ID': string;
  'Address': string;
  'City': string;
  'State': string;
  'Zip Code': string;
  // Add other fields as needed
}

async function fetchSiteDetails(siteId: string): Promise<HDPhotoHubSite> {
  const response = await fetch(`${API_BASE_URL}/site?sid=${siteId}`, {
    headers: {
      'api_key': API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch site ${siteId}: ${response.statusText}`);
  }

  return response.json();
}

async function downloadAndUploadImage(
  media: HDPhotoHubSite['media'][0], 
  siteId: string
): Promise<FirebaseMedia> {
  try {
    // Download image from HDPhotoHub
    const response = await fetch(media.url);
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();

    // Upload to Firebase Storage
    const storageRef = ref(storage, `sites/${siteId}/media/${media.order.toString().padStart(3, '0')}_${media.mid}.jpg`);
    await uploadBytes(storageRef, buffer);
    
    // Get the download URL
    const storageUrl = await getDownloadURL(storageRef);

    // Return the Firebase media object
    return {
      mediaId: media.mid.toString(),
      type: media.type,
      name: media.name,
      hidden: media.hidden,
      highlight: media.highlight,
      extension: media.extension,
      size: media.size,
      originalUrl: media.url,
      storageUrl,
      order: media.order,
      branded: media.branded.split(','),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error processing image ${media.url}:`, error);
    throw error;
  }
}

function convertToFirebaseSite(hdSite: HDPhotoHubSite): Omit<FirebaseSite, 'media'> {
  return {
    siteId: hdSite.sid.toString(),
    businessId: hdSite.bid.toString(),
    status: hdSite.status,
    purchased: hdSite.purchased,
    user: {
      userId: hdSite.user.uid.toString(),
      businessId: hdSite.user.bid.toString(),
      name: hdSite.user.name,
      firstName: hdSite.user.firstname,
      lastName: hdSite.user.lastname,
      email: hdSite.user.email,
      phone: hdSite.user.phone,
      status: hdSite.user.status,
      type: hdSite.user.type,
      group: {
        groupId: hdSite.user.group.gid.toString(),
        businessId: hdSite.user.group.bid.toString(),
        name: hdSite.user.group.name,
        status: hdSite.user.group.status
      },
      permissions: hdSite.user.keyring.split(',')
    },
    address: hdSite.address,
    city: hdSite.city,
    state: hdSite.state,
    zip: hdSite.zip,
    createdAt: hdSite.created,
    activatedAt: hdSite.activated,
    updatedAt: new Date().toISOString()
  };
}

async function processSite(siteId: string): Promise<void> {
  try {
    console.log(`Processing site ${siteId}...`);
    
    // Fetch site details from HDPhotoHub
    const hdSite = await fetchSiteDetails(siteId);
    
    // Sort media by order to ensure we process in the correct sequence
    const sortedMedia = [...hdSite.media].sort((a, b) => a.order - b.order);
    
    // Process images sequentially to maintain order
    const processedMedia: FirebaseMedia[] = [];
    for (const media of sortedMedia) {
      console.log(`Processing image ${media.order}/${sortedMedia.length} for site ${siteId}`);
      const processedImage = await downloadAndUploadImage(media, siteId);
      processedMedia.push(processedImage);
    }
    
    // Convert site metadata
    const fbSite = convertToFirebaseSite(hdSite);
    
    // Store complete site data in Firestore only after all images are processed
    const completeSite: FirebaseSite = {
      ...fbSite,
      media: processedMedia
    };

    await setDoc(doc(db, 'sites', siteId), completeSite);
    console.log(`Successfully processed site ${siteId} with ${processedMedia.length} images`);
  } catch (error) {
    console.error(`Error processing site ${siteId}:`, error);
    throw error;
  }
}

export async function startMigration(csvPath: string, specificSiteIds?: string[]) {
  const parser = parse({
    columns: true,
    skip_empty_lines: true
  });

  const processStream = new Promise((resolve, reject) => {
    const sites: string[] = [];

    createReadStream(csvPath)
      .pipe(parser)
      .on('data', (row: CSVRow) => {
        if (!specificSiteIds || specificSiteIds.includes(row['Site ID'])) {
          sites.push(row['Site ID']);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Found ${sites.length} sites to process`);
          
          // Process sites sequentially to maintain order and avoid overwhelming the system
          for (let i = 0; i < sites.length; i++) {
            const siteId = sites[i];
            console.log(`Processing site ${i + 1}/${sites.length}`);
            await processSite(siteId);
          }
          
          resolve('Migration completed successfully');
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });

  return processStream;
}