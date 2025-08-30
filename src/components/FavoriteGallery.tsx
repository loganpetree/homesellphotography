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
  expanded?: boolean;
}

interface FavoriteImage {
  mediaId: string;
  siteId: string;
  url: string;
  mediumUrl?: string;
  largeUrl?: string;
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

export default function FavoriteGallery({ userId, className = '', expanded = false }: FavoriteGalleryProps) {
  const [images, setImages] = useState<FavoriteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // Reset to page 1 when fetching new images
    setCurrentPage(1);

    async function fetchFavoriteImages() {
      try {
        const favorites = await getFavorites(userId);
        if (!favorites) {
          setImages([]);
          return;
        }

        // Limit the number of items we'll process - up to 50 when expanded
        const limit = expanded ? 50 : 8;
        const shuffledMedia = shuffleArray(favorites.media).slice(0, limit);
        const shuffledSites = shuffleArray(favorites.sites).slice(0, limit);
        
        // Fetch all sites in parallel
        const sitePromises = [...shuffledMedia, ...shuffledSites].map(favorite => 
          getDoc(doc(db, 'sites', favorite.siteId))
            .then(snap => ({ snap, favorite }))
            .catch(err => {
              console.error(`Error fetching site ${favorite.siteId}:`, err);
              return null;
            })
        );

        const results = await Promise.all(sitePromises);
        const favoriteImages: FavoriteImage[] = [];

        for (const result of results) {
          if (!result || !result.snap.exists()) continue;

          const siteData = result.snap.data() as FirebaseSite;
          const locationInfo = getLocationInfo(siteData);

          // If it's a media favorite, find that specific media
          if ('mediaId' in result.favorite) {
            const media = siteData.media.find(m => m.mediaId === result.favorite.mediaId);
            if (media) {
              favoriteImages.push({
                mediaId: media.mediaId,
                siteId: result.favorite.siteId,
                                  url: media.mediumUrl || media.smallUrl || media.storageUrl || media.url || media.originalUrl,
                name: media.name || 'Untitled',
                siteName: locationInfo.address,
                location: locationInfo.location
              });
            }
          } 
          // If it's a site favorite, get the first non-hidden media
          else {
            const firstMedia = siteData.media.find(m => !m.hidden);
            if (firstMedia) {
              favoriteImages.push({
                mediaId: firstMedia.mediaId,
                siteId: result.favorite.siteId,
                                  url: firstMedia.mediumUrl || firstMedia.smallUrl || firstMedia.storageUrl || firstMedia.url || firstMedia.originalUrl,
                name: firstMedia.name || 'Untitled',
                siteName: locationInfo.address,
                location: locationInfo.location
              });
            }
          }
        }

        // Shuffle and limit the final results
        const shuffledImages = shuffleArray(favoriteImages);
        const limitedImages = expanded ? shuffledImages : shuffledImages.slice(0, 8);
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

  // Show skeleton UI while loading
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-300 to-transparent">
              <div className="absolute bottom-3 left-3 right-12 h-4 bg-gray-300 rounded"></div>
              <div className="absolute bottom-9 left-3 right-24 h-3 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
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

  // Pagination calculations
  const totalPages = Math.ceil(images.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = images.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (images.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No favorite images available.
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentImages.map((image) => (
        <div key={`${image.siteId}-${image.mediaId}`} className="relative aspect-[4/3] group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <Image
            src={image.url}
            priority={true} // Preload first 4 images
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first page, last page, current page, and pages around current page
                return page === 1 ||
                       page === totalPages ||
                       (page >= currentPage - 1 && page <= currentPage + 1);
              })
              .map((page, index, array) => {
                // Add ellipsis for gaps
                const prevPage = array[index - 1];
                const showEllipsis = index > 0 && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                    <button
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === currentPage
                          ? 'text-white bg-[#22C55E] border-[#22C55E]'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Image count display */}
      {expanded && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Showing {startIndex + 1}-{Math.min(endIndex, images.length)} of {images.length} favorited images
        </div>
      )}
    </div>
  );
}