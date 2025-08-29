const API_KEY = process.env.HDPHOTOHUB_API_KEY;
const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';

export interface HDPhotoHubSite {
  sid: number;
  bid: number;
  status: 'active' | 'inactive' | 'archived';
  purchased: 'yes' | 'delivery only' | 'no';
  address: string;
  city: string;
  state: string;
  zip: string;
  media: Array<{
    mid: number;
    name: string;
    type: string;
    hidden: boolean;
    highlight: boolean;
    extension: string;
    size: number;
    url: string;
    order: number;
  }>;
}

export async function fetchAllSites(limit?: number) {
  try {
    const url = new URL(`${API_BASE_URL}/sites`);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }
    console.log('Client: Making request to', url.toString());
    console.log('API Key:', API_KEY);
    const response = await fetch(url, {
      headers: new Headers({
        'api_key': API_KEY || ''
      })
    });
    console.log('Client: Got response:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch sites: ${response.status} ${response.statusText}`);
    }

    // Read the response as a stream and process it line by line
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
      // Clean the JSON text - remove any invalid characters
      jsonText = jsonText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      
      const data = JSON.parse(jsonText);
      console.log('Client: Successfully parsed JSON. Number of sites:', Array.isArray(data) ? data.length : 'Not an array');
      
      if (!Array.isArray(data)) {
        console.log('Client: Data structure:', data);
        throw new Error('Response is not an array of sites');
      }
      
      return data as HDPhotoHubSite[];
    } catch (e) {
      console.error('Client: JSON parse error:', e);
      // Save the problematic JSON for debugging
      console.error('Client: First 1000 chars of response:', jsonText.substring(0, 1000));
      console.error('Client: Last 1000 chars of response:', jsonText.substring(jsonText.length - 1000));
      throw new Error(`Invalid JSON response: ${(e as Error).message}`);
    }
  } catch (error) {
    console.error('Error fetching all sites:', error);
    throw error;
  }
}

export async function searchSites(searchTerm: string = '') {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append('address', searchTerm);
    
    const response = await fetch(`${API_BASE_URL}/sites?${params.toString()}`, {
      headers: new Headers({
        'api_key': API_KEY || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to search sites: ${response.statusText}`);
    }

    const data = await response.json();
    return data as HDPhotoHubSite[];
  } catch (error) {
    console.error('Error searching sites:', error);
    throw error;
  }
}
