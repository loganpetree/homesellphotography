import { NextResponse } from 'next/server';
import { API_KEY, API_BASE_URL } from '@/types/hdphotohub';

export async function GET() {
  try {
    // Try with a specific user ID first
    const url = 'https://homesellphotography.hd.pics/api/v1/sites?uid=1234';
    
    console.log('Making request to:', url);
    console.log('With headers:', {
      'api_key': API_KEY
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api_key': API_KEY
      }
    });
    
    console.log('Got response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Raw response text:', text.substring(0, 1000)); // Log first 1000 chars
    
    try {
      // Try to parse as JSON
      const data = JSON.parse(text);
      console.log('Successfully parsed JSON. First item:', data[0]);
      return NextResponse.json(data);
    } catch (e) {
      console.error('Failed to parse response as JSON. Error:', e);
      console.error('First 100 characters of response:', text.substring(0, 100));
      return NextResponse.json({ 
        error: 'Invalid JSON response', 
        parseError: e.message,
        responsePreview: text.substring(0, 100)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
