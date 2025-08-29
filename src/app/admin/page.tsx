'use client';

import { useState } from 'react';
import { MigrationButton } from '@/components/admin/MigrationButton';
import { SiteDisplay } from '@/components/admin/SiteDisplay';
import { FirebaseSite } from '@/types/site';
import { FirebaseProvider } from '@/lib/firebase-provider';

export default function AdminPage() {
  const [migratedSite, setMigratedSite] = useState<FirebaseSite | null>(null);

  const handleMigrationSuccess = (site: FirebaseSite) => {
    setMigratedSite(site);
  };

  return (
    <FirebaseProvider>
      <div className="container mx-auto py-8 space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <div className="space-y-4">
            <h2 className="text-xl">Site Migration</h2>
            <MigrationButton onSuccess={handleMigrationSuccess} />
          </div>
        </div>

        {migratedSite && (
          <SiteDisplay site={migratedSite} />
        )}
      </div>
    </FirebaseProvider>
  );
}