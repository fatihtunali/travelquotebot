'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Activity {
  id: string;
  name: string;
  city: string;
  category: string;
  duration_hours: number;
  base_price: number;
  currency: string;
  min_participants: number | null;
  max_participants: number | null;
  highlights: string[] | null;
  description: string | null;
  is_active: boolean;
}

interface ActivityPricing {
  id?: string;
  activity_id: string;
  pricing_type: 'sic' | 'private';
  // Fixed costs (divide by pax for private)
  transport_cost: number;
  guide_cost: number;
  // Variable costs (always per person)
  entrance_fee_adult: number;
  entrance_fee_child_0_2: number;
  entrance_fee_child_3_5: number;
  entrance_fee_child_6_11: number;
  entrance_fee_child_12_17: number;
  meal_cost_adult: number;
  meal_cost_child: number;
  // SIC pricing (simple per-person)
  sic_price_adult: number;
  sic_price_child_0_2: number;
  sic_price_child_3_5: number;
  sic_price_child_6_11: number;
  sic_price_child_12_17: number;
  // Private pricing slabs
  min_pax: number;
  max_pax: number | null;
  season: string;
  valid_from: string | null;
  valid_until: string | null;
  currency: string;
  notes: string;
  is_active: boolean;
}

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [pricing, setPricing] = useState<ActivityPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPricing, setShowAddPricing] = useState(false);

  const [newPricing, setNewPricing] = useState<Partial<ActivityPricing>>({
    pricing_type: 'sic',
    transport_cost: 0,
    guide_cost: 0,
    entrance_fee_adult: 0,
    entrance_fee_child_0_2: 0,
    entrance_fee_child_3_5: 0,
    entrance_fee_child_6_11: 0,
    entrance_fee_child_12_17: 0,
    meal_cost_adult: 0,
    meal_cost_child: 0,
    sic_price_adult: 0,
    sic_price_child_0_2: 0,
    sic_price_child_3_5: 0,
    sic_price_child_6_11: 0,
    sic_price_child_12_17: 0,
    min_pax: 1,
    max_pax: null,
    season: 'standard',
    valid_from: null,
    valid_until: null,
    currency: 'USD',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    fetchActivity();
    fetchPricing();
  }, [id]);

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/activities/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivity(data);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/activities/${id}/pricing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    }
  };

  const handleAddPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/activities/${id}/pricing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPricing),
      });

      if (response.ok) {
        setShowAddPricing(false);
        setNewPricing({
          pricing_type: 'sic',
          transport_cost: 0,
          guide_cost: 0,
          entrance_fee_adult: 0,
          entrance_fee_child_0_2: 0,
          entrance_fee_child_3_5: 0,
          entrance_fee_child_6_11: 0,
          entrance_fee_child_12_17: 0,
          meal_cost_adult: 0,
          meal_cost_child: 0,
          sic_price_adult: 0,
          sic_price_child_0_2: 0,
          sic_price_child_3_5: 0,
          sic_price_child_6_11: 0,
          sic_price_child_12_17: 0,
          min_pax: 1,
          max_pax: null,
          season: 'standard',
          valid_from: null,
          valid_until: null,
          currency: 'USD',
          notes: '',
          is_active: true,
        });
        fetchPricing();
      }
    } catch (error) {
      console.error('Failed to add pricing:', error);
    }
  };

  const handleDeletePricing = async (pricingId: string) => {
    if (!confirm('Are you sure you want to delete this pricing option?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/activities/${id}/pricing/${pricingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPricing();
      }
    } catch (error) {
      console.error('Failed to delete pricing:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/dashboard/pricing/activities');
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  // Calculate sample price for private pricing
  const calculatePrivatePrice = (p: ActivityPricing, paxCount: number) => {
    const fixedPerPerson = (p.transport_cost + p.guide_cost) / paxCount;
    const variablePerPerson = p.entrance_fee_adult + p.meal_cost_adult;
    return (fixedPerPerson + variablePerPerson).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-gray-600">Loading activity details...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Activity Not Found</h3>
          <button
            onClick={() => router.push('/dashboard/pricing/activities')}
            className="text-purple-600 hover:text-purple-800"
          >
            ← Back to Activities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing/activities')}
            className="mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-2"
          >
            ← Back to Activities
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{activity.name}</h1>
              <p className="text-gray-600">View and manage activity component-based pricing</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="bubble-button bg-red-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Activity Pricing Section - 2-line operational format */}
        <div className="max-w-6xl mx-auto">
          <div className="bubble-card p-6 bg-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Activity Pricing Options</h3>
                <p className="text-xs text-gray-500">Component-based pricing for SIC and Private tours</p>
              </div>
              <button
                onClick={() => setShowAddPricing(!showAddPricing)}
                className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
              >
                {showAddPricing ? '- Cancel' : '+ Add Pricing'}
              </button>
            </div>

            {/* Add Pricing Form */}
            {showAddPricing && (
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pricing Type</label>
                    <select
                      value={newPricing.pricing_type}
                      onChange={(e) => setNewPricing({ ...newPricing, pricing_type: e.target.value as 'sic' | 'private' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="sic">SIC (Join-in)</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Season</label>
                    <select
                      value={newPricing.season}
                      onChange={(e) => setNewPricing({ ...newPricing, season: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="standard">Standard</option>
                      <option value="high_season">High Season</option>
                      <option value="low_season">Low Season</option>
                      <option value="peak">Peak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Valid From</label>
                    <input
                      type="date"
                      value={newPricing.valid_from || ''}
                      onChange={(e) => setNewPricing({ ...newPricing, valid_from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={newPricing.valid_until || ''}
                      onChange={(e) => setNewPricing({ ...newPricing, valid_until: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {newPricing.pricing_type === 'sic' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">SIC Per-Person Prices</label>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Adult</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPricing.sic_price_adult}
                          onChange={(e) => setNewPricing({ ...newPricing, sic_price_adult: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Child 0-2</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPricing.sic_price_child_0_2}
                          onChange={(e) => setNewPricing({ ...newPricing, sic_price_child_0_2: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Child 3-5</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPricing.sic_price_child_3_5}
                          onChange={(e) => setNewPricing({ ...newPricing, sic_price_child_3_5: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Child 6-11</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPricing.sic_price_child_6_11}
                          onChange={(e) => setNewPricing({ ...newPricing, sic_price_child_6_11: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Child 12-17</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPricing.sic_price_child_12_17}
                          onChange={(e) => setNewPricing({ ...newPricing, sic_price_child_12_17: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Fixed Costs (divided by pax)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">Transport Cost</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPricing.transport_cost}
                            onChange={(e) => setNewPricing({ ...newPricing, transport_cost: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Guide Cost</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPricing.guide_cost}
                            onChange={(e) => setNewPricing({ ...newPricing, guide_cost: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Variable Costs (per person)</label>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">Entrance Adult</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPricing.entrance_fee_adult}
                            onChange={(e) => setNewPricing({ ...newPricing, entrance_fee_adult: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Entrance Child</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPricing.entrance_fee_child_6_11}
                            onChange={(e) => setNewPricing({ ...newPricing, entrance_fee_child_6_11: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Meal Adult</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPricing.meal_cost_adult}
                            onChange={(e) => setNewPricing({ ...newPricing, meal_cost_adult: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Meal Child</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPricing.meal_cost_child}
                            onChange={(e) => setNewPricing({ ...newPricing, meal_cost_child: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Pax Slab</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">Min Pax</label>
                          <input
                            type="number"
                            min="1"
                            value={newPricing.min_pax}
                            onChange={(e) => setNewPricing({ ...newPricing, min_pax: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Max Pax</label>
                          <input
                            type="number"
                            min="1"
                            value={newPricing.max_pax || ''}
                            onChange={(e) => setNewPricing({ ...newPricing, max_pax: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Unlimited"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={newPricing.notes}
                    onChange={(e) => setNewPricing({ ...newPricing, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Optional notes about this pricing"
                  />
                </div>

                <button
                  onClick={handleAddPricing}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Add Pricing Option
                </button>
              </div>
            )}

            {/* Pricing List - 2-line operational format */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {pricing.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs">
                  <p>No pricing options configured</p>
                </div>
              ) : (
                pricing.map((p) => (
                  <div key={p.id} className="py-2 px-3 bg-white border-b border-gray-200 hover:bg-gray-50">
                    {/* Line 1: Activity name - city - type */}
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{activity?.name}</span>
                        <span className="text-gray-600">{activity?.city}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.pricing_type === 'sic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {p.pricing_type.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => p.id && handleDeletePricing(p.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    {/* Line 2: All pricing details */}
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold text-purple-700">{p.season.replace('_', ' ').toUpperCase()}</span>
                      {p.valid_from && p.valid_until && (
                        <span className="text-gray-500 mx-1">
                          ({new Date(p.valid_from).toLocaleDateString()} - {new Date(p.valid_until).toLocaleDateString()})
                        </span>
                      )}
                      {' • '}
                      {p.pricing_type === 'sic' ? (
                        <>
                          <span className="text-green-700 font-bold">${p.sic_price_adult}</span> adult
                          {' • '}
                          Child 0-2: ${p.sic_price_child_0_2} | 3-5: ${p.sic_price_child_3_5} | 6-11: ${p.sic_price_child_6_11} | 12-17: ${p.sic_price_child_12_17}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">Fixed:</span> Transport ${p.transport_cost} + Guide ${p.guide_cost}
                          {' • '}
                          <span className="font-semibold">Variable:</span> Entrance ${p.entrance_fee_adult} + Meal ${p.meal_cost_adult}
                          {' • '}
                          <span className="font-semibold">Pax:</span> {p.min_pax}-{p.max_pax || '∞'}
                          {' • '}
                          <span className="text-green-700 font-bold">Sample (4 pax): ${calculatePrivatePrice(p, 4)}</span>/person
                        </>
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
  );
}
