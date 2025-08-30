export interface CSVSite {
  'Site ID': string;
  'Order ID': string;
  'Order Status': string;
  'Invoice Date': string;
  'Order Total': string;
  'Site Type': string;
  'Site URL': string;
  'Site Created': string;
  Address: string;
  'Address 2': string;
  City: string;
  State: string;
  'Zip Code': string;
  'MLS Number': string;
  Longitude: string;
  Latitude: string;
  'Agent Name': string;
  'First Name': string;
  'Last Name': string;
  Email: string;
  Phone: string;
  Website: string;
  Group: string;
  [key: string]: string; // Allow for other columns we might need later
}

export interface WakeUpSite {
  siteId: string;
  isAwake: boolean;
  wakeUpUrl: string;
  lastWakeUpAttempt?: string;
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  migrationError?: string;
  csvData: CSVSite;
  createdAt: string;
  updatedAt: string;
}

export interface WakeUpProgress {
  totalSites: number;
  awakeSites: number;
  migratedSites: number;
  lastUpdated: string;
}

