import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-server';
import { collection, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { WakeUpSite } from '@/types/wake-up';

// GET - Fetch wake-up sites (only sites with ID 2094425 and older)
export async function GET() {
  try {
    const wakeUpCollection = collection(db, 'wake-up-sites');
    const snapshot = await getDocs(wakeUpCollection);
    
    if (snapshot.empty) {
      return NextResponse.json({ 
        sites: [], 
        message: 'No wake-up sites found. Please run the upload script first.' 
      });
    }
    
    const allSites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (WakeUpSite & { id: string })[];
    
    // Filter to only include sites with ID 2094425 and older (smaller IDs)
    const cutoffSiteId = 2094425;
    const filteredSites = allSites.filter(site => {
      const siteIdNum = parseInt(site.siteId);
      return !isNaN(siteIdNum) && siteIdNum <= cutoffSiteId;
    });
    
    const excludedCount = allSites.length - filteredSites.length;
    
    // Sort by site ID for consistent ordering
    filteredSites.sort((a, b) => a.siteId.localeCompare(b.siteId));
    
    return NextResponse.json({ 
      sites: filteredSites,
      excluded: excludedCount,
      message: excludedCount > 0 ? `${excludedCount} newer sites excluded (only showing Site ID ${cutoffSiteId} and older)` : undefined
    });
  } catch (error) {
    console.error('Error fetching wake-up sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wake-up sites' },
      { status: 500 }
    );
  }
}

// POST - Update wake-up status for a site
export async function POST(request: NextRequest) {
  try {
    const { siteId, isAwake } = await request.json();
    
    if (!siteId || typeof isAwake !== 'boolean') {
      return NextResponse.json(
        { error: 'siteId and isAwake are required' },
        { status: 400 }
      );
    }
    
    const siteRef = doc(db, 'wake-up-sites', siteId);
    await updateDoc(siteRef, {
      isAwake,
      lastWakeUpAttempt: isAwake ? new Date().toISOString() : null,
      updatedAt: serverTimestamp()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating wake-up status:', error);
    return NextResponse.json(
      { error: 'Failed to update wake-up status' },
      { status: 500 }
    );
  }
}


