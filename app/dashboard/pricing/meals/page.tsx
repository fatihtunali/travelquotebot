'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Meal {
  id: number;
  restaurantName: string;
  city: string;
  mealType: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  currency?: string;
  adultLunch: number;
  childLunch: number;
  adultDinner: number;
  childDinner: number;
  menuDescription: string;
  notes?: string;
  status?: string;
}

export default function MealsPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/pricing/meals');

      if (!response.ok) {
        throw new Error('Failed to fetch meals data');
      }

      const data = await response.json();
      setMeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const cities = ['All', ...Array.from(new Set(meals.map(m => m.city)))];
  const mealTypes = ['All', 'Lunch', 'Dinner', 'Both'];

  const filteredMeals = meals.filter(meal => {
    const cityMatch = selectedCity === 'All' || meal.city === selectedCity;
    const mealTypeMatch = selectedMealType === 'All' || meal.mealType === selectedMealType;
    return cityMatch && mealTypeMatch;
  });

  const calculateStats = () => {
    const totalRestaurants = filteredMeals.length;
    const lunchAndDinner = filteredMeals.filter(m => m.mealType === 'Both').length;

    const lunchPrices = filteredMeals.filter(m => m.adultLunch > 0).map(m => m.adultLunch);
    const avgLunch = lunchPrices.length > 0
      ? (lunchPrices.reduce((a, b) => a + b, 0) / lunchPrices.length).toFixed(2)
      : '0.00';

    const dinnerPrices = filteredMeals.filter(m => m.adultDinner > 0).map(m => m.adultDinner);
    const avgDinner = dinnerPrices.length > 0
      ? (dinnerPrices.reduce((a, b) => a + b, 0) / dinnerPrices.length).toFixed(2)
      : '0.00';

    return { totalRestaurants, lunchAndDinner, avgLunch, avgDinner };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <button
                onClick={() => router.push('/dashboard/pricing')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
              >
                ← Back to Pricing
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Meals & Restaurants Pricing</h1>
              <p className="text-sm text-gray-600">Manage lunch and dinner pricing for tour group meals</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                + Add Restaurant
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Meal Type</label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {mealTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading meals data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">Error: {error}</p>
            <button
              onClick={fetchMeals}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRestaurants}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Lunch & Dinner</p>
                <p className="text-2xl font-bold text-green-600">{stats.lunchAndDinner}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Avg Lunch Price</p>
                <p className="text-2xl font-bold text-blue-600">€{stats.avgLunch}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Avg Dinner Price</p>
                <p className="text-2xl font-bold text-purple-600">€{stats.avgDinner}</p>
              </div>
            </div>

            {/* Restaurants List */}
            <div className="space-y-4">
              {filteredMeals.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">No restaurants found matching your filters.</p>
                </div>
              ) : (
                filteredMeals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-xl shadow overflow-hidden">
              {/* Restaurant Header */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">🍽️ {meal.restaurantName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        meal.mealType === 'Both'
                          ? 'bg-green-100 text-green-800'
                          : meal.mealType === 'Lunch'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {meal.mealType === 'Both' ? '🍴 Lunch & Dinner' : meal.mealType === 'Lunch' ? '☀️ Lunch Only' : '🌙 Dinner Only'}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        📍 {meal.city}
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600 mb-2">
                      <div>🗓️ <strong>{meal.seasonName}</strong> ({meal.startDate} to {meal.endDate})</div>
                      {meal.currency && <div>💶 <strong>{meal.currency}</strong></div>}
                    </div>
                    <div className="text-sm text-gray-700 italic">
                      📋 {meal.menuDescription}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300">
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>

              {/* Meal Pricing Details */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Lunch Pricing */}
                  {meal.adultLunch > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">☀️ Lunch Pricing</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-600">Adult Lunch</div>
                            <div className="text-sm font-semibold text-gray-500">Per person</div>
                          </div>
                          <div className="text-xl font-bold text-blue-900">{meal.currency || 'EUR'} {meal.adultLunch}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-600">Child Lunch</div>
                            <div className="text-sm font-semibold text-gray-500">Per child (6-12)</div>
                          </div>
                          <div className="text-xl font-bold text-blue-900">{meal.currency || 'EUR'} {meal.childLunch}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dinner Pricing */}
                  {meal.adultDinner > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">🌙 Dinner Pricing</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-600">Adult Dinner</div>
                            <div className="text-sm font-semibold text-gray-500">Per person</div>
                          </div>
                          <div className="text-xl font-bold text-purple-900">{meal.currency || 'EUR'} {meal.adultDinner}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-600">Child Dinner</div>
                            <div className="text-sm font-semibold text-gray-500">Per child (6-12)</div>
                          </div>
                          <div className="text-xl font-bold text-purple-900">{meal.currency || 'EUR'} {meal.childDinner}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* If neither lunch nor dinner, show not available */}
                  {meal.adultLunch === 0 && meal.adultDinner === 0 && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-center py-4">No meal pricing configured</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {meal.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {meal.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
                ))
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-amber-900 mb-2">💡 Meal Pricing Guide:</h4>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• <strong>Lunch:</strong> Typically 12:00-14:00. Set menu or buffet style for tour groups.</li>
            <li>• <strong>Dinner:</strong> Typically 19:00-21:00. May include appetizers, main course, dessert.</li>
            <li>• <strong>Child Pricing:</strong> Usually applies to ages 6-11.99 years. Children under 6 often eat free or minimal charge.</li>
            <li>• <strong>Set Menus:</strong> Most group restaurants offer fixed menu for tour groups (easier coordination).</li>
            <li>• <strong>Special Diets:</strong> Vegetarian/vegan options should be requested in advance (usually no extra charge).</li>
            <li>• <strong>Beverages:</strong> Water usually included. Soft drinks, tea, coffee may be extra.</li>
            <li>• <strong>Seasonal Pricing:</strong> Some premium restaurants increase prices during peak season.</li>
          </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
