'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PricingStats {
  accommodations: number;
  activities: number;
  transport: number;
  guides: number;
  restaurants: number;
  additionalServices: number;
  total: number;
}

export default function PricingPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PricingStats>({
    accommodations: 0,
    activities: 0,
    transport: 0,
    guides: 0,
    restaurants: 0,
    additionalServices: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pricing/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'accommodations',
      title: 'Accommodations',
      icon: '🏨',
      description: 'Hotels, resorts, and lodging options',
      count: stats.accommodations,
      color: 'from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-400',
      route: '/dashboard/pricing/accommodations',
    },
    {
      id: 'activities',
      title: 'Activities',
      icon: '🎯',
      description: 'Tours, experiences, and attractions',
      count: stats.activities,
      color: 'from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400',
      route: '/dashboard/pricing/activities',
    },
    {
      id: 'transport',
      title: 'Transportation',
      icon: '🚌',
      description: 'Flights, transfers, and vehicle rentals',
      count: stats.transport,
      color: 'from-green-50 to-emerald-50 border-green-200 hover:border-green-400',
      route: '/dashboard/pricing/transport',
    },
    {
      id: 'guides',
      title: 'Guide Services',
      icon: '👤',
      description: 'Tour guides and specialists',
      count: stats.guides,
      color: 'from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400',
      route: '/dashboard/pricing/guides',
    },
    {
      id: 'restaurants',
      title: 'Restaurants',
      icon: '🍽️',
      description: 'Meal options and dining partners',
      count: stats.restaurants,
      color: 'from-red-50 to-rose-50 border-red-200 hover:border-red-400',
      route: '/dashboard/pricing/restaurants',
    },
    {
      id: 'additional',
      title: 'Additional Services',
      icon: '➕',
      description: 'Insurance, visas, and extras',
      count: stats.additionalServices,
      color: 'from-indigo-50 to-violet-50 border-indigo-200 hover:border-indigo-400',
      route: '/dashboard/pricing/additional',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pricing Management
          </h1>
          <p className="text-gray-600">
            Manage your service pricing and inventory across all categories
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bubble-card bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Total Services</h2>
              <p className="text-blue-100">Available in your pricing database</p>
            </div>
            <div className="text-5xl font-bold">
              {loading ? '...' : stats.total}
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => router.push(category.route)}
              className={`bubble-card p-6 bg-gradient-to-br ${category.color} border-2 text-left group transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <div className="text-3xl font-bold text-gray-700">
                  {loading ? '...' : category.count}
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bubble-card p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
              <div className="text-2xl mb-2">📥</div>
              <div className="font-semibold text-gray-900">Bulk Import</div>
              <div className="text-sm text-gray-600">Import services via CSV</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-gray-900">Export Data</div>
              <div className="text-sm text-gray-600">Download pricing as CSV</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-900">Pricing Reports</div>
              <div className="text-sm text-gray-600">View analytics</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
