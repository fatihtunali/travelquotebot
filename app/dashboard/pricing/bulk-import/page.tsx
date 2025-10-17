'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkImportPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

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
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/bulk-import/template/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/pricing/bulk-import/upload/${selectedCategory}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

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
        <div className="bubble-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 How to Use Bulk Import</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span><strong>Download Template:</strong> Click on a category below to download the Excel template with pre-formatted columns and example data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span><strong>Fill Your Data:</strong> Open the template in Excel, delete example rows, and add your own services with pricing details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span><strong>Upload File:</strong> Save your Excel file and upload it back here - all items will be imported automatically</span>
            </li>
          </ol>
        </div>

        {/* Category Selection */}
        <div className="bubble-card p-6 bg-white mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Download Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <span className="font-semibold text-gray-900">{category.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(category.id);
                    handleDownloadTemplate(category.id);
                  }}
                  className={`w-full px-4 py-2 bg-gradient-to-r from-${category.color}-600 to-${category.color}-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all`}
                >
                  📥 Download Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bubble-card p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Upload Completed File</h2>

          {!selectedCategory ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📥</div>
              <p>Please download a template first to select the category</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Selected Category:</strong>{' '}
                  {categories.find(c => c.id === selectedCategory)?.icon}{' '}
                  {categories.find(c => c.id === selectedCategory)?.name}
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                  <div className="text-6xl mb-4">📤</div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {uploading ? 'Uploading...' : 'Click to Upload Excel File'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Supports .xlsx and .xls formats
                  </div>
                </label>
              </div>

              {uploadResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`font-bold mb-2 ${uploadResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {uploadResult.success ? '✅ Import Successful!' : '❌ Import Failed'}
                  </h3>
                  <div className="text-sm space-y-1">
                    {uploadResult.imported && (
                      <p className="text-gray-700">Imported: {uploadResult.imported} items</p>
                    )}
                    {uploadResult.skipped && uploadResult.skipped > 0 && (
                      <p className="text-gray-700">Skipped: {uploadResult.skipped} items</p>
                    )}
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold text-red-900">Errors:</p>
                        <ul className="list-disc list-inside text-red-700">
                          {uploadResult.errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
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
