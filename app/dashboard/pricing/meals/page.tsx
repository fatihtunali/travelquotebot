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
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
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
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/meals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
        // Update existing meal
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
        // Create new meal (both 'add' and 'duplicate' modes)
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
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
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
                    <button
                      onClick={() => openEditModal(meal)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDuplicateModal(meal)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(meal)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                    >
                      Archive
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Restaurant' : modalMode === 'duplicate' ? 'Duplicate Restaurant' : 'Add New Restaurant'}
              </h2>
              <button
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
