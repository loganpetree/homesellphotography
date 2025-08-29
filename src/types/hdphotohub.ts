export interface HDPhotoHubImage {
  mid: number;          // Media ID
  type: string;         // Media type (e.g., "still")
  name: string;         // Original filename
  hidden: boolean;      // Whether image is hidden
  highlight: boolean;   // Whether image is highlighted
  extension: string;    // File extension (e.g., "jpg")
  size: number;         // File size in bytes
  url: string;         // Direct URL to image
  order: number;       // Image order in set
  branded: string;     // Available versions ("branded,unbranded,download")
}

export interface HDPhotoHubResponse {
  sid: number;         // Site ID
  bid: number;         // Business ID
  status: string;      // Site status
  purchased: string;   // Purchase status
  address: string;     // Property address
  city: string;        // Property city
  state: string;       // Property state
  zip: string;         // Property zip
  media: HDPhotoHubImage[]; // Array of images
}

export const API_KEY = '3EEF3DD2A8E14AD8B1356C7F1914B20C';
export const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';
