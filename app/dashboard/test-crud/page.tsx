'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestCRUDPage() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTests = async () => {
    setTesting(true);
    setResults(null);

    // Import and run the test suite
    try {
      const { runAllCRUDTests } = await import('@/tests/test-crud-operations');
      const testResults = await runAllCRUDTests();
      setResults(testResults);
    } catch (error) {
      console.error('Error running tests:', error);
      alert('Error running tests. Check console for details.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">CRUD Operations Test Suite</h1>
          <p className="text-sm text-gray-600">
            Test all pricing categories: Hotels, Tours, Vehicles, Guides, Entrance Fees, Meals, Extras
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Instructions */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-teal-900 mb-3">📋 What This Test Does</h3>
          <ul className="text-sm text-teal-800 space-y-2">
            <li>✅ <strong>CREATE</strong>: Tests POST endpoint - Creates a test record in each category</li>
            <li>✅ <strong>READ</strong>: Tests GET endpoint - Verifies the created record exists</li>
            <li>✅ <strong>UPDATE</strong>: Tests PUT endpoint - Modifies the test record</li>
            <li>✅ <strong>DELETE</strong>: Tests DELETE endpoint - Archives the test record</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-teal-300">
            <p className="text-sm text-teal-800">
              <strong>⚠️ Note:</strong> This test will create and delete test records in your database.
              All test records are properly cleaned up after testing.
            </p>
          </div>
        </div>

        {/* Run Test Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
          <button
            onClick={runTests}
            disabled={testing}
            className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-colors ${
              testing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {testing ? '🧪 Running Tests...' : '▶️ Run All CRUD Tests'}
          </button>
          {testing && (
            <p className="mt-4 text-sm text-gray-600">
              This may take 10-30 seconds. Check browser console for detailed progress...
            </p>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className={`rounded-lg shadow-lg p-8 ${
              results.failedTests === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {results.failedTests === 0 ? '✅' : '⚠️'}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {results.failedTests === 0 ? 'All Tests Passed!' : 'Some Tests Failed'}
                </h2>
                <p className="text-lg">
                  {results.passedTests} / {results.totalTests} tests passed ({results.passRate}%)
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Tests</div>
                  <div className="text-2xl font-bold">{results.totalTests}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Passed</div>
                  <div className="text-2xl font-bold text-green-600">{results.passedTests}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Failed</div>
                  <div className="text-2xl font-bold text-red-600">{results.failedTests}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="text-2xl font-bold">{(results.totalTime / 1000).toFixed(2)}s</div>
                </div>
              </div>
            </div>

            {/* Results by Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Results by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Hotels', 'Tours', 'Vehicles', 'Guides', 'Entrance Fees', 'Meals', 'Extras'].map((category) => {
                  const categoryResults = results.results.filter((r: any) => r.category === category);
                  const passed = categoryResults.filter((r: any) => r.status === 'PASS').length;
                  const total = categoryResults.length;
                  const allPassed = passed === total;

                  return (
                    <div
                      key={category}
                      className={`p-4 rounded-lg border-2 ${
                        allPassed ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{allPassed ? '✅' : '❌'}</div>
                      <div className="font-semibold text-gray-900">{category}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {passed}/{total} tests passed
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Detailed Results</h3>
              <div className="space-y-2">
                {results.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      result.status === 'PASS' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {result.status === 'PASS' ? '✅' : '❌'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">
                          [{result.category}] {result.operation}
                        </div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{result.duration}ms</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Tests Details */}
            {results.failedTests > 0 && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-900 mb-4">❌ Failed Tests Details</h3>
                <div className="space-y-3">
                  {results.results
                    .filter((r: any) => r.status === 'FAIL')
                    .map((result: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <div className="font-semibold text-red-900 mb-1">
                          [{result.category}] {result.operation}
                        </div>
                        <div className="text-sm text-red-700">{result.message}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h4 className="font-bold text-gray-900 mb-3">💡 Tips:</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Make sure you're logged in and have a valid authentication token</li>
            <li>• The test creates temporary records and cleans them up automatically</li>
            <li>• Check the browser console (F12) for detailed test output and logs</li>
            <li>• If tests fail, check your API endpoints and database connection</li>
            <li>• All tests run sequentially to avoid conflicts</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
