'use client';

import { useState } from 'react';

export default function SystemTests() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTests = async () => {
    setRunning(true);
    setResults(null);

    try {
      const response = await fetch('/api/admin/run-tests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setResults({ error: 'Failed to run tests' });
      }
    } catch (error) {
      setResults({ error: 'Error running tests: ' + (error as Error).message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Tests</h1>
        <p className="text-gray-600 mt-2">Run comprehensive tests to verify pricing system integrity</p>
      </div>

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl mb-2">🏗️</div>
          <h3 className="font-semibold text-gray-900">Database Structure</h3>
          <p className="text-xs text-gray-600 mt-1">Verify all tables and columns exist</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-semibold text-gray-900">Data Integrity</h3>
          <p className="text-xs text-gray-600 mt-1">Check foreign keys and relationships</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900">Sample Data</h3>
          <p className="text-xs text-gray-600 mt-1">Verify mock data inserted correctly</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl mb-2">🔢</div>
          <h3 className="font-semibold text-gray-900">Data Types</h3>
          <p className="text-xs text-gray-600 mt-1">Validate field types and constraints</p>
        </div>
      </div>

      {/* Run Test Button */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pricing System Verification</h2>
            <p className="text-sm text-gray-600 mt-1">
              This will run 45+ tests to verify database structure, data integrity, and pricing accuracy
            </p>
          </div>
          <button
            onClick={runTests}
            disabled={running}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              running
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {running ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running Tests...
              </span>
            ) : (
              '▶️ Run All Tests'
            )}
          </button>
        </div>
      </div>

      {/* Test Results */}
      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          {results.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-bold mb-2">❌ Test Error</h3>
              <p className="text-red-700">{results.error}</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Summary</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className={`rounded-lg p-4 ${results.summary?.passRate === 100 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="text-sm text-gray-600">Total Tests</div>
                    <div className="text-3xl font-bold text-gray-900">{results.summary?.total || 0}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Passed</div>
                    <div className="text-3xl font-bold text-green-600">{results.summary?.passed || 0}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Failed</div>
                    <div className="text-3xl font-bold text-red-600">{results.summary?.failed || 0}</div>
                  </div>
                  <div className={`rounded-lg p-4 ${results.summary?.passRate === 100 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="text-sm text-gray-600">Pass Rate</div>
                    <div className={`text-3xl font-bold ${results.summary?.passRate === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {results.summary?.passRate || 0}%
                    </div>
                  </div>
                </div>

                {results.summary?.passRate === 100 && (
                  <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">✅</span>
                      <div>
                        <h3 className="text-green-800 font-bold">ALL TESTS PASSED!</h3>
                        <p className="text-green-700 text-sm">Your pricing system is ready to use.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Results */}
              {results.results && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Results</h3>

                  {Object.entries(
                    results.results.reduce((acc: any, r: any) => {
                      if (!acc[r.category]) acc[r.category] = [];
                      acc[r.category].push(r);
                      return acc;
                    }, {})
                  ).map(([category, tests]: [string, any]) => (
                    <div key={category} className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">{category}</h4>
                      <div className="space-y-2">
                        {tests.map((test: any, index: number) => (
                          <div
                            key={index}
                            className={`flex items-start p-3 rounded-lg ${
                              test.status === 'PASS' ? 'bg-green-50' : 'bg-red-50'
                            }`}
                          >
                            <span className="text-xl mr-3">{test.status === 'PASS' ? '✅' : '❌'}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{test.test}</div>
                              {test.details && (
                                <div className="text-sm text-gray-600 mt-1">{test.details}</div>
                              )}
                              {test.status === 'FAIL' && test.expected !== undefined && (
                                <div className="text-sm mt-2">
                                  <div className="text-red-700">Expected: {JSON.stringify(test.expected)}</div>
                                  <div className="text-red-700">Actual: {JSON.stringify(test.actual)}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Information */}
      {!results && !running && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-900 font-bold mb-2">ℹ️ What gets tested?</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>✓ Database tables and columns structure</li>
            <li>✓ Foreign key relationships and data integrity</li>
            <li>✓ Sample pricing data (hotels, tours, vehicles, guides, etc.)</li>
            <li>✓ Price values, currencies, and date formats</li>
            <li>✓ ENUM constraints and data types</li>
            <li>✓ Organization data isolation (multi-tenancy)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
