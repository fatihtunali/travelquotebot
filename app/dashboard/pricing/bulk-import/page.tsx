'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkImportPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const fetchWithAuth = async (
    input: RequestInfo,
    init: RequestInit = {}
  ): Promise<Response | null> => {
    const response = await fetch(input, {
      ...init,
      credentials: 'include',
    });

    if (response.status === 401) {
      router.push('/auth/login');
      return null;
    }

    return response;
  };

  const categories = [
    { id: 'accommodations', name: 'Accommodations', icon: '🏨', color: 'blue' },
    { id: 'activities', name: 'Activities', icon: '🎯', color: 'purple' },
    { id: 'transport', name: 'Transportation', icon: '🚌', color: 'green' },
    { id: 'guides', name: 'Guide Services', icon: '👤', color: 'orange' },
    { id: 'restaurants', name: 'Restaurants', icon: '🍽️', color: 'red' },
    { id: 'additional', name: 'Additional Services', icon: '➕', color: 'indigo' },
  ];

  const handleDownloadTemplate = async (categoryId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/pricing/bulk-import/template/${categoryId}`
      );
      if (!response) {
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${categoryId}_template.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download template');
      }
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCategory) {
      alert('Please select a category and file');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetchWithAuth(
        `/api/pricing/bulk-import/upload/${selectedCategory}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response) {
        return;
      }

      const result = await response.json();
      setUploadResult(result);

      if (response.ok) {
        alert(`Successfully imported ${result.imported} items!`);
      } else {
        alert(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
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
            Bulk Import Services
          </h1>
          <p className="text-gray-600">
            Download Excel templates, fill them with your data, and upload to import in bulk
          </p>
        </div>

        {/* Instructions */}
        <div className="bubble-card p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            How to Use Bulk Import
          </h2>
          <ol className="space-y-5 text-gray-800">
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">1</span>
              <div>
                <strong className="text-lg text-blue-900">Download Template</strong>
                <p className="text-gray-700 mt-1">Click on a category below to download the Excel template with pre-formatted columns and example data</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">2</span>
              <div>
                <strong className="text-lg text-blue-900">Fill Your Data</strong>
                <p className="text-gray-700 mt-1">Open the template in Excel, delete example rows, and add your own services with pricing details</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">3</span>
              <div>
                <strong className="text-lg text-blue-900">Upload File</strong>
                <p className="text-gray-700 mt-1">Save your Excel file and upload it back here - all items will be imported automatically</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Category Selection */}
        <div className="bubble-card p-6 bg-white mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Download Template</h2>
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
                  className={`p-5 border-2 rounded-xl transition-all shadow-md hover:shadow-xl ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50 shadow-blue-200'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <span className="font-bold text-gray-900 text-base">{category.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      handleDownloadTemplate(category.id);
                    }}
                    className={`w-full px-4 py-3 bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses]} text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105`}
                  >
                    📥 Download Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bubble-card p-6 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Upload Completed File</h2>

          {!selectedCategory ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-7xl mb-4">📥</div>
              <p className="text-lg">Please download a template first to select the category</p>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
                <p className="text-sm text-gray-700">
                  <strong className="text-blue-900">Selected Category:</strong>{' '}
                  <span className="text-2xl ml-2">{categories.find(c => c.id === selectedCategory)?.icon}</span>{' '}
                  <span className="font-semibold text-gray-900">{categories.find(c => c.id === selectedCategory)?.name}</span>
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all shadow-inner">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-block"
                >
                  <div className="text-7xl mb-4 transform hover:scale-110 transition-transform">📤</div>
                  <div className="text-xl font-bold text-gray-900 mb-2">
                    {uploading ? 'Uploading...' : 'Click to Upload Excel File'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Supports .xlsx and .xls formats
                  </div>
                </label>
              </div>

              {uploadResult && (
                <div className={`mt-6 p-6 rounded-xl shadow-md ${
                  uploadResult.success ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${uploadResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {uploadResult.success ? '✅ Import Successful!' : '❌ Import Failed'}
                  </h3>
                  <div className="space-y-2">
                    {uploadResult.imported && (
                      <p className="text-base text-gray-800 font-semibold">
                        ✓ Imported: <span className="text-green-700">{uploadResult.imported} items</span>
                      </p>
                    )}
                    {uploadResult.skipped && uploadResult.skipped > 0 && (
                      <p className="text-base text-gray-800 font-semibold">
                        ⚠ Skipped: <span className="text-orange-700">{uploadResult.skipped} items</span>
                      </p>
                    )}
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div className="mt-4 p-4 bg-white/50 rounded-lg border border-red-300">
                        <p className="font-bold text-red-900 mb-2">Errors:</p>
                        <ul className="list-disc list-inside text-red-700 space-y-1">
                          {uploadResult.errors.map((error: string, index: number) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
