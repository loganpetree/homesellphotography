import { Suspense } from 'react';
import { SiteList } from '@/components/review/SiteList';
import { SiteDetails } from '@/components/review/SiteDetails';

export default function ReviewPage() {
  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Site Review</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Site List */}
        <div className="md:col-span-4 bg-white rounded-lg shadow flex flex-col">
          <Suspense fallback={<div className="p-4">Loading sites...</div>}>
            <SiteList />
          </Suspense>
        </div>
        
        {/* Site Details */}
        <div className="md:col-span-8 bg-white rounded-lg shadow">
          <Suspense fallback={<div className="p-4">Loading site details...</div>}>
            <SiteDetails />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
