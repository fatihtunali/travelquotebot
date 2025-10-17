'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Accommodation {
  id: string;
  name: string;
  city: string;
  category: string;
  star_rating: number;
  base_price_per_night: number;
  amenities: string[] | null;
  description: string | null;
  is_active: boolean;
}

export default function AccommodationsPage() {
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/pricing/accommodations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccommodations(data);
      }
    } catch (error) {
      console.error('Failed to fetch accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccommodations =
    filter === 'all'
      ? accommodations
      : accommodations.filter((a) => a.category === filter);

  const categories = [
    { value: 'all', label: 'All Types', icon: '🏨' },
    { value: 'hotel', label: 'Hotels', icon: '🏨' },
    { value: 'resort', label: 'Resorts', icon: '🏖️' },
    { value: 'hostel', label: 'Hostels', icon: '🛏️' },
    { value: 'apartment', label: 'Apartments', icon: '🏠' },
    { value: 'villa', label: 'Villas', icon: '🏡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Accommodations
              </h1>
              <p className="text-gray-600">
                Manage hotels, resorts, and lodging options
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/pricing/accommodations/new')}
              className="bubble-button bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
            >
              + Add Accommodation
            </button>
          </div>
        </div>

        <div className="mb-6 bubble-card p-4 bg-white">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === cat.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bubble-card p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-sm text-gray-600 mb-1">Total Properties</div>
            <div className="text-3xl font-bold text-gray-900">{accommodations.length}</div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-gray-900">
              {accommodations.filter((a) => a.is_active).length}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-sm text-gray-600 mb-1">Avg Price/Night</div>
            <div className="text-3xl font-bold text-gray-900">
              ${accommodations.length > 0
                ? Math.round(
                    accommodations.reduce((sum, a) => sum + a.base_price_per_night, 0) /
                      accommodations.length
                  )
                : 0}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="text-sm text-gray-600 mb-1">Cities</div>
            <div className="text-3xl font-bold text-gray-900">
              {new Set(accommodations.map((a) => a.city)).size}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading accommodations...</div>
          </div>
        ) : filteredAccommodations.length === 0 ? (
          <div className="bubble-card p-12 text-center">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Accommodations Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Add your first accommodation'
                : `No ${filter}s available`}
            </p>
          </div>
        ) : (
          <div className="bubble-card bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              <div className="col-span-3">Property Name</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1 text-center">Stars</div>
              <div className="col-span-2">Amenities</div>
              <div className="col-span-1 text-right">Price/Night</div>
              <div className="col-span-1 text-center">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredAccommodations.map((acc) => (
                <div
                  key={acc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/pricing/accommodations/${acc.id}`)}
                >
                  {/* Property Name */}
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">{acc.name}</div>
                    {acc.description && (
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {acc.description}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="col-span-2 flex items-center text-sm text-gray-600">
                    📍 {acc.city}
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                      {acc.category}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.floor(acc.star_rating) }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">⭐</span>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="col-span-2 flex items-center">
                    {acc.amenities && acc.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {acc.amenities.slice(0, 2).map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {acc.amenities.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{acc.amenities.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No amenities</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${acc.base_price_per_night}</div>
                      <div className="text-xs text-gray-500">per night</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        acc.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {acc.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
