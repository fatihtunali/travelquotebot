'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingManagement() {
  const router = useRouter();

  const pricingCategories = [
    {
      id: 'hotels',
      name: 'Hotels',
      icon: '🏨',
      description: 'Manage hotel pricing by season with meal plans (BB/HB/FB/AI)',
      count: '~1000 hotels',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'tours',
      name: 'Tours (SIC/Private)',
      icon: '🎯',
      description: 'SIC and Private tour pricing with group size slabs (2-4-6-8-10 pax)',
      count: 'Seasonal pricing',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'vehicles',
      name: 'Transportation',
      icon: '🚐',
      description: 'Vehicle pricing: Vito (4 pax), Sprinter (10 pax), Isuzu (18 pax), Coach (46 pax)',
      count: 'Full/Half day rates',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      id: 'guides',
      name: 'Guides',
      icon: '👨‍🏫',
      description: 'Guide pricing by city and language (Full day, Half day, Night)',
      count: 'Multi-language',
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    },
    {
      id: 'entrance-fees',
      name: 'Entrance Fees',
      icon: '🎫',
      description: 'Museum and historical site entrance fees',
      count: 'Adult/Child/Student',
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      id: 'meals',
      name: 'Meals',
      icon: '🍽️',
      description: 'Restaurant meal pricing (Lunch & Dinner)',
      count: 'City-wise restaurants',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      id: 'extras',
      name: 'Extra Expenses',
      icon: '💰',
      description: 'Parking, tips, tolls, and other miscellaneous expenses',
      count: 'Per item/day pricing',
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Pricing Management</h1>
            <p className="text-sm text-gray-600">Manage all your pricing data with seasonal rates</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">7</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl mb-2">🗓️</div>
            <p className="text-sm text-gray-600">Active Seasons</p>
            <p className="text-2xl font-bold text-green-600">4-5</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl mb-2">💶</div>
            <p className="text-sm text-gray-600">Base Currency</p>
            <p className="text-2xl font-bold text-blue-600">EUR</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl mb-2">📥</div>
            <p className="text-sm text-gray-600">Import/Export</p>
            <p className="text-2xl font-bold text-purple-600">Excel</p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📌 Important Notes:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Seasonal Pricing:</strong> You can set 4-5 different seasons per year with different price ranges</li>
            <li>• <strong>Date-Based Selection:</strong> AI will automatically select the appropriate pricing based on travel dates</li>
            <li>• <strong>Price History:</strong> All old prices are kept for historical bookings - never delete, just add new seasons</li>
            <li>• <strong>Multi-Currency:</strong> Enter prices in any currency (EUR/USD/GBP/TRY) - quotes will be shown in EUR</li>
            <li>• <strong>Excel Import/Export:</strong> Bulk upload/download your pricing data using Excel templates</li>
          </ul>
        </div>

        {/* Pricing Categories Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing Categories</h2>
          <p className="text-sm text-gray-600 mb-6">Click on any category to manage pricing data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingCategories.map((category) => (
            <Link
              key={category.id}
              href={`/dashboard/pricing/${category.id}`}
              className={`${category.color} border-2 rounded-xl p-6 transition-all hover:shadow-lg cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{category.icon}</div>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700">
                  {category.count}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>

              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 border border-gray-300">
                  View List
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                  Add New
                </button>
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">
                  Import Excel
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📥</div>
              <h4 className="font-semibold text-gray-900 text-sm">Bulk Import</h4>
              <p className="text-xs text-gray-600 mt-1">Import all pricing data</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📤</div>
              <h4 className="font-semibold text-gray-900 text-sm">Bulk Export</h4>
              <p className="text-xs text-gray-600 mt-1">Export all pricing data</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-semibold text-gray-900 text-sm">Download Templates</h4>
              <p className="text-xs text-gray-600 mt-1">Get Excel templates</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900 text-sm">Pricing Report</h4>
              <p className="text-xs text-gray-600 mt-1">View pricing summary</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
