'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkExportPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  const categories = [
    { id: 'accommodations', name: 'Accommodations', icon: '🏨', color: 'blue' },
    { id: 'activities', name: 'Activities', icon: '🎯', color: 'purple' },
    { id: 'transport', name: 'Transportation', icon: '🚌', color: 'green' },
    { id: 'guides', name: 'Guide Services', icon: '👤', color: 'orange' },
    { id: 'restaurants', name: 'Restaurants', icon: '🍽️', color: 'red' },
    { id: 'additional', name: 'Additional Services', icon: '➕', color: 'indigo' },
  ];

  const handleExport = async (categoryId: string) => {
    try {
      setExporting(true);

      const response = await fetch(`/api/pricing/bulk-export/${categoryId}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (response.status === 404) {
        alert(`No data found for ${categoryId}. Please add some data first.`);
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${categoryId}_export.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export data');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Pricing Management
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Export Pricing Data
          </h1>
          <p className="text-gray-600">
            Download your pricing data as Excel files for offline review and editing
          </p>
        </div>

        {/* Instructions */}
        <div className="bubble-card p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            How to Use Export Data
          </h2>
          <ol className="space-y-5 text-gray-800">
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">1</span>
              <div>
                <strong className="text-lg text-green-900">Select Category</strong>
                <p className="text-gray-700 mt-1">Click on a category below to export all your pricing data for that category as an Excel file</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">2</span>
              <div>
                <strong className="text-lg text-green-900">Review & Edit Offline</strong>
                <p className="text-gray-700 mt-1">Open the downloaded file in Excel to review, analyze, or make changes to your pricing data</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">3</span>
              <div>
                <strong className="text-lg text-green-900">Re-import if Needed</strong>
                <p className="text-gray-700 mt-1">After making changes, use the Bulk Import feature to upload your updated data back to the system</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Category Selection */}
        <div className="bubble-card p-6 bg-white mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Category to Export</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const colorClasses = {
                blue: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
                purple: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
                green: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                orange: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
                red: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
                indigo: 'from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
              };

              return (
                <div
                  key={category.id}
                  className="p-5 border-2 rounded-xl transition-all shadow-md hover:shadow-xl border-gray-200 hover:border-gray-400 bg-white"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <span className="font-bold text-gray-900 text-base">{category.name}</span>
                  </div>
                  <button
                    onClick={() => handleExport(category.id)}
                    disabled={exporting}
                    className={`w-full px-4 py-3 bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses]} text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {exporting ? '⏳ Exporting...' : '📤 Export Data'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bubble-card p-6 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why Export Your Data?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">💾</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Backup</h3>
                <p className="text-sm text-gray-600">Keep offline copies of your pricing data for safety and compliance</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔍</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Analysis</h3>
                <p className="text-sm text-gray-600">Use Excel formulas and charts to analyze pricing trends and patterns</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Collaboration</h3>
                <p className="text-sm text-gray-600">Share pricing sheets with team members for review and approval</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">✏️</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Bulk Editing</h3>
                <p className="text-sm text-gray-600">Make mass updates in Excel and re-import for faster data management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
