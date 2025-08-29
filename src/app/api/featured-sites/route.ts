import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return empty array as we'll handle this client-side
    return NextResponse.json({ sites: [] });
  } catch (error) {
    console.error('Error fetching featured sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured sites' },
      { status: 500 }
    );
  }
}