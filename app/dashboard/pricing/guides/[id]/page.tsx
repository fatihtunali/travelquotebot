'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Guide {
  id: string;
  name: string;
  guide_type: string;
  languages: string[] | null;
  specialization: string | null;
  base_daily_rate: number;
  currency: string;
  max_group_size: number | null;
  cities: string[] | null;
  description: string | null;
  is_active: boolean;
}

interface PricingPeriod {
  id?: number;
  season_name: string | null;
  start_date: string | null;
  end_date: string | null;
  daily_rate: number;
  created_at?: string;
  updated_at?: string;
}

export default function GuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [pricingPeriods, setPricingPeriods] = useState<PricingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPricing, setShowAddPricing] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);

  const [newPricing, setNewPricing] = useState<Partial<PricingPeriod>>({
    season_name: '',
    start_date: null,
    end_date: null,
    daily_rate: 0,
  });

  useEffect(() => {
    fetchGuide();
    fetchPricing();
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
      }
    } catch (error) {
      console.error('Failed to fetch guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
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
      daily_rate: 0,
    });
    setEditingPriceId(null);
  };

  const handleAddPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = editingPriceId
        ? `/api/pricing/guides/${id}/prices/${editingPriceId}`
        : `/api/pricing/guides/${id}/prices`;

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

      const response = await fetch(`/api/pricing/guides/${id}/prices/${priceId}`, {
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

  if (!guide) {
    return <div className="p-6">Guide not found</div>;
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
        <h1 className="text-3xl font-bold mb-2">{guide.name}</h1>
        <p className="text-gray-600">
          {guide.guide_type} • {guide.languages?.join(', ')}
        </p>
        <p className="text-gray-600">
          Base Daily Rate: {guide.currency} {guide.base_daily_rate}
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
                <label className="block text-sm font-medium mb-1">Daily Rate *</label>
                <input
                  type="number"
                  value={newPricing.daily_rate}
                  onChange={(e) => setNewPricing({ ...newPricing, daily_rate: parseFloat(e.target.value) })}
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
                <th className="px-4 py-2 text-right text-sm font-medium">Daily Rate</th>
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
                  <td className="px-4 py-3 text-right">${pricing.daily_rate}</td>
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
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
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
