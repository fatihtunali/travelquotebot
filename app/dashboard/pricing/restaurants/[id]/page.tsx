'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine_type: string;
  address: string;
  price_range: string;
  breakfast_price: number | null;
  lunch_price: number | null;
  dinner_price: number | null;
  currency: string;
  specialties: string[] | null;
  description: string | null;
  is_active: boolean;
}

interface PriceVariation {
  id?: string;
  season_name: string;
  start_date: string;
  end_date: string;
  breakfast_price: number | null;
  lunch_price: number | null;
  dinner_price: number | null;
  notes: string;
}

export default function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [priceVariations, setPriceVariations] = useState<PriceVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    cuisine_type: 'local',
    address: '',
    price_range: 'moderate',
    breakfast_price: 0,
    lunch_price: 0,
    dinner_price: 0,
    currency: 'USD',
    specialties: '',
    description: '',
    is_active: true,
  });

  const [newPrice, setNewPrice] = useState<PriceVariation>({
    season_name: '',
    start_date: '',
    end_date: '',
    breakfast_price: null,
    lunch_price: null,
    dinner_price: null,
    notes: '',
  });

  useEffect(() => {
    fetchRestaurant();
    fetchPriceVariations();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/restaurants/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurant(data);
        setFormData({
          name: data.name,
          city: data.city,
          cuisine_type: data.cuisine_type,
          address: data.address || '',
          price_range: data.price_range,
          breakfast_price: data.breakfast_price || 0,
          lunch_price: data.lunch_price || 0,
          dinner_price: data.dinner_price || 0,
          currency: data.currency || 'USD',
          specialties: data.specialties ? data.specialties.join(', ') : '',
          description: data.description || '',
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceVariations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/restaurants/${id}/prices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPriceVariations(data);
      }
    } catch (error) {
      console.error('Failed to fetch price variations:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const response = await fetch(`/api/pricing/restaurants/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          specialties: specialtiesArray,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchRestaurant();
      }
    } catch (error) {
      console.error('Failed to save restaurant:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/restaurants/${id}/prices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrice),
      });

      if (response.ok) {
        setShowAddPrice(false);
        setNewPrice({
          season_name: '',
          start_date: '',
          end_date: '',
          breakfast_price: null,
          lunch_price: null,
          dinner_price: null,
          notes: '',
        });
        fetchPriceVariations();
      }
    } catch (error) {
      console.error('Failed to add price variation:', error);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Are you sure you want to delete this price variation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/restaurants/${id}/prices/${priceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPriceVariations();
      }
    } catch (error) {
      console.error('Failed to delete price variation:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/dashboard/pricing/restaurants');
      }
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-gray-600">Loading restaurant details...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Restaurant Not Found</h3>
          <button
            onClick={() => router.push('/dashboard/pricing/restaurants')}
            className="text-orange-600 hover:text-orange-800"
          >
            ← Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing/restaurants')}
            className="mb-4 text-orange-600 hover:text-orange-800 flex items-center gap-2"
          >
            ← Back to Restaurants
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isEditing ? 'Edit Restaurant' : restaurant.name}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update restaurant details' : 'View and manage restaurant with seasonal pricing'}
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bubble-button bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bubble-button bg-red-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchRestaurant();
                    }}
                    className="bubble-button bg-gray-300 text-gray-700 px-6 py-3 font-semibold hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bubble-button bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 font-semibold hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Restaurant Details */}
          <div className="lg:col-span-2">
            <div className="bubble-card p-8 bg-white mb-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
                      <div className="flex items-center gap-3 text-gray-600">
                        <span>📍 {restaurant.city}</span>
                        <span>•</span>
                        <span className="capitalize">{restaurant.cuisine_type.replace('_', ' ')}</span>
                      </div>
                      {restaurant.address && (
                        <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        restaurant.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-600">Price Range</label>
                        <div className="mt-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                            restaurant.price_range === 'budget' ? 'bg-green-100 text-green-700' :
                            restaurant.price_range === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            restaurant.price_range === 'expensive' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {restaurant.price_range.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Base Meal Prices (Fallback)</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {restaurant.breakfast_price && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Breakfast</div>
                              <div className="font-bold text-gray-900">${restaurant.breakfast_price}</div>
                            </div>
                          )}
                          {restaurant.lunch_price && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Lunch</div>
                              <div className="font-bold text-gray-900">${restaurant.lunch_price}</div>
                            </div>
                          )}
                          {restaurant.dinner_price && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Dinner</div>
                              <div className="font-bold text-gray-900">${restaurant.dinner_price}</div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used when no seasonal pricing matches</p>
                      </div>
                    </div>
                  </div>

                  {restaurant.description && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600">Description</label>
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{restaurant.description}</p>
                    </div>
                  )}

                  {restaurant.specialties && restaurant.specialties.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600 mb-3 block">Specialties</label>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Street address, city, country"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisine Type *
                      </label>
                      <select
                        value={formData.cuisine_type}
                        onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="local">Local</option>
                        <option value="international">International</option>
                        <option value="seafood">Seafood</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="fine_dining">Fine Dining</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range *
                      </label>
                      <select
                        value={formData.price_range}
                        onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="budget">Budget</option>
                        <option value="moderate">Moderate</option>
                        <option value="expensive">Expensive</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Breakfast Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.breakfast_price || ''}
                        onChange={(e) => setFormData({ ...formData, breakfast_price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lunch Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.lunch_price || ''}
                        onChange={(e) => setFormData({ ...formData, lunch_price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dinner Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.dinner_price || ''}
                        onChange={(e) => setFormData({ ...formData, dinner_price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="TRY">TRY</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Describe the restaurant..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialties (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.specialties}
                      onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Pizza, Pasta, Seafood Platter, Traditional Kebab"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active (available for dining)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Seasonal Pricing */}
          <div className="lg:col-span-1">
            <div className="bubble-card p-6 bg-white sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Seasonal Pricing</h3>
                <button
                  onClick={() => setShowAddPrice(!showAddPrice)}
                  className="text-orange-600 hover:text-orange-800 text-sm font-semibold"
                >
                  {showAddPrice ? '- Cancel' : '+ Add Price'}
                </button>
              </div>

              {showAddPrice && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Season Name (e.g., Summer 2025)"
                    value={newPrice.season_name}
                    onChange={(e) => setNewPrice({ ...newPrice, season_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newPrice.start_date}
                        onChange={(e) => setNewPrice({ ...newPrice, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">End Date</label>
                      <input
                        type="date"
                        value={newPrice.end_date}
                        onChange={(e) => setNewPrice({ ...newPrice, end_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Breakfast</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice.breakfast_price || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, breakfast_price: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Lunch</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice.lunch_price || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, lunch_price: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Dinner</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice.dinner_price || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, dinner_price: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Notes (optional)"
                    value={newPrice.notes}
                    onChange={(e) => setNewPrice({ ...newPrice, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddPrice}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700"
                  >
                    Add Seasonal Price
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {priceVariations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <p>No seasonal pricing set</p>
                    <p className="mt-2">Base prices will be used for all dates</p>
                  </div>
                ) : (
                  priceVariations.map((price) => (
                    <div
                      key={price.id}
                      className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-900 text-sm">
                          {price.season_name || 'Unnamed Season'}
                        </div>
                        <button
                          onClick={() => price.id && handleDeletePrice(price.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>📅 {new Date(price.start_date).toLocaleDateString()} - {new Date(price.end_date).toLocaleDateString()}</div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {price.breakfast_price && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Breakfast</div>
                              <div className="font-bold text-gray-900">${price.breakfast_price}</div>
                            </div>
                          )}
                          {price.lunch_price && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Lunch</div>
                              <div className="font-bold text-gray-900">${price.lunch_price}</div>
                            </div>
                          )}
                          {price.dinner_price && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Dinner</div>
                              <div className="font-bold text-gray-900">${price.dinner_price}</div>
                            </div>
                          )}
                        </div>
                        {price.notes && (
                          <div className="mt-2 pt-2 border-t border-orange-200 text-gray-700">
                            {price.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
