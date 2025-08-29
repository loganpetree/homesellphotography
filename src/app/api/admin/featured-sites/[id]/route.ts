import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isActive, order } = body;

    const docRef = adminDb.collection('featuredSites').doc(params.id);
    
    await docRef.update({
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(typeof order === 'number' && { order }),
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await docRef.get();
    
    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Error updating featured site:', error);
    return NextResponse.json(
      { error: 'Failed to update featured site' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await adminDb.collection('featuredSites').doc(params.id).delete();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting featured site:', error);
    return NextResponse.json(
      { error: 'Failed to delete featured site' },
      { status: 500 }
    );
  }
}
