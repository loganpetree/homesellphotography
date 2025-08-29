'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { CheckCircle, Circle } from 'lucide-react';

interface ReviewToggleProps {
  siteId: string;
  reviewed: boolean;
  onToggle?: (reviewed: boolean) => void;
  className?: string;
}

export function ReviewToggle({ siteId, reviewed, onToggle, className = '' }: ReviewToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewed, setIsReviewed] = useState(reviewed);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const siteRef = doc(db, 'sites', siteId);
      await updateDoc(siteRef, {
        reviewed: !isReviewed,
        updatedAt: new Date().toISOString()
      });
      
      setIsReviewed(!isReviewed);
      onToggle?.(!isReviewed);
    } catch (error) {
      console.error('Error toggling review status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isReviewed 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      aria-label={isReviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
    >
      {isLoading ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isReviewed ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <Circle className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">
        {isReviewed ? 'Reviewed' : 'Not Reviewed'}
      </span>
    </button>
  );
}
