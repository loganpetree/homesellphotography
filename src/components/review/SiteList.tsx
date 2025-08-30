'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToggleSwitch } from '@/components/ui/toggle-switch';

interface Site {
  siteId: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  user: {
    name: string;
  };
  media: any[];
  reviewed?: boolean;
  created?: string;
}

const SITES_PER_PAGE = 10;

export function SiteList() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hideReviewed, setHideReviewed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSiteId = searchParams.get('siteId');

  useEffect(() => {
    async function fetchSites() {
      try {
        setLoading(true);
        setError(null);
        
        // Create a query against the sites collection
        const sitesRef = collection(db, 'sites');
        const q = query(sitesRef);

        // Get the documents
        const querySnapshot = await getDocs(q);
        
        // Map the documents to our Site interface
        const sitesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            siteId: doc.id,
            reviewed: data.reviewed || false
          } as Site;
        });

        // Sort sites by created date (newest first), with fallback for missing created field
        sitesData.sort((a, b) => {
          const aDate = a.created ? new Date(a.created).getTime() : 0;
          const bDate = b.created ? new Date(b.created).getTime() : 0;
          return bDate - aDate; // Descending order (newest first)
        });
        
        console.log('Fetched sites:', sitesData.length);
        console.log('Sample site data:', sitesData.slice(0, 3).map(s => ({
          id: s.siteId,
          reviewed: s.reviewed,
          address: s.address?.street,
          created: s.created
        })));
        console.log('Created field values:', sitesData.slice(0, 5).map(s => s.created));

        // Check for sites without created field
        const sitesWithoutCreated = sitesData.filter(s => !s.created);
        if (sitesWithoutCreated.length > 0) {
          console.warn('Sites without created field:', sitesWithoutCreated.map(s => s.siteId));
        }

        // Log the ordering to verify it's working
        const firstFiveSites = sitesData.slice(0, 5).map(s => ({
          id: s.siteId,
          created: s.created,
          createdDate: s.created ? new Date(s.created).toLocaleString() : 'N/A'
        }));
        console.log('First 5 sites after JavaScript sorting (should be newest):', firstFiveSites);

        setSites(sitesData);
      } catch (err) {
        console.error('Error fetching sites:', err);
        // Log more details about the error
        if (err instanceof Error) {
          console.log('Error name:', err.name);
          console.log('Error message:', err.message);
          console.log('Error stack:', err.stack);
        }
        setError(err instanceof Error ? err.message : 'Error fetching sites');
      } finally {
        setLoading(false);
      }
    }

    fetchSites();
  }, []);

  // Filter sites based on search term and reviewed status
  const filteredSites = useMemo(() => {
    let filtered = sites;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(site => 
        site.siteId.toLowerCase().includes(term) ||
        site.address?.street?.toLowerCase().includes(term) ||
        `${site.address?.street} ${site.address?.city} ${site.address?.state}`.toLowerCase().includes(term)
      );
    }
    
    // Filter out reviewed sites if hideReviewed is true
    if (hideReviewed) {
      console.log('Filtering reviewed sites. Before:', filtered.length);
      filtered = filtered.filter(site => !site.reviewed);
      console.log('After filtering reviewed:', filtered.length);
      console.log('Sample site reviewed status:', filtered.slice(0, 3).map(s => ({ id: s.siteId, reviewed: s.reviewed })));
    }
    
    return filtered;
  }, [sites, searchTerm, hideReviewed]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSites.length / SITES_PER_PAGE);
  const startIndex = (currentPage - 1) * SITES_PER_PAGE;
  const endIndex = startIndex + SITES_PER_PAGE;
  const paginatedSites = filteredSites.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, hideReviewed]);

  const selectSite = (siteId: string) => {
    router.push(`/review?siteId=${siteId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No sites found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar and Filters */}
      <div className="p-4 border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Site ID or Address..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <ToggleSwitch
            checked={hideReviewed}
            onChange={setHideReviewed}
            label="Hide reviewed sites"
          />
          <div className="text-sm text-gray-600">
            {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div className="flex-1 divide-y overflow-y-auto">
        {paginatedSites.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            {searchTerm ? 'No sites match your search' : 'No sites found'}
          </div>
        ) : (
          paginatedSites.map((site) => (
            <div
              key={site.siteId}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedSiteId === site.siteId ? 'bg-blue-50' : ''
              }`}
              onClick={() => selectSite(site.siteId)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{site.address?.street || 'No address'}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {site.siteId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {site.address?.city}, {site.address?.state}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Agent: {site.user?.name || 'No agent'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Media: {site.media?.length || 0} files
                  </p>
                </div>
                {site.reviewed && (
                  <div className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredSites.length)} of {filteredSites.length} sites
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}