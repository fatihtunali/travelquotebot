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

interface PricingPeriod {
  id?: number;
  season_name: string | null;
  start_date: string | null;
  end_date: string | null;
  pp_dbl_rate: number;
  single_supplement: number | null;
  child_0to2: number | null;
  child_3to5: number | null;
  child_6to11: number | null;
  created_at?: string;
  updated_at?: string;
}

export default function AccommodationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [pricingPeriods, setPricingPeriods] = useState<PricingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPricing, setShowAddPricing] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);

  const [newPricing, setNewPricing] = useState<Partial<PricingPeriod>>({
    season_name: '',
    start_date: null,
    end_date: null,
    pp_dbl_rate: 0,
    single_supplement: null,
    child_0to2: null,
    child_3to5: null,
    child_6to11: null,
  });

  useEffect(() => {
    fetchAccommodation();
    fetchPricing();
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

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/accommodations/${id}/prices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPricingPeriods(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    }
  };

  const resetForm = () => {
    setNewPricing({
      season_name: '',
      start_date: null,
      end_date: null,
      pp_dbl_rate: 0,
      single_supplement: null,
      child_0to2: null,
      child_3to5: null,
      child_6to11: null,
    });
    setEditingPriceId(null);
  };

  const handleAddPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = editingPriceId
        ? `/api/pricing/accommodations/${id}/prices/${editingPriceId}`
        : `/api/pricing/accommodations/${id}/prices`;

      const method = editingPriceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPricing),
      });

      if (response.ok) {
        await fetchPricing();
        resetForm();
        setShowAddPricing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save pricing');
      }
    } catch (error) {
      console.error('Failed to save pricing:', error);
      alert('Failed to save pricing');
    }
  };

  const handleEdit = (pricing: PricingPeriod) => {
    setNewPricing(pricing);
    setEditingPriceId(pricing.id || null);
    setShowAddPricing(true);
  };

  const handleDelete = async (priceId: number) => {
    if (!confirm('Are you sure you want to delete this pricing period?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/pricing/accommodations/${id}/prices/${priceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchPricing();
      }
    } catch (error) {
      console.error('Failed to delete pricing:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!accommodation) {
    return <div className="p-6">Accommodation not found</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-2">{accommodation.name}</h1>
        <p className="text-gray-600">
          {accommodation.city} • {accommodation.category} • {accommodation.star_rating} Star
        </p>
        <p className="text-gray-600">
          Base Price: {accommodation.currency} {accommodation.base_price_per_night}/night
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Seasonal Pricing</h2>
          <button
            onClick={() => setShowAddPricing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Pricing Period
          </button>
        </div>

        {showAddPricing && (
          <div className="mb-6 p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">
              {editingPriceId ? 'Edit Pricing Period' : 'New Pricing Period'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Season Name</label>
                <input
                  type="text"
                  value={newPricing.season_name || ''}
                  onChange={(e) => setNewPricing({ ...newPricing, season_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Summer, Winter, Peak"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adult Per Person Rate *</label>
                <input
                  type="number"
                  value={newPricing.pp_dbl_rate}
                  onChange={(e) => setNewPricing({ ...newPricing, pp_dbl_rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={newPricing.start_date || ''}
                  onChange={(e) => setNewPricing({ ...newPricing, start_date: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={newPricing.end_date || ''}
                  onChange={(e) => setNewPricing({ ...newPricing, end_date: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Single Supplement</label>
                <input
                  type="number"
                  value={newPricing.single_supplement || ''}
                  onChange={(e) => setNewPricing({ ...newPricing, single_supplement: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Child 0-2 years</label>
                <input
                  type="number"
                  value={newPricing.child_0to2 || ''}
                  onChange={(e) => setNewPricing({ ...newPricing, child_0to2: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Child 3-5 years</label>
                <input
                  type="number"
                  value={newPricing.child_3to5 || ''}
                  onChange={(e) => setNewPricing({ ...newPricing, child_3to5: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Child 6-11 years</label>
                <input
                  type="number"
                  value={newPricing.child_6to11 || ''}
                  onChange={(e) => setNewPricing({ ...newPricing, child_6to11: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddPricing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingPriceId ? 'Update' : 'Add'} Pricing
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddPricing(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">Season</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Dates</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Adult Rate</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Single Supp.</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Child 0-2</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Child 3-5</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Child 6-11</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pricingPeriods.map((pricing) => (
                <tr key={pricing.id}>
                  <td className="px-4 py-3">{pricing.season_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {pricing.start_date && pricing.end_date
                      ? `${pricing.start_date} to ${pricing.end_date}`
                      : 'Anytime'}
                  </td>
                  <td className="px-4 py-3 text-right">${pricing.pp_dbl_rate}</td>
                  <td className="px-4 py-3 text-right">{pricing.single_supplement ? `$${pricing.single_supplement}` : '-'}</td>
                  <td className="px-4 py-3 text-right">{pricing.child_0to2 ? `$${pricing.child_0to2}` : '-'}</td>
                  <td className="px-4 py-3 text-right">{pricing.child_3to5 ? `$${pricing.child_3to5}` : '-'}</td>
                  <td className="px-4 py-3 text-right">{pricing.child_6to11 ? `$${pricing.child_6to11}` : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(pricing)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pricing.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pricingPeriods.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No pricing periods configured. Click "Add Pricing Period" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
