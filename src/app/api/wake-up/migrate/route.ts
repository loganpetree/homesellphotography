import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-server';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import fetch from 'node-fetch';
import admin, { adminDb } from '@/lib/firebase-admin';

const storage = admin.storage();
const bucket = storage.bucket();

const API_KEY = '26EF5EABF6A24412AF4C7974475C2D34';
const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';

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

function prepareAddressData(siteData: HDPhotoHubSiteResponse) {
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

// POST - Migrate a specific site
export async function POST(request: NextRequest) {
  try {
    const { siteId } = await request.json();
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400 }
      );
    }
    
    // Update migration status to in_progress
    const wakeUpSiteRef = doc(db, 'wake-up-sites', siteId);
    await updateDoc(wakeUpSiteRef, {
      migrationStatus: 'in_progress',
      updatedAt: serverTimestamp()
    });
    
    try {
      // Get CSV data from wake-up site
      const wakeUpSiteDoc = await getDoc(wakeUpSiteRef);
      if (!wakeUpSiteDoc.exists()) {
        throw new Error('Wake-up site not found');
      }
      
      const wakeUpSiteData = wakeUpSiteDoc.data();
      const csvData = wakeUpSiteData.csvData;
      
      // Fetch site data from HDPhotoHub API
      const siteData = await fetchSite(siteId);
      console.log(`Fetched site ${siteId} with ${siteData.media.length} media files`);
      
      // Process media data
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
      
      // Save to Firestore sites collection
      await adminDb.collection('sites').doc(siteId).set({
        siteId: siteId,
        businessId: siteData.bid.toString(),
        status: siteData.status,
        purchased: siteData.purchased,
        address: prepareAddressData(siteData),
        user: userData,
        created: siteData.created,
        media: processedMedia,
        csvData: {
          orderId: csvData['Order ID'] || '',
          orderStatus: csvData['Order Status'] || '',
          orderTotal: csvData['Order Total'] ? parseFloat(csvData['Order Total']) : 0,
          siteType: csvData['Site Type'] || '',
          siteUrl: csvData['Site URL'] || '',
          mlsNumber: csvData['MLS Number'] || '',
          coordinates: {
            longitude: csvData.Longitude ? parseFloat(csvData.Longitude) : null,
            latitude: csvData.Latitude ? parseFloat(csvData.Latitude) : null
          }
        },
        reviewed: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update migration status to completed
      await updateDoc(wakeUpSiteRef, {
        migrationStatus: 'completed',
        migrationError: null,
        updatedAt: serverTimestamp()
      });
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully migrated site ${siteId} with ${processedMedia.length} media files`
      });
      
    } catch (error) {
      // Update migration status to failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateDoc(wakeUpSiteRef, {
        migrationStatus: 'failed',
        migrationError: errorMessage,
        updatedAt: serverTimestamp()
      });
      
      throw error;
    }
    
  } catch (error) {
    console.error('Error migrating site:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to migrate site' },
      { status: 500 }
    );
  }
}
