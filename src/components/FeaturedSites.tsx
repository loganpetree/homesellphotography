'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FirebaseSite } from '@/types/site';

export function FeaturedSites() {
  const [sites, setSites] = useState<FirebaseSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedSites() {
      try {
        const sitesRef = collection(db, 'sites');
        const q = query(sitesRef, where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        
        const fetchedSites: FirebaseSite[] = [];
        querySnapshot.forEach((doc) => {
          fetchedSites.push(doc.data() as FirebaseSite);
        });

        setSites(fetchedSites);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sites');
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedSites();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (sites.length === 0) return <div>No featured sites found</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sites.map((site) => (
        <div key={site.siteId} className="bg-white rounded-lg shadow p-4">
          {site.media[0] && (
            <img
              src={site.media[0].storageUrl}
              alt={site.address}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <h3 className="text-lg font-semibold">{site.address}</h3>
          <p>{site.city}, {site.state} {site.zip}</p>
        </div>
      ))}
    </div>
  );
}

