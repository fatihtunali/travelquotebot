'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TableStats {
  table: string;
  count: number;
  loading: boolean;
}

interface EnrichmentItem {
  id: number;
  name: string;
  city: string;
}

export default function GooglePlacesManagement() {
  const router = useRouter();
  const [stats, setStats] = useState<TableStats[]>([
    { table: 'hotels', count: 0, loading: true },
    { table: 'tours', count: 0, loading: true },
    { table: 'entrance_fees', count: 0, loading: true },
  ]);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [items, setItems] = useState<EnrichmentItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [enriching, setEnriching] = useState<number | null>(null);
  const [enrichingAll, setEnrichingAll] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    for (const stat of stats) {
      try {
        const response = await fetch(
          `/api/enrich-places?table=${stat.table}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats((prev) =>
            prev.map((s) =>
              s.table === stat.table
                ? { ...s, count: data.items_needing_enrichment, loading: false }
                : s
            )
          );
        }
      } catch (error) {
        console.error(`Error fetching stats for ${stat.table}:`, error);
        setStats((prev) =>
          prev.map((s) =>
            s.table === stat.table ? { ...s, loading: false } : s
          )
        );
      }
    }
  };

  const loadItems = async (table: string) => {
    setSelectedTable(table);
    setLoadingItems(true);
    setItems([]);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(
        `/api/enrich-places?table=${table}&getItems=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const enrichItem = async (table: string, id: number) => {
    setEnriching(id);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/enrich-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ table, id }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Success: ${data.message}`);
        // Reload items
        await loadItems(table);
        // Update stats
        await fetchStats();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error enriching item:', error);
      alert('❌ Error enriching item');
    } finally {
      setEnriching(null);
    }
  };

  const enrichAll = async (table: string) => {
    if (
      !confirm(
        `Are you sure you want to enrich all items in ${table}? This may take several minutes and use Google API credits.`
      )
    ) {
      return;
    }

    setEnrichingAll(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Get all items
      const itemsResponse = await fetch(
        `/api/enrich-places?table=${table}&getItems=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!itemsResponse.ok) {
        throw new Error('Failed to get items');
      }

      const itemsData = await itemsResponse.json();
      const itemsToEnrich = itemsData.items || [];

      let successCount = 0;
      let failCount = 0;

      // Enrich each item
      for (const item of itemsToEnrich) {
        try {
          const response = await fetch('/api/enrich-places', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ table, id: item.id }),
          });

          if (response.ok) {
            successCount++;
            console.log(`✓ Enriched: ${item.name}`);
          } else {
            failCount++;
            console.error(`✗ Failed: ${item.name}`);
          }
        } catch (error) {
          failCount++;
          console.error(`✗ Error enriching ${item.name}:`, error);
        }

        // Rate limit: 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      alert(
        `✅ Enrichment complete!\n\nSuccess: ${successCount}\nFailed: ${failCount}`
      );

      // Reload items and stats
      await loadItems(table);
      await fetchStats();
    } catch (error) {
      console.error('Error during batch enrichment:', error);
      alert('❌ Error during batch enrichment');
    } finally {
      setEnrichingAll(false);
    }
  };

  const getTableDisplayName = (table: string) => {
    return table
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ⚠️ API DISABLED WARNING */}
        <div className="mb-8 bg-red-50 border-2 border-red-500 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                Google Places API DISABLED
              </h2>
              <p className="text-red-800 mb-3">
                All Google API calls have been disabled to prevent overcharges.
                The enrichment features on this page will not work until the API is re-enabled.
              </p>
              <p className="text-red-700 text-sm font-semibold">
                ⛔ Do not click "Enrich" or "Enrich All" buttons - they will not make API calls
              </p>
              <p className="text-red-600 text-xs mt-2">
                To re-enable: Set GOOGLE_PLACES_API_KEY in .env.local and restart the server
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🗺️ Google Places Management
          </h1>
          <p className="text-gray-600">
            Enrich your hotels, tours, and attractions with photos and location
            data from Google Places API
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.table}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => !stat.loading && loadItems(stat.table)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {getTableDisplayName(stat.table)}
                </h3>
                {stat.loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <div className="text-3xl font-bold text-blue-600">
                    {stat.count}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Items needing enrichment
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  enrichAll(stat.table);
                }}
                disabled={stat.loading || stat.count === 0 || enrichingAll}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {enrichingAll ? 'Enriching...' : 'Enrich All'}
              </button>
            </div>
          ))}
        </div>

        {/* Items List */}
        {selectedTable && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {getTableDisplayName(selectedTable)} - Items Needing Enrichment
              </h2>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            {loadingItems ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                ✅ All items in this table are already enriched!
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">{item.city}</div>
                    </div>
                    <button
                      onClick={() => enrichItem(selectedTable, item.id)}
                      disabled={enriching === item.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      {enriching === item.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enriching...
                        </div>
                      ) : (
                        'Enrich'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            📖 How to use
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>
                Click on a card to view items that need Google Places data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>
                Enrich individual items by clicking "Enrich" button, or enrich
                all at once with "Enrich All"
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>
                The system will fetch photos, ratings, coordinates, and Google
                Maps URLs for each item
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>
                Note: Google Places API has usage limits. Rate limiting is
                applied automatically.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
