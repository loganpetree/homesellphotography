'use client';

import { FirebaseSite } from '@/types/site-migration';

interface SiteDisplayProps {
  site: FirebaseSite;
}

export function SiteDisplay({ site }: SiteDisplayProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Site Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Address:</strong> {site.address}</p>
            <p><strong>City:</strong> {site.city}</p>
            <p><strong>State:</strong> {site.state}</p>
            <p><strong>ZIP:</strong> {site.zip}</p>
          </div>
          <div>
            <p><strong>Status:</strong> {site.status}</p>
            <p><strong>Created:</strong> {new Date(site.createdAt).toLocaleDateString()}</p>
            <p><strong>Activated:</strong> {new Date(site.activatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Images ({site.media.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {site.media.map((media) => (
            <div key={media.mediaId} className="space-y-2">
              <img
                src={media.storageUrl}
                alt={media.name}
                className="w-full h-48 object-cover rounded"
              />
              <div className="text-sm">
                <p><strong>Order:</strong> {media.order}</p>
                <p><strong>Type:</strong> {media.type}</p>
                <p><strong>Size:</strong> {(media.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}