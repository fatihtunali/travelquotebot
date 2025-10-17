'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Activity {
  id: string;
  name: string;
  city: string;
  category: string;
  duration_hours: number;
  base_price: number;
  cheapest_price?: number;
  currency: string;
  min_participants: number;
  max_participants: number;
  highlights: string[] | null;
  description: string | null;
  is_active: boolean;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetchWithAuth('/api/pricing/activities');
      if (!response) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities =
    filter === 'all'
      ? activities
      : activities.filter((a) => a.category === filter);

  const categories = [
    { value: 'all', label: 'All Activities', icon: '🎯' },
    { value: 'adventure', label: 'Adventure', icon: '🏔️' },
    { value: 'cultural', label: 'Cultural', icon: '🏛️' },
    { value: 'water', label: 'Water Sports', icon: '🏄' },
    { value: 'nature', label: 'Nature', icon: '🌳' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Activities
              </h1>
              <p className="text-gray-600">
                Manage tours, excursions, and activity options
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/pricing/activities/new')}
              className="bubble-button bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
            >
              + Add Activity
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
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bubble-card p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-sm text-gray-600 mb-1">Total Activities</div>
            <div className="text-3xl font-bold text-gray-900">{activities.length}</div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-gray-900">
              {activities.filter((a) => a.is_active).length}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-sm text-gray-600 mb-1">Avg Starting Price</div>
            <div className="text-3xl font-bold text-gray-900">
              ${activities.length > 0
                ? Math.round(
                    activities.reduce((sum, a) => sum + (a.cheapest_price || a.base_price), 0) /
                      activities.length
                  )
                : 0}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="text-sm text-gray-600 mb-1">Cities</div>
            <div className="text-3xl font-bold text-gray-900">
              {new Set(activities.map((a) => a.city)).size}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading activities...</div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bubble-card p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Activities Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Add your first activity'
                : `No ${filter} activities available`}
            </p>
          </div>
        ) : (
          <div className="bubble-card bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              <div className="col-span-3">Activity Name</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1 text-center">Duration</div>
              <div className="col-span-1 text-center">Pax</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-purple-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/pricing/activities/${activity.id}`)}
                >
                  {/* Activity Name */}
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">{activity.name}</div>
                    {activity.description && (
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {activity.description}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="col-span-2 flex items-center text-sm text-gray-600">
                    📍 {activity.city}
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">
                      {activity.category}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 flex items-center justify-center text-sm text-gray-600">
                    {activity.duration_hours}h
                  </div>

                  {/* Participants */}
                  <div className="col-span-1 flex items-center justify-center text-sm text-gray-600">
                    {activity.min_participants}-{activity.max_participants}
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ${activity.cheapest_price ? Math.round(activity.cheapest_price) : activity.base_price}
                      </div>
                      <div className="text-xs text-gray-500">from {activity.currency}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {activity.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/pricing/activities/${activity.id}`);
                      }}
                      className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
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
