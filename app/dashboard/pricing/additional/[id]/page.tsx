'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface AdditionalService {
  id: string;
  name: string;
  service_type: string;
  price: number;
  price_type: string;
  currency: string;
  description: string | null;
  mandatory: boolean;
  included_in_packages: string[] | null;
  is_active: boolean;
}

interface PriceVariation {
  id?: string;
  season_name: string;
  start_date: string;
  end_date: string;
  price: number;
  notes: string;
}

export default function AdditionalServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [service, setService] = useState<AdditionalService | null>(null);
  const [priceVariations, setPriceVariations] = useState<PriceVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    service_type: 'insurance',
    price: 0,
    price_type: 'per_person',
    currency: 'USD',
    description: '',
    mandatory: false,
    included_in_packages: '',
    is_active: true,
  });

  const [newPrice, setNewPrice] = useState<PriceVariation>({
    season_name: '',
    start_date: '',
    end_date: '',
    price: 0,
    notes: '',
  });

  useEffect(() => {
    fetchService();
    fetchPriceVariations();
  }, [id]);

  const fetchService = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/additional/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setService(data);
        setFormData({
          name: data.name,
          service_type: data.service_type,
          price: data.price,
          price_type: data.price_type,
          currency: data.currency || 'USD',
          description: data.description || '',
          mandatory: data.mandatory,
          included_in_packages: data.included_in_packages ? data.included_in_packages.join(', ') : '',
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error('Failed to fetch service:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceVariations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/additional/${id}/prices`, {
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

      const packagesArray = formData.included_in_packages
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const response = await fetch(`/api/pricing/additional/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          included_in_packages: packagesArray,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchService();
      }
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetPriceForm = () => {
    setNewPrice({
      season_name: '',
      start_date: '',
      end_date: '',
      price: 0,
      notes: '',
    });
    setEditingPriceId(null);
  };

  const handleEditPrice = (price: PriceVariation) => {
    setNewPrice({
      season_name: price.season_name,
      start_date: price.start_date,
      end_date: price.end_date,
      price: price.price,
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

      const response = await fetch(`/api/pricing/additional/${id}/prices/${editingPriceId}`, {
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

  const handleAddPrice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/additional/${id}/prices`, {
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

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Are you sure you want to delete this price variation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/additional/${id}/prices/${priceId}`, {
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
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/additional/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/dashboard/pricing/additional');
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-gray-600">Loading service details...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Service Not Found</h3>
          <button
            onClick={() => router.push('/dashboard/pricing/additional')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Additional Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing/additional')}
            className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            ← Back to Additional Services
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isEditing ? 'Edit Service' : service.name}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update service details' : 'View and manage service with seasonal pricing'}
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bubble-button bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
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
                      fetchService();
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
          {/* Left column - Service Details */}
          <div className="lg:col-span-2">
            <div className="bubble-card p-8 bg-white mb-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h2>
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="capitalize">{service.service_type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span className="capitalize">{service.price_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {service.mandatory && (
                        <div className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-2 border-red-200">
                          MANDATORY
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          service.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-600">Service Type</label>
                        <div className="text-xl font-bold text-gray-900 mt-1 capitalize">
                          {service.service_type.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Base Price (Fallback)</label>
                        <div className="text-3xl font-bold text-gray-900 mt-1">
                          ${service.price}
                          <span className="text-sm text-gray-600 font-normal ml-2">
                            {service.currency}/{service.price_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used when no seasonal pricing matches</p>
                      </div>
                    </div>
                  </div>

                  {service.description && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600">Description</label>
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{service.description}</p>
                    </div>
                  )}

                  {service.included_in_packages && service.included_in_packages.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600 mb-3 block">Included in Packages</label>
                      <div className="flex flex-wrap gap-2">
                        {service.included_in_packages.map((pkg, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                          >
                            {pkg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-600">Mandatory Service</label>
                        <div className="mt-2">
                          {service.mandatory ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                              Yes - Required for all bookings
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                              No - Optional add-on
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type *
                      </label>
                      <select
                        value={formData.service_type}
                        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="insurance">Insurance</option>
                        <option value="visa">Visa</option>
                        <option value="equipment">Equipment</option>
                        <option value="upgrade">Upgrade</option>
                        <option value="transfer">Transfer</option>
                        <option value="other">Other</option>
                      </select>
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
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Used when no seasonal pricing matches</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Type *
                      </label>
                      <select
                        value={formData.price_type}
                        onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="per_person">Per Person</option>
                        <option value="per_group">Per Group</option>
                        <option value="per_day">Per Day</option>
                        <option value="one_time">One Time</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="TRY">TRY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe the service..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Included in Packages (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.included_in_packages}
                      onChange={(e) => setFormData({ ...formData, included_in_packages: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Premium, Deluxe, All-Inclusive"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="mandatory"
                      checked={formData.mandatory}
                      onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="mandatory" className="text-sm font-medium text-gray-700">
                      Mandatory (required for all bookings)
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                >
                  {showAddPrice ? '- Cancel' : editingPriceId ? '- Cancel Edit' : '+ Add Price'}
                </button>
              </div>

              {showAddPrice && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg space-y-3">
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
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPrice.price}
                      onChange={(e) => setNewPrice({ ...newPrice, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
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
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
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
                      className={`p-4 rounded-lg border-2 ${
                        service.mandatory
                          ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                          : 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-900 text-sm">
                          {price.season_name || 'Unnamed Season'}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPrice(price)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => price.id && handleDeletePrice(price.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>📅 {new Date(price.start_date).toLocaleDateString()} - {new Date(price.end_date).toLocaleDateString()}</div>
                        <div className="text-lg font-bold text-gray-900">${price.price}</div>
                        {price.notes && (
                          <div className={`mt-2 pt-2 border-t text-gray-700 ${
                            service.mandatory ? 'border-red-200' : 'border-indigo-200'
                          }`}>
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
