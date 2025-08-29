'use client';

import { useState, useEffect } from 'react';
import { toggleFavoriteSite, toggleFavoriteMedia, isSiteFavorited, isMediaFavorited } from '@/lib/favorites';

interface FavoriteToggleProps {
  userId: string;
  siteId: string;
  mediaId?: string;
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
}

export function FavoriteToggle({ userId, siteId, mediaId, onToggle, className = '' }: FavoriteToggleProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkFavoriteStatus() {
      try {
        const favorited = mediaId 
          ? await isMediaFavorited(userId, siteId, mediaId)
          : await isSiteFavorited(userId, siteId);
        setIsFavorite(favorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkFavoriteStatus();
  }, [userId, siteId, mediaId]);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const newStatus = mediaId
        ? await toggleFavoriteMedia(userId, siteId, mediaId)
        : await toggleFavoriteSite(userId, siteId);
      
      setIsFavorite(newStatus);
      onToggle?.(newStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors ${
        isFavorite 
          ? 'bg-yellow-100 hover:bg-yellow-200' 
          : 'bg-gray-100 hover:bg-gray-200'
      } ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      ) : (
        <svg
          className={`w-6 h-6 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </button>
  );
}
