import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import path from 'path';

const API_KEY = process.env.HDPHOTOHUB_API_KEY || '3EEF3DD2A8E14AD8B1356C7F1914B20C';
const API_BASE_URL = 'https://homesellphotography.hd.pics/api/v1';
const CSV_PATH = '/Users/loganpetree/Desktop/report.csv';

async function getFirstSiteId(): Promise<string> {
  try {
    const fileContent = readFileSync(CSV_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      from: 1,
      to: 2
    });

    if (records.length === 0) {
      throw new Error('No sites found in CSV');
    }

    return records[0]['Site ID'];
  } catch (error) {
    console.error('Error reading CSV:', error);
    throw error;
  }
}

async function fetchSiteDetails(siteId: string) {
  const response = await fetch(`${API_BASE_URL}/site?sid=${siteId}`, {
    headers: {
      'api_key': API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch site ${siteId}: ${response.statusText}`);
  }

  return response.json();
}

export async function POST() {
  try {
    // Get first site ID from CSV
    const siteId = await getFirstSiteId();
    console.log('Found first site ID:', siteId);

    // Fetch site details from HDPhotoHub
    const site = await fetchSiteDetails(siteId);
    console.log('Fetched site details');

    return NextResponse.json({ 
      success: true, 
      site
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}