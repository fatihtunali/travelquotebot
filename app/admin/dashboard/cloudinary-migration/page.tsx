'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CloudinaryMigration() {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const response = await fetch('/api/migrate-cloudinary', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    if (!confirm('This will migrate Google Places photos to Cloudinary. Continue?')) {
      return;
    }

    setMigrating(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/migrate-cloudinary', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        await fetchStatus(); // Refresh status
        alert(`✅ Migration complete!\n\nSuccess: ${data.successCount}\nFailed: ${data.failCount}`);
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('❌ Error during migration');
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📸 Cloudinary Migration
        </h1>
        <p className="text-gray-600 mb-8">
          Migrate Google Places photos to Cloudinary for faster loading
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {status && Object.entries(status).map(([table, data]: [string, any]) => (
            <div key={table} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                {table.replace('_', ' ')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Google Photos:</span>
                  <span className="font-bold text-red-600">{data.googlePhotos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cloudinary Photos:</span>
                  <span className="font-bold text-green-600">{data.cloudinaryPhotos}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Migration Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Run Migration</h2>
          <p className="text-gray-600 mb-4">
            This will migrate up to 10 items at a time from each table. Run multiple times to migrate all photos.
          </p>
          <button
            onClick={runMigration}
            disabled={migrating}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg"
          >
            {migrating ? '⏳ Migrating...' : '🚀 Run Migration (10 items)'}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Migration Results</h2>
            <div className="mb-4">
              <div className="flex gap-4 text-lg">
                <span className="text-green-600 font-bold">✅ Success: {results.successCount}</span>
                <span className="text-red-600 font-bold">❌ Failed: {results.failCount}</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.results.map((result: any, idx: number) => (
                    <tr key={idx} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{result.table}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{result.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">Photo {result.photoNum}</td>
                      <td className="px-4 py-2 text-sm">
                        {result.success ? (
                          <span className="text-green-600 font-medium">✅ Success</span>
                        ) : (
                          <span className="text-red-600 font-medium">❌ {result.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            📖 How it works
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Fetches photos from Google Places URLs</li>
            <li>• Uploads them to your Cloudinary account</li>
            <li>• Replaces Google URLs with Cloudinary URLs in database</li>
            <li>• Processes 10 items per run to avoid timeouts</li>
            <li>• Photos are optimized and served faster from Cloudinary CDN</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
