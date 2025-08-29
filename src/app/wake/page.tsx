'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { WakeUpSite } from '@/types/wake-up';

interface WakeUpSiteWithId extends WakeUpSite {
  id: string;
}

export default function WakePage() {
  const [sites, setSites] = useState<WakeUpSiteWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationLoading, setMigrationLoading] = useState<string | null>(null);
  const [showAwakeSites, setShowAwakeSites] = useState(false);
  const [excludedCount, setExcludedCount] = useState(0);
  const [excludedMessage, setExcludedMessage] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wake-up');
      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }
      const data = await response.json();
      setSites(data.sites);
      setExcludedCount(data.excluded || 0);
      setExcludedMessage(data.message || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  const toggleWakeStatus = async (siteId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/wake-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId,
          isAwake: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wake status');
      }

      // Update local state
      setSites(prevSites =>
        prevSites.map(site =>
          site.siteId === siteId
            ? { ...site, isAwake: !currentStatus, updatedAt: new Date().toISOString() }
            : site
        )
      );
    } catch (err) {
      console.error('Error updating wake status:', err);
      alert('Failed to update wake status');
    }
  };

  const migrateSite = async (siteId: string) => {
    try {
      setMigrationLoading(siteId);
      
      const response = await fetch('/api/wake-up/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to migrate site');
      }

      const result = await response.json();
      alert(result.message || 'Site migrated successfully');
      
      // Update local state instead of refetching all sites
      setSites(prevSites =>
        prevSites.map(site =>
          site.siteId === siteId
            ? { ...site, migrationStatus: 'completed', migrationError: null, updatedAt: new Date().toISOString() }
            : site
        )
      );
    } catch (err) {
      console.error('Error migrating site:', err);
      alert(err instanceof Error ? err.message : 'Failed to migrate site');
    } finally {
      setMigrationLoading(null);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const getMigrationStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMigrationStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  // Filter sites based on showAwakeSites toggle
  const filteredSites = showAwakeSites ? sites : sites.filter(site => !site.isAwake);

  // Sort filtered sites by date (newest first)
  const sortedSites = [...filteredSites].sort((a, b) => {
    // Try to use Site Created date first, fall back to Invoice Date, then createdAt
    const getDateForSorting = (site: WakeUpSiteWithId) => {
      if (site.csvData['Site Created']) {
        return new Date(site.csvData['Site Created']).getTime();
      }
      if (site.csvData['Invoice Date']) {
        return new Date(site.csvData['Invoice Date']).getTime();
      }
      return new Date(site.createdAt).getTime();
    };

    return getDateForSorting(b) - getDateForSorting(a); // Descending order (newest first)
  });

  const stats = {
    total: sites.length,
    awake: sites.filter(site => site.isAwake).length,
    migrated: sites.filter(site => site.migrationStatus === 'completed').length,
    visible: sortedSites.length,
    excluded: excludedCount,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Error loading sites</p>
          <p className="text-sm">{error}</p>
          <Button onClick={fetchSites} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Site Wake-Up Manager</h1>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAwakeSites}
                  onChange={(e) => setShowAwakeSites(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show awake sites
              </label>
              <Button onClick={fetchSites} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Eligible Sites</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.awake}</div>
              <div className="text-sm text-gray-500">Awake Sites</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{stats.migrated}</div>
              <div className="text-sm text-gray-500">Migrated Sites</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{stats.visible}</div>
              <div className="text-sm text-gray-500">Visible Sites</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">{stats.excluded}</div>
              <div className="text-sm text-gray-500">Newer Sites</div>
            </div>
          </div>
          
          {/* Excluded sites message */}
          {excludedMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-blue-800">
                  <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {excludedMessage}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sites Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wake Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Migration Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSites.map((site) => (
                  <tr key={site.siteId} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {site.siteId}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{site.csvData.Address}</div>
                        <div className="text-xs text-gray-400">
                          {site.csvData.City}, {site.csvData.State} {site.csvData['Zip Code']}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{site.csvData['Agent Name']}</div>
                        <div className="text-xs text-gray-400">{site.csvData.Email}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      <div>
                        <div className="font-medium">
                          {site.csvData['Site Created'] 
                            ? new Date(site.csvData['Site Created']).toLocaleDateString()
                            : site.csvData['Invoice Date']
                            ? new Date(site.csvData['Invoice Date']).toLocaleDateString()
                            : new Date(site.createdAt).toLocaleDateString()
                          }
                        </div>
                        <div className="text-xs text-gray-400">
                          {site.csvData['Site Created'] 
                            ? 'Site Created'
                            : site.csvData['Invoice Date']
                            ? 'Invoice Date'
                            : 'Added to System'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={site.isAwake}
                          onChange={() => toggleWakeStatus(site.siteId, site.isAwake)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-xs font-medium text-gray-700">
                          {site.isAwake ? 'Awake' : 'Sleep'}
                        </span>
                      </label>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {getMigrationStatusIcon(site.migrationStatus)}
                        <span className="text-xs text-gray-700">
                          {getMigrationStatusText(site.migrationStatus)}
                        </span>
                      </div>
                      {site.migrationError && (
                        <div className="text-xs text-red-500 mt-1" title={site.migrationError}>
                          Error: {site.migrationError.substring(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <a
                          href={site.wakeUpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 text-xs"
                        >
                          Wake <ExternalLink className="h-3 w-3" />
                        </a>
                        <Button
                          size="sm"
                          onClick={() => migrateSite(site.siteId)}
                          disabled={migrationLoading === site.siteId || site.migrationStatus === 'in_progress'}
                          className="text-xs px-2 py-1 h-6"
                        >
                          {migrationLoading === site.siteId ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          Migrate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No sites found. The CSV will be loaded automatically.</p>
          </div>
        )}
        
        {sites.length > 0 && sortedSites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">All sites are awake. Toggle "Show awake sites" to see them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
