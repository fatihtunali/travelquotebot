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
  price_per_person: number;
  included_services: string[] | null;
  description: string | null;
  is_active: boolean;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/pricing/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
            <div className="text-sm text-gray-600 mb-1">Avg Price/Person</div>
            <div className="text-3xl font-bold text-gray-900">
              ${activities.length > 0
                ? Math.round(
                    activities.reduce((sum, a) => sum + a.price_per_person, 0) /
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bubble-card p-6 bg-white hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {activity.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📍 {activity.city}</span>
                      <span>•</span>
                      <span className="capitalize">{activity.category}</span>
                    </div>
                  </div>
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

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">
                      ⏱️ Duration: {activity.duration_hours} hours
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                  )}
                </div>

                {activity.included_services && activity.included_services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activity.included_services.slice(0, 5).map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {activity.included_services.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{activity.included_services.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${activity.price_per_person}
                      <span className="text-sm text-gray-600 font-normal ml-1">
                        /person
                      </span>
                    </div>
                    {activity.base_price !== activity.price_per_person && (
                      <div className="text-xs text-gray-500 mt-1">
                        Base: ${activity.base_price}
                      </div>
                    )}
                  </div>
                  <button className="text-purple-600 hover:text-purple-800 font-semibold">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
