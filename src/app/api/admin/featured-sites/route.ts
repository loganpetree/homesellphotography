import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const sitesSnapshot = await adminDb.collection('featuredSites')
      .orderBy('order', 'asc')
      .get();

    const sites = sitesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching featured sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured sites' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId, title, location } = body;

    // Get the current count of sites for ordering
    const sitesSnapshot = await adminDb.collection('featuredSites').get();
    const order = sitesSnapshot.size;

    const docRef = await adminDb.collection('featuredSites').add({
      siteId,
      title,
      location,
      order,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const newDoc = await docRef.get();
    
    return NextResponse.json({
      id: newDoc.id,
      ...newDoc.data()
    });
  } catch (error) {
    console.error('Error creating featured site:', error);
    return NextResponse.json(
      { error: 'Failed to create featured site' },
      { status: 500 }
    );
  }
}
