import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // For now, return 404 as we'll handle this client-side
    return NextResponse.json(
      { error: 'Site not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching featured site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured site' },
      { status: 500 }
    );
  }
}