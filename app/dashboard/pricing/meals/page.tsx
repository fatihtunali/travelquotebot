'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GroupedMeal {
  key: string;
  restaurantName: string;
  city: string;
  mealType: string;
  currency: string;
  seasons: any[];
  minPrice: number;
  maxPrice: number;
}

export default function MealsPricing() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [expandedRestaurants, setExpandedRestaurants] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    restaurantName: '',
    city: '',
    mealType: 'Both',
    seasonName: '',
    startDate: '',
    endDate: '',
    currency: 'EUR',
    adultLunch: 0,
    childLunch: 0,
    adultDinner: 0,
    childDinner: 0,
    menuDescription: '',
    notes: ''
  });

  useEffect(() => {
    fetchMeals();
  }, [selectedCountry, selectedCity]);

  useEffect(() => {
    // Auto-expand all restaurants by default
    if (meals.length > 0) {
      const restaurantKeys = new Set<string>();
      meals.forEach(m => {
        const key = `${m.restaurantName}-${m.city}`;
        restaurantKeys.add(key);
      });
      setExpandedRestaurants(restaurantKeys);
    }
  }, [meals]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCountry !== 'all') params.append('country_id', selectedCountry);
      if (selectedCity !== 'All') params.append('city', selectedCity);

      const response = await fetch(`/api/pricing/meals?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meals data');
      }

      const result = await response.json();
      if (result.data) {
        setMeals(result.data);
        if (result.filters?.countries) setAvailableCountries(result.filters.countries);
        if (result.filters?.cities) setAvailableCities(result.filters.cities);
      } else {
        setMeals(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurant = (restaurantKey: string) => {
    const newExpanded = new Set(expandedRestaurants);
    if (newExpanded.has(restaurantKey)) {
      newExpanded.delete(restaurantKey);
    } else {
      newExpanded.add(restaurantKey);
    }
    setExpandedRestaurants(newExpanded);
  };


  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedMeal(null);
    setFormData({
      restaurantName: '',
      city: '',
      mealType: 'Both',
      seasonName: '',
      startDate: '',
      endDate: '',
      currency: 'EUR',
      adultLunch: 0,
      childLunch: 0,
      adultDinner: 0,
      childDinner: 0,
      menuDescription: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (meal: any) => {
    setModalMode('edit');
    setSelectedMeal(meal);
    setFormData({
      restaurantName: meal.restaurantName,
      city: meal.city,
      mealType: meal.mealType,
      seasonName: meal.seasonName,
      startDate: meal.startDate,
      endDate: meal.endDate,
      currency: meal.currency || 'EUR',
      adultLunch: meal.adultLunch,
      childLunch: meal.childLunch,
      adultDinner: meal.adultDinner,
      childDinner: meal.childDinner,
      menuDescription: meal.menuDescription,
      notes: meal.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (meal: any) => {
    setModalMode('duplicate');
    setSelectedMeal(null);
    setFormData({
      restaurantName: meal.restaurantName,
      city: meal.city,
      mealType: meal.mealType,
      seasonName: meal.seasonName + ' (Copy)',
      startDate: meal.startDate,
      endDate: meal.endDate,
      currency: meal.currency || 'EUR',
      adultLunch: meal.adultLunch,
      childLunch: meal.childLunch,
      adultDinner: meal.adultDinner,
      childDinner: meal.childDinner,
      menuDescription: meal.menuDescription,
      notes: meal.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedMeal) {
        const response = await fetch('/api/pricing/meals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedMeal.id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Restaurant updated successfully!');
          setShowModal(false);
          fetchMeals();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update restaurant'}`);
        }
      } else {
        const response = await fetch('/api/pricing/meals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Restaurant created successfully!');
          setShowModal(false);
          fetchMeals();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create restaurant'}`);
        }
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      alert('An error occurred while saving the restaurant');
    }
  };

  const handleDelete = async (meal: any) => {
    if (!confirm(`Are you sure you want to archive ${meal.restaurantName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/meals?id=${meal.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Restaurant archived successfully!');
        fetchMeals();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive restaurant'}`);
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('An error occurred while archiving the restaurant');
    }
  };

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return '';

    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } else {
        date = new Date(dateInput + 'T00:00:00');
      }
    } else {
      return '';
    }

    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Group meals by restaurant name + city
  const groupedMeals: GroupedMeal[] = [];
  const mealMap = new Map<string, GroupedMeal>();

  meals.forEach(m => {
    const key = `${m.restaurantName}-${m.city}`;
    if (!mealMap.has(key)) {
      mealMap.set(key, {
        key,
        restaurantName: m.restaurantName,
        city: m.city,
        mealType: m.mealType,
        currency: m.currency || 'EUR',
        seasons: [],
        minPrice: Infinity,
        maxPrice: -Infinity
      });
    }

    const group = mealMap.get(key)!;
    if (m.id) {
      group.seasons.push(m);
      const prices = [m.adultLunch, m.adultDinner].filter(p => p > 0);
      prices.forEach(p => {
        group.minPrice = Math.min(group.minPrice, p);
        group.maxPrice = Math.max(group.maxPrice, p);
      });
    }
  });

  mealMap.forEach(value => groupedMeals.push(value));

  // Filter grouped meals
  const filteredMeals = groupedMeals.filter(meal => {
    const cityMatch = selectedCity === 'All' || meal.city === selectedCity;
    const mealTypeMatch = selectedMealType === 'All' || meal.mealType === selectedMealType;
    return cityMatch && mealTypeMatch;
  });

  const cities = ['All', ...availableCities];
  const mealTypes = ['All', 'Lunch', 'Dinner', 'Both'];

  // Calculate stats
  const totalRestaurants = groupedMeals.length;
  const lunchAndDinner = groupedMeals.filter(m => m.mealType === 'Both').length;
  const allLunchPrices = groupedMeals.flatMap(m => m.seasons.map(s => s.adultLunch)).filter(p => p > 0);
  const avgLunch = allLunchPrices.length > 0
    ? (allLunchPrices.reduce((a, b) => a + b, 0) / allLunchPrices.length).toFixed(2)
    : '0.00';
  const allDinnerPrices = groupedMeals.flatMap(m => m.seasons.map(s => s.adultDinner)).filter(p => p > 0);
  const avgDinner = allDinnerPrices.length > 0
    ? (allDinnerPrices.reduce((a, b) => a + b, 0) / allDinnerPrices.length).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-4">Error: {error}</p>
          <button
            type="button"
            onClick={fetchMeals}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <button
                type="button"
                onClick={() => router.push('/dashboard/pricing')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
              >
                ← Back to Pricing
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Meals & Restaurants Pricing</h1>
              <p className="text-sm text-gray-600">Manage lunch and dinner pricing for tour group meals</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button
                type="button"
                onClick={openAddModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                + Add Restaurant Season
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('All');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                <option value="all">All Countries</option>
                {availableCountries.map((country) => (
                  <option key={country.country_id} value={country.country_id}>
                    {country.flag_emoji} {country.country_name}
                  </option>
                ))}
              </select>
            </div>
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
            <p className="text-2xl font-bold text-gray-900">{totalRestaurants}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Lunch & Dinner</p>
            <p className="text-2xl font-bold text-green-600">{lunchAndDinner}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Lunch Price</p>
            <p className="text-2xl font-bold text-blue-600">€{avgLunch}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Dinner Price</p>
            <p className="text-2xl font-bold text-purple-600">€{avgDinner}</p>
          </div>
        </div>

        {/* Grouped Restaurants List */}
        <div className="space-y-4">
          {filteredMeals.map((restaurant) => {
            const isExpanded = expandedRestaurants.has(restaurant.key);
            const priceRangeText = restaurant.minPrice !== Infinity
              ? `${restaurant.currency} ${restaurant.minPrice}${restaurant.minPrice !== restaurant.maxPrice ? ` - ${restaurant.maxPrice}` : ''}`
              : 'No pricing';

            return (
              <div key={restaurant.key} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Restaurant Header - Always Visible, Clickable */}
                <div
                  onClick={() => toggleRestaurant(restaurant.key)}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{isExpanded ? '▼' : '▶'}</div>
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div className="col-span-2">
                        <h3 className="font-bold text-gray-900">{restaurant.restaurantName}</h3>
                        <p className="text-sm text-gray-600">Restaurant</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">📍 {restaurant.city}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                          restaurant.mealType === 'Both'
                            ? 'bg-green-100 text-green-800'
                            : restaurant.mealType === 'Lunch'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {restaurant.mealType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        🗓️ {restaurant.seasons.length} season{restaurant.seasons.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        💶 {priceRangeText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seasons Table - Expandable */}
                {isExpanded && restaurant.seasons.length > 0 && (
                  <div className="border-t">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season / Dates</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lunch Prices</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dinner Prices</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {restaurant.seasons.map((season) => (
                          <tr key={season.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{season.seasonName}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(season.startDate)} to {formatDate(season.endDate)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {season.adultLunch > 0 ? (
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{restaurant.currency} {season.adultLunch}</div>
                                  <div className="text-xs text-gray-500">Adult</div>
                                  <div className="text-sm text-gray-900">{restaurant.currency} {season.childLunch}</div>
                                  <div className="text-xs text-gray-500">Child</div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">-</div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {season.adultDinner > 0 ? (
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{restaurant.currency} {season.adultDinner}</div>
                                  <div className="text-xs text-gray-500">Adult</div>
                                  <div className="text-sm text-gray-900">{restaurant.currency} {season.childDinner}</div>
                                  <div className="text-xs text-gray-500">Child</div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">-</div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs text-gray-600 max-w-xs truncate">
                                {season.menuDescription || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openEditModal(season); }}
                                  className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openDuplicateModal(season); }}
                                  className="text-green-600 hover:text-green-900 font-medium text-xs"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(season); }}
                                  className="text-red-600 hover:text-red-900 font-medium text-xs"
                                >
                                  Archive
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
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
            <li>• <strong>Multiple Seasons:</strong> Each restaurant can have different seasonal pricing. Click restaurant name to expand and view all seasons.</li>
          </ul>
        </div>
      </main>

      {/* Modal - keeping same structure as original */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Restaurant Season' : modalMode === 'duplicate' ? 'Duplicate Restaurant Season' : 'Add New Restaurant Season'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Restaurant Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Type *
                    </label>
                    <select
                      required
                      value={formData.mealType}
                      onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="Both">Both (Lunch & Dinner)</option>
                      <option value="Lunch">Lunch Only</option>
                      <option value="Dinner">Dinner Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="TRY">TRY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Season Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season Name
                    </label>
                    <input
                      type="text"
                      value={formData.seasonName}
                      onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Summer 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Lunch Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lunch Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adult Lunch Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.adultLunch}
                      onChange={(e) => setFormData({ ...formData, adultLunch: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child Lunch Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.childLunch}
                      onChange={(e) => setFormData({ ...formData, childLunch: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Dinner Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dinner Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adult Dinner Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.adultDinner}
                      onChange={(e) => setFormData({ ...formData, adultDinner: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child Dinner Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.childDinner}
                      onChange={(e) => setFormData({ ...formData, childDinner: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Menu Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Description
                </label>
                <textarea
                  value={formData.menuDescription}
                  onChange={(e) => setFormData({ ...formData, menuDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="e.g., 3-course set menu with traditional Turkish cuisine..."
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Additional notes or comments..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'edit' ? 'Update Restaurant' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
