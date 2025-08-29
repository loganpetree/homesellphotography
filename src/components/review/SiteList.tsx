'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
}

const SITES_PER_PAGE = 10;

export function SiteList() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
        const q = query(sitesRef, orderBy('created', 'desc'));
        
        // Get the documents
        const querySnapshot = await getDocs(q);
        
        // Map the documents to our Site interface
        const sitesData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          siteId: doc.id
        } as Site));
        
        setSites(sitesData);
        console.log('Fetched sites:', sitesData.length);
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

  // Filter sites based on search term
  const filteredSites = useMemo(() => {
    if (!searchTerm.trim()) return sites;
    
    const term = searchTerm.toLowerCase();
    return sites.filter(site => 
      site.siteId.toLowerCase().includes(term) ||
      site.address?.street?.toLowerCase().includes(term) ||
      `${site.address?.street} ${site.address?.city} ${site.address?.state}`.toLowerCase().includes(term)
    );
  }, [sites, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSites.length / SITES_PER_PAGE);
  const startIndex = (currentPage - 1) * SITES_PER_PAGE;
  const endIndex = startIndex + SITES_PER_PAGE;
  const paginatedSites = filteredSites.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      {/* Search Bar */}
      <div className="p-4 border-b">
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
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredSites.length} sites
          </div>
        )}
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