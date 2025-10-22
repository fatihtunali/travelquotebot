'use client';

import Link from 'next/link';

export default function SystemTestsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Tests</h1>
        <p className="text-gray-600 mt-2">Run comprehensive tests to verify system integrity and functionality</p>
      </div>

      {/* Test Bubbles/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Tests Bubble */}
        <Link
          href="/admin/dashboard/tests"
          className="group"
        >
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-green-200 hover:border-green-400 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="text-6xl">🧪</div>
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                45+ Tests
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Database Tests</h3>
            <p className="text-gray-700 mb-4">
              Verify database structure, data integrity, foreign keys, and sample data correctness
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Table & column structure verification
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Foreign key relationships
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Sample pricing data validation
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Data types and constraints
              </div>
            </div>
            <div className="mt-6 text-green-600 font-semibold group-hover:text-green-700 flex items-center">
              Run Database Tests
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>

        {/* CRUD Tests Bubble */}
        <Link
          href="/dashboard/test-crud"
          className="group"
        >
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-orange-200 hover:border-orange-400 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="text-6xl">🔄</div>
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                28 Tests
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">CRUD Operations Tests</h3>
            <p className="text-gray-700 mb-4">
              Test Create, Read, Update, Delete operations across all 7 pricing categories
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">✓</span>
                Hotels, Tours & Vehicles pricing
              </div>
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">✓</span>
                Guides & Entrance fees
              </div>
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">✓</span>
                Meals & Extra expenses
              </div>
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">✓</span>
                Full CRUD cycle for each category
              </div>
            </div>
            <div className="mt-6 text-orange-600 font-semibold group-hover:text-orange-700 flex items-center">
              Run CRUD Tests
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h4 className="text-lg font-bold text-blue-900 mb-2">About System Tests</h4>
            <p className="text-blue-800 text-sm mb-3">
              These automated tests ensure your pricing system is functioning correctly and all data is properly structured.
            </p>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• <strong>Database Tests</strong> verify the foundation - tables, relationships, and data integrity</li>
              <li>• <strong>CRUD Tests</strong> verify all API operations work correctly for creating, updating, and deleting pricing data</li>
              <li>• Both test suites should pass 100% before deploying to production</li>
              <li>• Run these tests after any database schema changes or API updates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-gray-900">73+</div>
          <div className="text-sm text-gray-600">Total System Tests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-gray-900">~30s</div>
          <div className="text-sm text-gray-600">Average Test Duration</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-gray-900">7</div>
          <div className="text-sm text-gray-600">Pricing Categories Tested</div>
        </div>
      </div>
    </div>
  );
}
