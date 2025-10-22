'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MealsPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedMealType, setSelectedMealType] = useState('All');

  // Sample data
  const sampleMeals = [
    {
      id: 1,
      restaurantName: 'Sultanahmet Koftecisi',
      city: 'Istanbul',
      mealType: 'Both',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultLunch: 15,
      childLunch: 10,
      adultDinner: 20,
      childDinner: 12,
      menuDescription: 'Traditional Turkish cuisine - Famous meatballs, mixed grill, salads',
      notes: 'Popular tourist spot in Old City',
      status: 'active'
    },
    {
      id: 2,
      restaurantName: 'Cappadocia Cave Restaurant',
      city: 'Cappadocia',
      mealType: 'Dinner',
      seasonName: 'High Season 2025',
      startDate: '2025-04-01',
      endDate: '2025-10-31',
      currency: 'EUR',
      adultLunch: 0,
      childLunch: 0,
      adultDinner: 28,
      childDinner: 16,
      menuDescription: 'Traditional Anatolian cuisine in authentic cave setting with pottery kebab',
      notes: 'Dinner only. Advance booking required.',
      status: 'active'
    },
    {
      id: 3,
      restaurantName: 'Balik Lokantasi (Fish Restaurant)',
      city: 'Istanbul',
      mealType: 'Both',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultLunch: 18,
      childLunch: 12,
      adultDinner: 25,
      childDinner: 15,
      menuDescription: 'Fresh fish from Bosphorus, meze appetizers, salads',
      notes: 'Located by the waterfront',
      status: 'active'
    },
    {
      id: 4,
      restaurantName: 'Ephesus Terrace Restaurant',
      city: 'Izmir',
      mealType: 'Lunch',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultLunch: 14,
      childLunch: 9,
      adultDinner: 0,
      childDinner: 0,
      menuDescription: 'Mediterranean cuisine, vegetarian options, Turkish specialties',
      notes: 'Lunch only. Near ancient Ephesus site.',
      status: 'active'
    },
    {
      id: 5,
      restaurantName: 'Ottoman Palace Cuisine',
      city: 'Istanbul',
      mealType: 'Dinner',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultLunch: 0,
      childLunch: 0,
      adultDinner: 35,
      childDinner: 20,
      menuDescription: 'Fine dining Ottoman cuisine, live music, Bosphorus view',
      notes: 'Premium restaurant. Dress code applies.',
      status: 'active'
    },
  ];

  const cities = ['All', 'Istanbul', 'Cappadocia', 'Izmir', 'Antalya', 'Ephesus'];
  const mealTypes = ['All', 'Lunch', 'Dinner', 'Both'];

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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Total Restaurants</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Lunch & Dinner</p>
            <p className="text-2xl font-bold text-green-600">2</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Lunch Price</p>
            <p className="text-2xl font-bold text-blue-600">€15.67</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Dinner Price</p>
            <p className="text-2xl font-bold text-purple-600">€25.60</p>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="space-y-4">
          {sampleMeals.map((meal) => (
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
                      <div>💶 <strong>{meal.currency}</strong></div>
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
                          <div className="text-xl font-bold text-blue-900">{meal.currency} {meal.adultLunch}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-600">Child Lunch</div>
                            <div className="text-sm font-semibold text-gray-500">Per child (6-12)</div>
                          </div>
                          <div className="text-xl font-bold text-blue-900">{meal.currency} {meal.childLunch}</div>
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
                          <div className="text-xl font-bold text-purple-900">{meal.currency} {meal.adultDinner}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-600">Child Dinner</div>
                            <div className="text-sm font-semibold text-gray-500">Per child (6-12)</div>
                          </div>
                          <div className="text-xl font-bold text-purple-900">{meal.currency} {meal.childDinner}</div>
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
          ))}
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
      </main>
    </div>
  );
}
