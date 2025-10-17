'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Guide {
  id: string;
  name: string;
  guide_type: string;
  languages: string[] | null;
  specialization: string | null;
  cities: string[] | null;
  price_per_day: number;
  description: string | null;
  is_active: boolean;
}

export default function GuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/pricing/guides', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGuides(data);
      }
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides =
    filter === 'all'
      ? guides
      : guides.filter((g) => g.guide_type === filter);

  const guideTypes = [
    { value: 'all', label: 'All Guides', icon: '👥' },
    { value: 'tour_guide', label: 'Tour Guides', icon: '🧑‍🏫' },
    { value: 'driver_guide', label: 'Driver Guides', icon: '🚗' },
    { value: 'specialist', label: 'Specialists', icon: '🎓' },
    { value: 'translator', label: 'Translators', icon: '🗣️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-orange-600 hover:text-orange-800 flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Guides
              </h1>
              <p className="text-gray-600">
                Manage tour guides, translators, and specialist services
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/pricing/guides/new')}
              className="bubble-button bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
            >
              + Add Guide
            </button>
          </div>
        </div>

        <div className="mb-6 bubble-card p-4 bg-white">
          <div className="flex flex-wrap gap-2">
            {guideTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === type.value
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bubble-card p-4 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="text-sm text-gray-600 mb-1">Total Guides</div>
            <div className="text-3xl font-bold text-gray-900">{guides.length}</div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-gray-900">
              {guides.filter((g) => g.is_active).length}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-sm text-gray-600 mb-1">Avg Price/Day</div>
            <div className="text-3xl font-bold text-gray-900">
              ${guides.length > 0
                ? Math.round(
                    guides.reduce((sum, g) => sum + g.price_per_day, 0) /
                      guides.length
                  )
                : 0}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-sm text-gray-600 mb-1">Languages</div>
            <div className="text-3xl font-bold text-gray-900">
              {new Set(guides.flatMap((g) => g.languages || [])).size}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading guides...</div>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="bubble-card p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Guides Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Add your first guide'
                : `No ${filter.replace('_', ' ')}s available`}
            </p>
          </div>
        ) : (
          <div className="bubble-card bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              <div className="col-span-3">Guide Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Languages</div>
              <div className="col-span-2">Cities</div>
              <div className="col-span-1 text-right">Price/Day</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-orange-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/pricing/guides/${guide.id}`)}
                >
                  {/* Guide Name */}
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">{guide.name}</div>
                    {guide.specialization && (
                      <div className="text-xs text-gray-500 mt-1">{guide.specialization}</div>
                    )}
                  </div>

                  {/* Type */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full capitalize">
                      {guide.guide_type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Languages */}
                  <div className="col-span-2 flex items-center">
                    {guide.languages && guide.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.slice(0, 2).map((lang, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                        {guide.languages.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{guide.languages.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>

                  {/* Cities */}
                  <div className="col-span-2 flex items-center">
                    {guide.cities && guide.cities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {guide.cities.slice(0, 1).map((city, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full"
                          >
                            {city}
                          </span>
                        ))}
                        {guide.cities.length > 1 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{guide.cities.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${guide.price_per_day}</div>
                      <div className="text-xs text-gray-500">per day</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        guide.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {guide.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/pricing/guides/${guide.id}`);
                      }}
                      className="text-orange-600 hover:text-orange-800 font-semibold text-sm"
                    >
                      View →
                    </button>
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
