'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine_type: string;
  price_range: string;
  breakfast_price: number | null;
  lunch_price: number | null;
  dinner_price: number | null;
  specialties: string[] | null;
  description: string | null;
  is_active: boolean;
}

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/pricing/restaurants', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants =
    filter === 'all'
      ? restaurants
      : restaurants.filter((r) => r.cuisine_type === filter);

  const cuisineTypes = [
    { value: 'all', label: 'All Cuisines', icon: '🍽️' },
    { value: 'local', label: 'Local', icon: '🏠' },
    { value: 'international', label: 'International', icon: '🌍' },
    { value: 'seafood', label: 'Seafood', icon: '🦞' },
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { value: 'fine_dining', label: 'Fine Dining', icon: '⭐' },
  ];

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case 'budget':
        return 'bg-green-100 text-green-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700';
      case 'expensive':
        return 'bg-orange-100 text-orange-700';
      case 'luxury':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-red-600 hover:text-red-800 flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Restaurants
              </h1>
              <p className="text-gray-600">
                Manage dining options and meal pricing
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/pricing/restaurants/new')}
              className="bubble-button bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
            >
              + Add Restaurant
            </button>
          </div>
        </div>

        <div className="mb-6 bubble-card p-4 bg-white">
          <div className="flex flex-wrap gap-2">
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine.value}
                onClick={() => setFilter(cuisine.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === cuisine.value
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cuisine.icon} {cuisine.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bubble-card p-4 bg-gradient-to-br from-red-50 to-rose-50">
            <div className="text-sm text-gray-600 mb-1">Total Restaurants</div>
            <div className="text-3xl font-bold text-gray-900">{restaurants.length}</div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-gray-900">
              {restaurants.filter((r) => r.is_active).length}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-sm text-gray-600 mb-1">Avg Lunch Price</div>
            <div className="text-3xl font-bold text-gray-900">
              ${restaurants.filter((r) => r.lunch_price).length > 0
                ? Math.round(
                    restaurants
                      .filter((r) => r.lunch_price)
                      .reduce((sum, r) => sum + (r.lunch_price || 0), 0) /
                      restaurants.filter((r) => r.lunch_price).length
                  )
                : 0}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="text-sm text-gray-600 mb-1">Cities</div>
            <div className="text-3xl font-bold text-gray-900">
              {new Set(restaurants.map((r) => r.city)).size}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading restaurants...</div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bubble-card p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Restaurants Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Add your first restaurant'
                : `No ${filter.replace('_', ' ')} restaurants available`}
            </p>
          </div>
        ) : (
          <div className="bubble-card bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              <div className="col-span-3">Restaurant Name</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Cuisine Type</div>
              <div className="col-span-1 text-center">Price Range</div>
              <div className="col-span-2 text-center">Meal Prices</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/pricing/restaurants/${restaurant.id}`)}
                >
                  {/* Restaurant Name */}
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">{restaurant.name}</div>
                    {restaurant.description && (
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {restaurant.description}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="col-span-2 flex items-center text-sm text-gray-600">
                    📍 {restaurant.city}
                  </div>

                  {/* Cuisine Type */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full capitalize">
                      {restaurant.cuisine_type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Price Range */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriceRangeColor(restaurant.price_range)}`}>
                      {restaurant.price_range.toUpperCase()}
                    </span>
                  </div>

                  {/* Meal Prices */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="text-xs text-gray-700">
                      {restaurant.breakfast_price && <span>B: ${restaurant.breakfast_price}</span>}
                      {restaurant.breakfast_price && restaurant.lunch_price && <span className="mx-1">•</span>}
                      {restaurant.lunch_price && <span>L: ${restaurant.lunch_price}</span>}
                      {restaurant.lunch_price && restaurant.dinner_price && <span className="mx-1">•</span>}
                      {restaurant.dinner_price && <span>D: ${restaurant.dinner_price}</span>}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        restaurant.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/pricing/restaurants/${restaurant.id}`);
                      }}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
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
