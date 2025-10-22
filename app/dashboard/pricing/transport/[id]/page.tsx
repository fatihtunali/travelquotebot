'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Transport {
  id: string;
  name: string;
  type: string;
  from_location: string;
  to_location: string;
  base_price: number;
  currency: string;
  vehicle_type: string | null;
  capacity: number | null;
  amenities: string[] | null;
  description: string | null;
  is_active: boolean;
}

interface PriceVariation {
  id?: string;
  season_name: string;
  vehicle_type: string | null;
  max_passengers: number | null;
  start_date: string;
  end_date: string;
  cost_per_day: number | null;
  cost_per_transfer: number | null;
  notes: string;
}

export default function TransportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [transport, setTransport] = useState<Transport | null>(null);
  const [priceVariations, setPriceVariations] = useState<PriceVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'flight',
    from_location: '',
    to_location: '',
    base_price: 0,
    currency: 'USD',
    vehicle_type: '',
    capacity: 0,
    amenities: '',
    description: '',
    is_active: true,
  });

  const [newPrice, setNewPrice] = useState<PriceVariation>({
    season_name: '',
    vehicle_type: null,
    max_passengers: null,
    start_date: '',
    end_date: '',
    cost_per_day: null,
    cost_per_transfer: null,
    notes: '',
  });

  useEffect(() => {
    fetchTransport();
    fetchPriceVariations();
  }, [id]);

  const fetchTransport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/transport/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransport(data);
        setFormData({
          name: data.name,
          type: data.type,
          from_location: data.from_location,
          to_location: data.to_location,
          base_price: data.base_price,
          currency: data.currency || 'USD',
          vehicle_type: data.vehicle_type || '',
          capacity: data.capacity || 0,
          amenities: data.amenities ? data.amenities.join(', ') : '',
          description: data.description || '',
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error('Failed to fetch transport:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceVariations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/transport/${id}/prices`, {
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

      const amenitiesArray = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const response = await fetch(`/api/pricing/transport/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amenities: amenitiesArray,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchTransport();
      }
    } catch (error) {
      console.error('Failed to save transport:', error);
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

      const response = await fetch(`/api/pricing/transport/${id}/prices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrice),
      });

      if (response.ok) {
        setShowAddPrice(false);
        resetPriceForm();
        fetchPriceVariations();
      }
    } catch (error) {
      console.error('Failed to add price variation:', error);
    }
  };

  const resetPriceForm = () => {
    setNewPrice({
      season_name: '',
      vehicle_type: null,
      max_passengers: null,
      start_date: '',
      end_date: '',
      cost_per_day: null,
      cost_per_transfer: null,
      notes: '',
    });
    setEditingPriceId(null);
  };

  const handleEditPrice = (price: PriceVariation) => {
    setNewPrice({
      season_name: price.season_name,
      vehicle_type: price.vehicle_type,
      max_passengers: price.max_passengers,
      start_date: price.start_date,
      end_date: price.end_date,
      cost_per_day: price.cost_per_day,
      cost_per_transfer: price.cost_per_transfer,
      notes: price.notes,
    });
    setEditingPriceId(price.id || null);
    setShowAddPrice(true);
  };

  const handleUpdatePrice = async () => {
    if (!editingPriceId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/transport/${id}/prices/${editingPriceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrice),
      });

      if (response.ok) {
        setShowAddPrice(false);
        resetPriceForm();
        fetchPriceVariations();
      }
    } catch (error) {
      console.error('Failed to update price variation:', error);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Are you sure you want to delete this price variation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/transport/${id}/prices/${priceId}`, {
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
    if (!confirm('Are you sure you want to delete this transport service?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/transport/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/dashboard/pricing/transport');
      }
    } catch (error) {
      console.error('Failed to delete transport:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      flight: '✈️',
      bus: '🚌',
      private_transfer: '🚙',
      car_rental: '🚗',
      train: '🚆',
      ferry: '⛴️',
    };
    return icons[type] || '🚗';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-gray-600">Loading transport details...</div>
      </div>
    );
  }

  if (!transport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Transport Not Found</h3>
          <button
            onClick={() => router.push('/dashboard/pricing/transport')}
            className="text-green-600 hover:text-green-800"
          >
            ← Back to Transport
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing/transport')}
            className="mb-4 text-green-600 hover:text-green-800 flex items-center gap-2"
          >
            ← Back to Transport
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isEditing ? 'Edit Transport' : transport.name}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update transport details' : 'View and manage transport with seasonal pricing'}
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bubble-button bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
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
                      fetchTransport();
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
          {/* Left column - Transport Details */}
          <div className="lg:col-span-2">
            <div className="bubble-card p-8 bg-white mb-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{getTypeIcon(transport.type)}</div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{transport.name}</h2>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="capitalize">{transport.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        transport.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {transport.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-600">Route</label>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          {transport.from_location} → {transport.to_location}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Base Price (Fallback)</label>
                        <div className="text-3xl font-bold text-gray-900 mt-1">
                          ${transport.base_price}
                          <span className="text-sm text-gray-600 font-normal ml-2">{transport.currency}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used when no seasonal pricing matches</p>
                      </div>
                    </div>
                  </div>

                  {(transport.vehicle_type || transport.capacity) && (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-2 gap-6">
                        {transport.vehicle_type && (
                          <div>
                            <label className="text-sm text-gray-600">Vehicle Type</label>
                            <div className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                              {transport.vehicle_type}
                            </div>
                          </div>
                        )}
                        {transport.capacity && (
                          <div>
                            <label className="text-sm text-gray-600">Capacity</label>
                            <div className="text-lg font-semibold text-gray-900 mt-1">
                              Up to {transport.capacity} passengers
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {transport.description && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600">Description</label>
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{transport.description}</p>
                    </div>
                  )}

                  {transport.amenities && transport.amenities.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600 mb-3 block">Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {transport.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                          >
                            {amenity}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="flight">Flight</option>
                        <option value="bus">Bus</option>
                        <option value="private_transfer">Private Transfer</option>
                        <option value="car_rental">Car Rental</option>
                        <option value="train">Train</option>
                        <option value="ferry">Ferry</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Location *
                      </label>
                      <input
                        type="text"
                        value={formData.from_location}
                        onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Location *
                      </label>
                      <input
                        type="text"
                        value={formData.to_location}
                        onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Price (Fallback) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.base_price}
                        onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Used when no seasonal pricing matches</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="TRY">TRY</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type
                      </label>
                      <input
                        type="text"
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Sedan, SUV, Van, Coach"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity (passengers)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe the transport service..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="WiFi, Air Conditioning, Luggage Space, USB Charging"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active (available for booking)
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
                  onClick={() => {
                    if (showAddPrice) {
                      setShowAddPrice(false);
                      resetPriceForm();
                    } else {
                      setShowAddPrice(true);
                    }
                  }}
                  className="text-green-600 hover:text-green-800 text-sm font-semibold"
                >
                  {showAddPrice ? '- Cancel' : (editingPriceId ? '✏️ Edit Price' : '+ Add Price')}
                </button>
              </div>

              {showAddPrice && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Season Name (e.g., Summer 2025)"
                    value={newPrice.season_name}
                    onChange={(e) => setNewPrice({ ...newPrice, season_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Vehicle Type *</label>
                      <input
                        type="text"
                        placeholder="e.g., Vito, Sprinter, 27 Seater"
                        value={newPrice.vehicle_type || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, vehicle_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Max Passengers *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g., 4, 10, 16, 40"
                        value={newPrice.max_passengers || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, max_passengers: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                  </div>
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Cost Per Day</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice.cost_per_day || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, cost_per_day: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Cost Per Transfer</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice.cost_per_transfer || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, cost_per_transfer: e.target.value ? parseFloat(e.target.value) : null })}
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
                    onClick={editingPriceId ? handleUpdatePrice : handleAddPrice}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    {editingPriceId ? 'Update Seasonal Price' : 'Add Seasonal Price'}
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {priceVariations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <p>No seasonal pricing set</p>
                    <p className="mt-2">Base price will be used for all dates</p>
                  </div>
                ) : (
                  priceVariations.map((price) => (
                    <div
                      key={price.id}
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {price.season_name || 'Unnamed Season'}
                          </div>
                          {price.vehicle_type && (
                            <div className="text-xs text-gray-600 mt-1">
                              🚗 {price.vehicle_type} {price.max_passengers && `(max ${price.max_passengers} pax)`}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPrice(price);
                            }}
                            className="text-green-600 hover:text-green-800 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              price.id && handleDeletePrice(price.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>📅 {new Date(price.start_date).toLocaleDateString()} - {new Date(price.end_date).toLocaleDateString()}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {price.cost_per_day && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Per Day</div>
                              <div className="font-bold text-gray-900">${price.cost_per_day}</div>
                            </div>
                          )}
                          {price.cost_per_transfer && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Per Transfer</div>
                              <div className="font-bold text-gray-900">${price.cost_per_transfer}</div>
                            </div>
                          )}
                        </div>
                        {price.notes && (
                          <div className="mt-2 pt-2 border-t border-green-200 text-gray-700">
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
