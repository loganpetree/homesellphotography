import { NextResponse } from 'next/server';
import { API_KEY, API_BASE_URL } from '@/types/hdphotohub';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('sid');

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    const url = `${API_BASE_URL}/site?sid=${siteId}`;
    console.log('Fetching site:', url);

    const response = await fetch(url, {
      headers: {
        'api_key': API_KEY
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch site: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site details' },
      { status: 500 }
    );
  }
}

