"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { HDPhotoHubImage, HDPhotoHubResponse, API_KEY, API_BASE_URL } from '@/types/hdphotohub';

interface PhotoGalleryProps {
  siteId?: string;
  className?: string;
  fetchFeatured?: boolean;
}

export default function PhotoGallery({ siteId, className = '', fetchFeatured = false }: PhotoGalleryProps) {
  const [images, setImages] = useState<HDPhotoHubImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        if (fetchFeatured) {
          // Fetch featured sites first
          const featuredResponse = await fetch('/api/featured-sites');
          if (!featuredResponse.ok) {
            throw new Error('Failed to fetch featured sites');
          }
          const featuredSites = await featuredResponse.json();
          
          // Only fetch active sites
          const activeSites = featuredSites.filter((site: any) => site.isActive);
          
          // Fetch images for each site
          const allImages = await Promise.all(
            activeSites.map(async (site: any) => {
              const response = await fetch(
                `${API_BASE_URL}/site?sid=${site.siteId}`,
                {
                  headers: {
                    'api_key': API_KEY
                  }
                }
              );
              
              if (!response.ok) {
                console.error(`Failed to fetch site ${site.siteId}`);
                return null;
              }
              
              const data: HDPhotoHubResponse = await response.json();
              // Get the first non-hidden image from each site
              const firstImage = data.media.find(img => !img.hidden);
              if (firstImage) {
                return {
                  ...firstImage,
                  title: site.title,
                  location: site.location,
                  order: site.order
                };
              }
              return null;
            })
          );
          
          // Filter out null results and sort by order
          const validImages = allImages
            .filter((img): img is NonNullable<typeof img> => img !== null)
            .sort((a, b) => a.order - b.order);
            
          setImages(validImages);
        } else if (siteId) {
          const response = await fetch(
            `${API_BASE_URL}/site?sid=${siteId}`,
            {
              headers: {
                'api_key': API_KEY
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to fetch images: ${response.statusText}`);
          }

          const data: HDPhotoHubResponse = await response.json();
          // Sort images by order field and filter out hidden images
          const sortedImages = data.media
            .filter(img => !img.hidden)
            .sort((a, b) => a.order - b.order);
          setImages(sortedImages);
        } else {
          throw new Error('Either siteId or fetchFeatured must be provided');
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch images');
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [siteId, fetchFeatured]);

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
        No images available for this property.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {images.map((image) => (
        <div key={image.mid} className="relative aspect-[4/3] group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {image.highlight && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
