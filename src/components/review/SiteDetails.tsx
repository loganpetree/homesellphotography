'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/storage-utils';
import { FavoriteToggle } from '@/components/ui/favorite-toggle';
import { ReviewToggle } from '@/components/ui/review-toggle';

interface MediaItem {
  mediaId: string;
  name: string;
  url?: string;
  originalUrl?: string;
  storageUrl?: string;
  order: number;
  type: string;
  hidden?: boolean;
  highlight?: boolean;
  extension?: string;
  size?: number;
  branded?: string;
}

interface SiteDetails {
  siteId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  user: {
    name: string;
    email: string;
    phone: string;
  };
  media: MediaItem[];
  created: string;
}

export function SiteDetails() {
  const [site, setSite] = useState<SiteDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId');

  useEffect(() => {
    async function fetchSiteDetails() {
      if (!siteId) {
        setSite(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const siteRef = doc(db, 'sites', siteId);
        const siteSnap = await getDoc(siteRef);
        
        if (siteSnap.exists()) {
          const siteData = { ...siteSnap.data() as SiteDetails, siteId: siteSnap.id };
          console.log('Raw site data:', siteSnap.data());
          console.log('Media count:', siteData.media?.length);
          setSite(siteData);
          
          // Load media URLs
          const urls: Record<string, string> = {};
          for (const media of siteData.media) {
            try {
              // Try to use originalUrl or url first if available
              if (media.originalUrl) {
                urls[media.mediaId] = media.originalUrl;
              } else if (media.url) {
                urls[media.mediaId] = media.url;
              } else if (media.storageUrl) {
                urls[media.mediaId] = media.storageUrl;
              } else {
                const url = await getMediaUrl(siteId, media.order, media.name);
                urls[media.mediaId] = url;
              }
              console.log(`URL for media ${media.mediaId}:`, urls[media.mediaId]);
            } catch (err) {
              console.error(`Error loading media ${media.mediaId}:`, err);
              // Fallback to originalUrl if available
              if (media.originalUrl) {
                urls[media.mediaId] = media.originalUrl;
              }
            }
          }
          setMediaUrls(urls);
          console.log('Fetched site details:', siteId);
        } else {
          setError('Site not found');
          setSite(null);
        }
      } catch (err) {
        console.error('Error fetching site details:', err);
        setError(err instanceof Error ? err.message : 'Error fetching site details');
      } finally {
        setLoading(false);
      }
    }

    fetchSiteDetails();
  }, [siteId]);

  if (!siteId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Select a site from the list to view details
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-8 text-center text-red-500">
        Site not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{site.address?.street}</h2>
        <p className="text-gray-600">
          {site.address?.city}, {site.address?.state} {site.address?.zip}
        </p>
        <div className="mt-4">
          <h3 className="font-semibold">Agent Information</h3>
          <p>{site.user?.name}</p>
          <p>{site.user?.email}</p>
          {site.user?.phone && <p>{site.user.phone}</p>}
        </div>
        </div>
        <div className="flex gap-2">
          <FavoriteToggle
            userId="showcase"
            siteId={site.siteId}
            className="mt-2"
          />
          <ReviewToggle
            siteId={site.siteId}
            reviewed={site.reviewed || false}
            className="mt-2"
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          Media Files ({site.media?.length || 0})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {site.media?.sort((a, b) => a.order - b.order).map((media) => {
            console.log('Media item details:', {
              mediaId: media.mediaId,
              name: media.name,
              order: media.order,
              url: mediaUrls[media.mediaId],
              originalUrl: media.originalUrl
            });
            return (
              <div key={media.mediaId} className="relative">
                <div className="aspect-w-16 aspect-h-9 relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '225px' }}>
                  {mediaUrls[media.mediaId] ? (
                    <>
                      <Image
                        src={mediaUrls[media.mediaId]}
                        alt={media.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 flex justify-between items-center">
                        <span>{media.name}</span>
                        <FavoriteToggle
                          userId="showcase"
                          siteId={site.siteId}
                          mediaId={media.mediaId}
                          className="!p-1"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-sm">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                      Loading image...
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Order: {media.order} | ID: {media.mediaId}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}