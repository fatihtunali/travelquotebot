'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Guide {
  id: string;
  name: string;
  guide_type: string;
  languages: string[] | null;
  specialization: string | null;
  price_per_day: number;
  price_per_hour: number | null;
  price_half_day: number | null;
  currency: string;
  max_group_size: number | null;
  cities: string[] | null;
  description: string | null;
  is_active: boolean;
}

interface PriceVariation {
  id?: string;
  season_name: string;
  start_date: string;
  end_date: string;
  price_per_day: number | null;
  price_per_hour: number | null;
  price_half_day: number | null;
  notes: string;
}

export default function GuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [priceVariations, setPriceVariations] = useState<PriceVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    guide_type: 'tour_guide',
    languages: '',
    specialization: '',
    price_per_day: 0,
    price_per_hour: 0,
    price_half_day: 0,
    currency: 'USD',
    max_group_size: 10,
    cities: '',
    description: '',
    is_active: true,
  });

  const [newPrice, setNewPrice] = useState<PriceVariation>({
    season_name: '',
    start_date: '',
    end_date: '',
    price_per_day: null,
    price_per_hour: null,
    price_half_day: null,
    notes: '',
  });

  useEffect(() => {
    fetchGuide();
    fetchPriceVariations();
  }, [id]);

  const fetchGuide = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/guides/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGuide(data);
        setFormData({
          name: data.name,
          guide_type: data.guide_type,
          languages: data.languages ? data.languages.join(', ') : '',
          specialization: data.specialization || '',
          price_per_day: data.price_per_day || 0,
          price_per_hour: data.price_per_hour || 0,
          price_half_day: data.price_half_day || 0,
          currency: data.currency || 'USD',
          max_group_size: data.max_group_size || 10,
          cities: data.cities ? data.cities.join(', ') : '',
          description: data.description || '',
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error('Failed to fetch guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceVariations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/guides/${id}/prices`, {
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

      const languagesArray = formData.languages
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const citiesArray = formData.cities
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const response = await fetch(`/api/pricing/guides/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          languages: languagesArray,
          cities: citiesArray,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchGuide();
      }
    } catch (error) {
      console.error('Failed to save guide:', error);
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

      const response = await fetch(`/api/pricing/guides/${id}/prices`, {
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
          price_per_day: null,
          price_per_hour: null,
          price_half_day: null,
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

      const response = await fetch(`/api/pricing/guides/${id}/prices/${priceId}`, {
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
    if (!confirm('Are you sure you want to delete this guide?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/guides/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/dashboard/pricing/guides');
      }
    } catch (error) {
      console.error('Failed to delete guide:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-gray-600">Loading guide details...</div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Guide Not Found</h3>
          <button
            onClick={() => router.push('/dashboard/pricing/guides')}
            className="text-purple-600 hover:text-purple-800"
          >
            ← Back to Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing/guides')}
            className="mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-2"
          >
            ← Back to Guides
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isEditing ? 'Edit Guide' : guide.name}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update guide details' : 'View and manage guide with seasonal pricing'}
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bubble-button bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
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
                      fetchGuide();
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
          {/* Left column - Guide Details */}
          <div className="lg:col-span-2">
            <div className="bubble-card p-8 bg-white mb-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{guide.name}</h2>
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="capitalize">{guide.guide_type.replace('_', ' ')}</span>
                        {guide.specialization && (
                          <>
                            <span>•</span>
                            <span>{guide.specialization}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        guide.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {guide.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm text-gray-600">Price Per Day (Fallback)</label>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                          ${guide.price_per_day}
                          <span className="text-sm text-gray-600 font-normal ml-2">{guide.currency}</span>
                        </div>
                      </div>
                      {guide.price_per_hour !== null && guide.price_per_hour > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Price Per Hour</label>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            ${guide.price_per_hour}
                            <span className="text-sm text-gray-600 font-normal ml-2">{guide.currency}</span>
                          </div>
                        </div>
                      )}
                      {guide.price_half_day !== null && guide.price_half_day > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Price Half Day</label>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            ${guide.price_half_day}
                            <span className="text-sm text-gray-600 font-normal ml-2">{guide.currency}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Used when no seasonal pricing matches</p>
                  </div>

                  {guide.max_group_size && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600">Max Group Size</label>
                      <div className="text-xl font-bold text-gray-900 mt-1">
                        {guide.max_group_size} people
                      </div>
                    </div>
                  )}

                  {guide.description && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600">Description</label>
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{guide.description}</p>
                    </div>
                  )}

                  {guide.languages && guide.languages.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600 mb-3 block">Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {guide.languages.map((language, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {guide.cities && guide.cities.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <label className="text-sm text-gray-600 mb-3 block">Available in Cities</label>
                      <div className="flex flex-wrap gap-2">
                        {guide.cities.map((city, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium"
                          >
                            {city}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guide Type *
                      </label>
                      <select
                        value={formData.guide_type}
                        onChange={(e) => setFormData({ ...formData, guide_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="tour_guide">Tour Guide</option>
                        <option value="driver_guide">Driver Guide</option>
                        <option value="specialist">Specialist</option>
                        <option value="translator">Translator</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., History, Art, Archaeology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Group Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.max_group_size}
                        onChange={(e) => setFormData({ ...formData, max_group_size: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages (comma-separated) *
                    </label>
                    <input
                      type="text"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="English, Spanish, French"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.cities}
                      onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Istanbul, Ankara, Izmir"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Per Day (Fallback) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price_per_day}
                        onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Per Hour
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price_per_hour}
                        onChange={(e) => setFormData({ ...formData, price_per_hour: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Half Day
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price_half_day}
                        onChange={(e) => setFormData({ ...formData, price_half_day: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe the guide's expertise and experience..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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
                  onClick={() => setShowAddPrice(!showAddPrice)}
                  className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
                >
                  {showAddPrice ? '- Cancel' : '+ Add Price'}
                </button>
              </div>

              {showAddPrice && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg space-y-3">
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
                    <label className="text-xs text-gray-600 block mb-1">Price/Day</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPrice.price_per_day || ''}
                      onChange={(e) => setNewPrice({ ...newPrice, price_per_day: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Price/Hour</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice.price_per_hour || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, price_per_hour: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Price Half Day</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice.price_half_day || ''}
                        onChange={(e) => setNewPrice({ ...newPrice, price_half_day: e.target.value ? parseFloat(e.target.value) : null })}
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
                    className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
                  >
                    Add Seasonal Price
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
                      className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
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
                        {price.price_per_day !== null && price.price_per_day > 0 && (
                          <div className="text-base font-bold text-gray-900">${price.price_per_day}/day</div>
                        )}
                        {price.price_per_hour !== null && price.price_per_hour > 0 && (
                          <div className="text-sm font-semibold text-gray-800">${price.price_per_hour}/hour</div>
                        )}
                        {price.price_half_day !== null && price.price_half_day > 0 && (
                          <div className="text-sm font-semibold text-gray-800">${price.price_half_day}/half day</div>
                        )}
                        {price.notes && (
                          <div className="mt-2 pt-2 border-t border-purple-200 text-gray-700">
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
