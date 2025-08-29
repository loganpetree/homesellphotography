'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface SitePreview {
  sid: string;
  address: string;
  city: string;
  state: string;
  previewImage?: string;
}

export default function SitesPage() {
  const [sites, setSites] = useState<SitePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // List of test site IDs (we'll replace these with real ones)
  const testSiteIds = ['1234', '1235', '1236', '1237', '1238'];

  const fetchSiteDetails = async (siteId: string) => {
    try {
      const response = await fetch(`/api/hdphotohub/site?sid=${siteId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch site ${siteId}`);
      }
      const data = await response.json();
      
      // Get the first non-hidden image if available
      const previewImage = data.media?.find((img: { hidden: boolean; url: string }) => !img.hidden)?.url;
      
      return {
        sid: siteId,
        address: data.address,
        city: data.city,
        state: data.state,
        previewImage
      };
    } catch (error) {
      console.error(`Error fetching site ${siteId}:`, error);
      return null;
    }
  };

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress({ current: 0, total: testSiteIds.length });

      // Process sites in parallel, but limit concurrency
      const batchSize = 3;
      const results: SitePreview[] = [];

      for (let i = 0; i < testSiteIds.length; i += batchSize) {
        const batch = testSiteIds.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(sid => fetchSiteDetails(sid))
        );

        // Filter out failed requests and add successful ones
        const validResults = batchResults.filter((r): r is SitePreview => r !== null);
        results.push(...validResults);

        // Update progress
        setProgress(prev => ({
          ...prev,
          current: Math.min(i + batchSize, testSiteIds.length)
        }));

        // Update sites as they come in
        setSites(prev => [...prev, ...validResults]);
      }

    } catch (error) {
      console.error('Failed to load sites:', error);
      setError('Failed to load sites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Site Browser</h1>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-gray-600">
                Loading sites ({progress.current}/{progress.total})
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div
              key={site.sid}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {site.previewImage && (
                <div className="relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={site.previewImage}
                    alt={site.address}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium">{site.address}</h3>
                <p className="text-sm text-gray-500">
                  {site.city}, {site.state}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(site.sid);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-gray-700"
                  >
                    Copy ID
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && sites.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sites found.
          </div>
        )}
      </div>
    </div>
  );
}