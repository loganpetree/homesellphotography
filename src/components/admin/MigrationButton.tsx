'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/lib/firebase-provider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseSite, FirebaseMedia } from '@/types/site';

interface MigrationButtonProps {
  onSuccess: (site: FirebaseSite) => void;
}

export function MigrationButton({ onSuccess }: MigrationButtonProps) {
  const { storage, db, isReady } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  async function downloadAndUploadImage(
    media: any,
    siteId: string
  ): Promise<FirebaseMedia> {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    try {
      setProgress(`Downloading image ${media.order}...`);
      
      // Download image from HDPhotoHub
      const response = await fetch(media.url);
      if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
      const buffer = await response.arrayBuffer();

      setProgress(`Uploading image ${media.order} to Firebase...`);
      
      // Upload to Firebase Storage
      const filename = `sites/${siteId}/media/${media.order.toString().padStart(3, '0')}_${media.mid}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, buffer);
      
      // Get the download URL
      const storageUrl = await getDownloadURL(storageRef);

      return {
        mediaId: media.mid.toString(),
        type: media.type,
        name: media.name,
        hidden: media.hidden,
        highlight: media.highlight,
        extension: media.extension,
        size: media.size,
        originalUrl: media.url,
        storageUrl,
        order: media.order,
        branded: media.branded.split(','),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error processing image ${media.url}:`, error);
      throw error;
    }
  }

  function convertToFirebaseSite(hdSite: any): Omit<FirebaseSite, 'media'> {
    return {
      siteId: hdSite.sid.toString(),
      businessId: hdSite.bid.toString(),
      status: hdSite.status,
      purchased: hdSite.purchased,
      user: {
        userId: hdSite.user.uid.toString(),
        businessId: hdSite.user.bid.toString(),
        name: hdSite.user.name,
        firstName: hdSite.user.firstname,
        lastName: hdSite.user.lastname,
        email: hdSite.user.email,
        phone: hdSite.user.phone,
        status: hdSite.user.status,
        type: hdSite.user.type,
        group: {
          groupId: hdSite.user.group.gid.toString(),
          businessId: hdSite.user.group.bid.toString(),
          name: hdSite.user.group.name,
          status: hdSite.user.group.status
        },
        permissions: hdSite.user.keyring.split(',')
      },
      address: hdSite.address,
      city: hdSite.city,
      state: hdSite.state,
      zip: hdSite.zip,
      createdAt: hdSite.created,
      activatedAt: hdSite.activated,
      updatedAt: new Date().toISOString()
    };
  }

  const handleMigration = async () => {
    if (!isReady || !storage || !db) {
      setError('Firebase is not initialized yet. Please try again in a moment.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setProgress('Fetching site data from HDPhotoHub...');

      // Get site data from HDPhotoHub
      const response = await fetch('/api/admin/migrate-first-site', {
        method: 'POST',
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Raw response:', text);
        throw new Error('Invalid response from server: ' + text.substring(0, 100));
      }

      if (!data.success) {
        throw new Error(data.error || 'Migration failed');
      }

      const hdSite = data.site;
      setProgress('Processing images...');

      // Sort media by order
      const sortedMedia = [...hdSite.media].sort((a, b) => a.order - b.order);
      
      // Process images sequentially
      const processedMedia: FirebaseMedia[] = [];
      for (const [index, media] of sortedMedia.entries()) {
        setProgress(`Processing image ${index + 1}/${sortedMedia.length}`);
        const processedImage = await downloadAndUploadImage(media, hdSite.sid.toString());
        processedMedia.push(processedImage);
      }
      
      // Convert and store site data
      const fbSite = convertToFirebaseSite(hdSite);
      const completeSite: FirebaseSite = {
        ...fbSite,
        media: processedMedia
      };

      setProgress('Saving to Firestore...');
      await setDoc(doc(db, 'sites', completeSite.siteId), completeSite);

      onSuccess(completeSite);
      setProgress('Migration completed successfully!');
    } catch (err) {
      console.error('Migration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleMigration}
        disabled={isLoading || !isReady}
        className="w-full"
      >
        {isLoading ? 'Migrating...' : !isReady ? 'Initializing Firebase...' : 'Migrate First Site'}
      </Button>
      
      {progress && (
        <div className="text-sm text-blue-600">
          {progress}
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}