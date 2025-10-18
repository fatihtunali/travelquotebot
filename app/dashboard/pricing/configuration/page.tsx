'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PricingConfig {
  id: string;
  operator_id: string;
  single_supplement_type: 'percentage' | 'fixed';
  single_supplement_value: number;
  triple_room_discount_percentage: number;
  three_star_multiplier: number;
  four_star_multiplier: number;
  five_star_multiplier: number;
  default_markup_percentage: number;
  default_tax_percentage: number;
  currency: string;
  childSlabs?: ChildSlab[];
}

interface ChildSlab {
  id?: string;
  min_age: number;
  max_age: number;
  discount_type: 'percentage' | 'fixed' | 'free';
  discount_value: number;
  label: string;
  display_order: number;
  is_active: boolean;
}

export default function PricingConfigurationPage() {
  const router = useRouter();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [childSlabs, setChildSlabs] = useState<ChildSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/pricing/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setChildSlabs(data.childSlabs || []);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Pricing configuration saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddChildSlab = () => {
    const newSlab: ChildSlab = {
      min_age: 0,
      max_age: 2,
      discount_type: 'free',
      discount_value: 0,
      label: 'New Age Group',
      display_order: childSlabs.length + 1,
      is_active: true
    };
    setChildSlabs([...childSlabs, newSlab]);
  };

  const handleSaveChildSlab = async (slab: ChildSlab, index: number) => {
    try {
      const token = localStorage.getItem('token');

      if (slab.id) {
        // Update existing
        const response = await fetch('/api/pricing/config/child-slabs', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(slab)
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Child slab updated!' });
          setTimeout(() => setMessage(null), 2000);
        }
      } else {
        // Create new
        const response = await fetch('/api/pricing/config/child-slabs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(slab)
        });

        if (response.ok) {
          const newSlab = await response.json();
          const updated = [...childSlabs];
          updated[index] = newSlab;
          setChildSlabs(updated);
          setMessage({ type: 'success', text: 'Child slab created!' });
          setTimeout(() => setMessage(null), 2000);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save child slab' });
    }
  };

  const handleDeleteChildSlab = async (slab: ChildSlab, index: number) => {
    if (!slab.id) {
      // Not saved yet, just remove from array
      setChildSlabs(childSlabs.filter((_, i) => i !== index));
      return;
    }

    if (!confirm('Delete this child pricing slab?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/config/child-slabs?id=${slab.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setChildSlabs(childSlabs.filter((_, i) => i !== index));
        setMessage({ type: 'success', text: 'Child slab deleted!' });
        setTimeout(() => setMessage(null), 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete child slab' });
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading pricing configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pricing Configuration
          </h1>
          <p className="text-gray-600">
            Configure your pricing rules for room types, hotel categories, and child discounts
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Room Type Pricing */}
        <div className="bubble-card bg-white p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Type Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Supplement */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Single Supplement
              </label>
              <div className="flex gap-3">
                <select
                  value={config.single_supplement_type}
                  onChange={(e) => setConfig({
                    ...config,
                    single_supplement_type: e.target.value as 'percentage' | 'fixed'
                  })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={config.single_supplement_value}
                  onChange={(e) => setConfig({
                    ...config,
                    single_supplement_value: parseFloat(e.target.value)
                  })}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {config.single_supplement_type === 'percentage'
                  ? `Single travelers pay ${config.single_supplement_value}% more`
                  : `Single travelers pay $${config.single_supplement_value} extra per person`
                }
              </p>
            </div>

            {/* Triple Room Discount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Triple Room Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.triple_room_discount_percentage}
                onChange={(e) => setConfig({
                  ...config,
                  triple_room_discount_percentage: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Triple rooms get {config.triple_room_discount_percentage}% discount
              </p>
            </div>
          </div>
        </div>

        {/* Hotel Category Multipliers */}
        <div className="bubble-card bg-white p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hotel Category Multipliers</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                3-Star Multiplier
              </label>
              <input
                type="number"
                step="0.01"
                value={config.three_star_multiplier}
                onChange={(e) => setConfig({
                  ...config,
                  three_star_multiplier: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.70"
              />
              <p className="text-xs text-gray-500 mt-1">
                {config.three_star_multiplier}× base price ({((config.three_star_multiplier - 1) * 100).toFixed(0)}% {config.three_star_multiplier < 1 ? 'cheaper' : 'more expensive'})
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                4-Star Multiplier (Base)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.four_star_multiplier}
                onChange={(e) => setConfig({
                  ...config,
                  four_star_multiplier: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usually 1.0× (base price)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                5-Star Multiplier
              </label>
              <input
                type="number"
                step="0.01"
                value={config.five_star_multiplier}
                onChange={(e) => setConfig({
                  ...config,
                  five_star_multiplier: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.40"
              />
              <p className="text-xs text-gray-500 mt-1">
                {config.five_star_multiplier}× base price (+{((config.five_star_multiplier - 1) * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Markup & Tax */}
        <div className="bubble-card bg-white p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Markup & Tax</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Markup (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.default_markup_percentage}
                onChange={(e) => setConfig({
                  ...config,
                  default_markup_percentage: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="15.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your profit margin
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax / VAT (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.default_tax_percentage}
                onChange={(e) => setConfig({
                  ...config,
                  default_tax_percentage: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                E.g., 18% for KDV
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={config.currency}
                onChange={(e) => setConfig({
                  ...config,
                  currency: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="TRY">TRY (₺)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Child Pricing Slabs */}
        <div className="bubble-card bg-white p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Child Pricing Slabs</h2>
              <p className="text-sm text-gray-600 mt-1">Define age-based discounts for children</p>
            </div>
            <button
              onClick={handleAddChildSlab}
              className="bubble-button bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 text-sm font-semibold"
            >
              + Add Age Group
            </button>
          </div>

          <div className="space-y-4">
            {childSlabs.map((slab, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Min Age
                    </label>
                    <input
                      type="number"
                      value={slab.min_age}
                      onChange={(e) => {
                        const updated = [...childSlabs];
                        updated[index].min_age = parseInt(e.target.value);
                        setChildSlabs(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Max Age
                    </label>
                    <input
                      type="number"
                      value={slab.max_age}
                      onChange={(e) => {
                        const updated = [...childSlabs];
                        updated[index].max_age = parseInt(e.target.value);
                        setChildSlabs(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={slab.discount_type}
                      onChange={(e) => {
                        const updated = [...childSlabs];
                        updated[index].discount_type = e.target.value as any;
                        setChildSlabs(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="percentage">% Off</option>
                      <option value="fixed">$ Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={slab.discount_value}
                      onChange={(e) => {
                        const updated = [...childSlabs];
                        updated[index].discount_value = parseFloat(e.target.value);
                        setChildSlabs(updated);
                      }}
                      disabled={slab.discount_type === 'free'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={slab.label}
                      onChange={(e) => {
                        const updated = [...childSlabs];
                        updated[index].label = e.target.value;
                        setChildSlabs(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., Infant (0-2 years)"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleSaveChildSlab(slab, index)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDeleteChildSlab(slab, index)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {childSlabs.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No child pricing slabs configured. Click "Add Age Group" to create one.
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="bubble-button bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 font-semibold hover:shadow-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="bubble-button bg-gray-200 text-gray-800 px-8 py-3 font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
