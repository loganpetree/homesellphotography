'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getFavorites } from '@/lib/favorites';
import { db } from '@/lib/firebase-client';
import { doc, getDoc } from 'firebase/firestore';
import type { FirebaseSite, FirebaseMedia } from '@/types/site';

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface FavoriteGalleryProps {
  userId: string;
  className?: string;
}

interface FavoriteImage {
  mediaId: string;
  siteId: string;
  url: string;
  name: string;
  siteName: string;
  location: string;
}

function getLocationInfo(siteData: any): { address: string; location: string } {
  console.log('Site location data:', {
    address: siteData.address,
  });

  let street = 'Address not available';
  let city = '';
  let state = '';

  if (typeof siteData.address === 'object' && siteData.address !== null) {
    street = siteData.address.street || 'Address not available';
    city = siteData.address.city || '';
    state = siteData.address.state || '';
  }

  const locationParts = [];
  if (city) locationParts.push(city);
  if (state) locationParts.push(state);
  
  return {
    address: street,
    location: locationParts.join(', ') || 'Location not available'
  };
}

export default function FavoriteGallery({ userId, className = '' }: FavoriteGalleryProps) {
  const [images, setImages] = useState<FavoriteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavoriteImages() {
      try {
        const favorites = await getFavorites(userId);
        if (!favorites) {
          setImages([]);
          return;
        }

        const favoriteImages: FavoriteImage[] = [];

        // Process individual media favorites
        for (const mediaFavorite of favorites.media) {
          try {
            const siteRef = doc(db, 'sites', mediaFavorite.siteId);
            const siteSnap = await getDoc(siteRef);
            
            if (siteSnap.exists()) {
              const siteData = siteSnap.data() as FirebaseSite;
              const media = siteData.media.find(m => m.mediaId === mediaFavorite.mediaId);
              
              if (media) {
                const locationInfo = getLocationInfo(siteData);
                favoriteImages.push({
                  mediaId: media.mediaId,
                  siteId: mediaFavorite.siteId,
                  url: media.originalUrl || media.storageUrl,
                  name: media.name || 'Untitled',
                  siteName: locationInfo.address,
                  location: locationInfo.location
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching site ${mediaFavorite.siteId}:`, err);
          }
        }

        // Process site favorites - get first image from each site
        for (const siteFavorite of favorites.sites) {
          try {
            const siteRef = doc(db, 'sites', siteFavorite.siteId);
            const siteSnap = await getDoc(siteRef);
            
            if (siteSnap.exists()) {
              const siteData = siteSnap.data() as FirebaseSite;
              const firstMedia = siteData.media.find(m => !m.hidden);
              
              if (firstMedia) {
                const locationInfo = getLocationInfo(siteData);
                favoriteImages.push({
                  mediaId: firstMedia.mediaId,
                  siteId: siteFavorite.siteId,
                  url: firstMedia.originalUrl || firstMedia.storageUrl,
                  name: firstMedia.name || 'Untitled',
                  siteName: locationInfo.address,
                  location: locationInfo.location
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching site ${siteFavorite.siteId}:`, err);
          }
        }

        // Shuffle the images and limit to 8
        const shuffledImages = shuffleArray(favoriteImages);
        const limitedImages = shuffledImages.slice(0, 8);
        setImages(limitedImages);
      } catch (error) {
        console.error('Error fetching favorite images:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch favorite images');
      } finally {
        setLoading(false);
      }
    }

    fetchFavoriteImages();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No favorite images available.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {images.map((image) => (
        <div key={`${image.siteId}-${image.mediaId}`} className="relative aspect-[4/3] group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-3 text-white">
            <div className="text-sm font-medium leading-snug line-clamp-2 drop-shadow-md">{image.siteName}</div>
            <div className="text-xs mt-1 drop-shadow-md">{image.location}</div>
          </div>
        </div>
      ))}
    </div>
  );
}