'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Accommodation {
  id: string;
  name: string;
  city: string;
  category: string;
  star_rating: number;
  base_price_per_night: number;
  currency: string;
  amenities: string[] | null;
  description: string | null;
  is_active: boolean;
}

interface RoomRate {
  id?: string;
  accommodation_id: string;
  room_type: string;
  season: string;
  adult_price_double: number;
  single_supplement: number;
  third_person_price: number;
  child_price_0_2: number;
  child_price_3_5: number;
  child_price_6_11: number;
  valid_from: string | null;
  valid_until: string | null;
  min_nights: number;
  max_occupancy: number;
  breakfast_included: boolean;
  half_board_supplement: number;
  full_board_supplement: number;
  currency: string;
  notes: string;
  is_active: boolean;
}

export default function AccommodationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoomRate, setShowAddRoomRate] = useState(false);

  const [newRoomRate, setNewRoomRate] = useState<Partial<RoomRate>>({
    room_type: 'double',
    season: 'standard',
    adult_price_double: 0,
    single_supplement: 0,
    third_person_price: 0,
    child_price_0_2: 0,
    child_price_3_5: 0,
    child_price_6_11: 0,
    valid_from: null,
    valid_until: null,
    min_nights: 1,
    max_occupancy: 2,
    breakfast_included: true,
    half_board_supplement: 0,
    full_board_supplement: 0,
    currency: 'USD',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    fetchAccommodation();
    fetchRoomRates();
  }, [id]);

  const fetchAccommodation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/accommodations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccommodation(data);
      }
    } catch (error) {
      console.error('Failed to fetch accommodation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomRates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/accommodations/${id}/room-rates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoomRates(data);
      }
    } catch (error) {
      console.error('Failed to fetch room rates:', error);
    }
  };

  const handleAddRoomRate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/accommodations/${id}/room-rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoomRate),
      });

      if (response.ok) {
        setShowAddRoomRate(false);
        setNewRoomRate({
          room_type: 'double',
          season: 'standard',
          adult_price_double: 0,
          single_supplement: 0,
          third_person_price: 0,
          child_price_0_2: 0,
          child_price_3_5: 0,
          child_price_6_11: 0,
          valid_from: null,
          valid_until: null,
          min_nights: 1,
          max_occupancy: 2,
          breakfast_included: true,
          half_board_supplement: 0,
          full_board_supplement: 0,
          currency: 'USD',
          notes: '',
          is_active: true,
        });
        fetchRoomRates();
      }
    } catch (error) {
      console.error('Failed to add room rate:', error);
    }
  };

  const handleDeleteRoomRate = async (rateId: string) => {
    if (!confirm('Are you sure you want to delete this room rate?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/accommodations/${id}/room-rates/${rateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchRoomRates();
      }
    } catch (error) {
      console.error('Failed to delete room rate:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this accommodation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/pricing/accommodations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/dashboard/pricing/accommodations');
      }
    } catch (error) {
      console.error('Failed to delete accommodation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-gray-600">Loading accommodation details...</div>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Accommodation Not Found</h3>
          <button
            onClick={() => router.push('/dashboard/pricing/accommodations')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Accommodations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing/accommodations')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Accommodations
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {accommodation.name}
              </h1>
              <p className="text-gray-600">
                View and manage accommodation room rates pricing
              </p>
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

        <div className="max-w-6xl mx-auto">
          <div className="bubble-card p-6 bg-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Room Rates</h3>
                <p className="text-xs text-gray-500">Detailed pricing for different passenger types and room configurations</p>
              </div>
              <button
                onClick={() => setShowAddRoomRate(!showAddRoomRate)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                {showAddRoomRate ? '- Cancel' : '+ Add Room Rate'}
              </button>
            </div>

            {showAddRoomRate && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Room Type *</label>
                    <select
                      value={newRoomRate.room_type}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, room_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="quad">Quad</option>
                      <option value="suite">Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Season *</label>
                    <select
                      value={newRoomRate.season}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, season: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="standard">Standard</option>
                      <option value="high_season">High Season</option>
                      <option value="low_season">Low Season</option>
                      <option value="peak">Peak</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Currency</label>
                    <select
                      value={newRoomRate.currency}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="TRY">TRY</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Adult Price (Double) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRoomRate.adult_price_double}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, adult_price_double: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Per person/night"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Single Supplement</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRoomRate.single_supplement}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, single_supplement: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Extra charge"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">3rd Person Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRoomRate.third_person_price}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, third_person_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Per person/night"
                    />
                  </div>
                </div>

                <div className="border-t border-blue-300 pt-3">
                  <h4 className="text-xs font-bold text-gray-700 mb-2">Child Rates (per child per night)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Age 0-2.99</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newRoomRate.child_price_0_2}
                        onChange={(e) => setNewRoomRate({ ...newRoomRate, child_price_0_2: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Infant price"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Age 3-5.99</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newRoomRate.child_price_3_5}
                        onChange={(e) => setNewRoomRate({ ...newRoomRate, child_price_3_5: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Toddler price"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Age 6-11.99</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newRoomRate.child_price_6_11}
                        onChange={(e) => setNewRoomRate({ ...newRoomRate, child_price_6_11: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Child price"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Valid From</label>
                    <input
                      type="date"
                      value={newRoomRate.valid_from || ''}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, valid_from: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={newRoomRate.valid_until || ''}
                      onChange={(e) => setNewRoomRate({ ...newRoomRate, valid_until: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="breakfast_included"
                    checked={newRoomRate.breakfast_included}
                    onChange={(e) => setNewRoomRate({ ...newRoomRate, breakfast_included: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="breakfast_included" className="text-xs text-gray-700">Breakfast Included</label>
                </div>

                <textarea
                  placeholder="Notes (optional)"
                  value={newRoomRate.notes}
                  onChange={(e) => setNewRoomRate({ ...newRoomRate, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleAddRoomRate}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg"
                >
                  Add Room Rate
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {roomRates.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs">
                  <p>No room rates configured</p>
                </div>
              ) : (
                roomRates.map((rate) => (
                  <div key={rate.id} className="py-2 px-3 bg-white border-b border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{accommodation?.name}</span>
                        <span className="text-yellow-500">{'⭐'.repeat(Math.floor(accommodation?.star_rating || 0))}</span>
                        <span className="text-gray-600">{accommodation?.city}</span>
                      </div>
                      <button
                        onClick={() => rate.id && handleDeleteRoomRate(rate.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold text-blue-700">{rate.season.replace('_', ' ').toUpperCase()}</span>
                      {rate.valid_from && rate.valid_until && (
                        <span className="text-gray-500 mx-1">({new Date(rate.valid_from).toLocaleDateString()} - {new Date(rate.valid_until).toLocaleDateString()})</span>
                      )}
                      {' • '}
                      <span className="font-semibold">{rate.room_type.toUpperCase()}</span>
                      {' • '}
                      <span className="text-green-700 font-bold">${rate.adult_price_double}</span> pp/dbl
                      {' • '}
                      Single supp: ${rate.single_supplement}
                      {' • '}
                      3rd person: ${rate.third_person_price}
                      {' • '}
                      Child 0-2: ${rate.child_price_0_2} | 3-5: ${rate.child_price_3_5} | 6-11: ${rate.child_price_6_11}
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
