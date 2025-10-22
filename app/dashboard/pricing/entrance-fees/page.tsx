'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EntranceFee {
  id: number;
  siteName: string;
  city: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  currency: string;
  adultPrice: number;
  childPrice: number;
  studentPrice: number;
  notes: string;
  status: string;
}

export default function EntranceFeesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [fees, setFees] = useState<EntranceFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [formData, setFormData] = useState({
    site_name: '',
    city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    adult_price: 0,
    child_price: 0,
    student_price: 0,
    notes: ''
  });

  useEffect(() => {
    fetchEntranceFees();
  }, []);

  const fetchEntranceFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/entrance-fees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFees(data);
      }
    } catch (error) {
      console.error('Error fetching entrance fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedFee(null);
    setFormData({
      site_name: '',
      city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      adult_price: 0,
      child_price: 0,
      student_price: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (fee: any) => {
    setModalMode('edit');
    setSelectedFee(fee);
    setFormData({
      site_name: fee.siteName,
      city: fee.city,
      season_name: fee.seasonName,
      start_date: fee.startDate,
      end_date: fee.endDate,
      currency: fee.currency,
      adult_price: fee.adultPrice,
      child_price: fee.childPrice,
      student_price: fee.studentPrice,
      notes: fee.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (fee: any) => {
    setModalMode('duplicate');
    setSelectedFee(null);
    setFormData({
      site_name: fee.siteName,
      city: fee.city,
      season_name: fee.seasonName + ' (Copy)',
      start_date: fee.startDate,
      end_date: fee.endDate,
      currency: fee.currency,
      adult_price: fee.adultPrice,
      child_price: fee.childPrice,
      student_price: fee.studentPrice,
      notes: fee.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedFee) {
        // Update existing entrance fee
        const response = await fetch('/api/pricing/entrance-fees', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedFee.id,
            pricing_id: selectedFee.pricing_id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Entrance fee updated successfully!');
          setShowModal(false);
          fetchEntranceFees();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update entrance fee'}`);
        }
      } else {
        // Create new entrance fee (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/entrance-fees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Entrance fee created successfully!');
          setShowModal(false);
          fetchEntranceFees();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create entrance fee'}`);
        }
      }
    } catch (error) {
      console.error('Error saving entrance fee:', error);
      alert('An error occurred while saving the entrance fee');
    }
  };

  const handleDelete = async (fee: any) => {
    if (!confirm(`Are you sure you want to archive ${fee.siteName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/entrance-fees?id=${fee.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Entrance fee archived successfully!');
        fetchEntranceFees();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive entrance fee'}`);
      }
    } catch (error) {
      console.error('Error deleting entrance fee:', error);
      alert('An error occurred while archiving the entrance fee');
    }
  };

  const sampleFees = fees.map((f) => ({
    ...f,
    siteName: f.siteName,
    seasonName: f.seasonName,
    startDate: f.startDate,
    endDate: f.endDate,
    adultPrice: f.adultPrice,
    childPrice: f.childPrice,
    studentPrice: f.studentPrice
  }));

  const cities = ['All', ...Array.from(new Set(fees.map(fee => fee.city)))];
  const filteredFees = selectedCity === 'All'
    ? sampleFees
    : sampleFees.filter(fee => fee.city === selectedCity);

  const totalSites = fees.length;
  const citiesCount = new Set(fees.map(fee => fee.city)).size;
  const avgAdultFee = fees.length > 0
    ? (fees.reduce((sum, fee) => sum + fee.adultPrice, 0) / fees.length).toFixed(2)
    : '0.00';
  const freeSites = fees.filter(fee => fee.adultPrice === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading entrance fees...</div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Entrance Fees Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage museum and historical site entrance fees</p>
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
                + Add Site
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Total Sites</p>
            <p className="text-2xl font-bold text-gray-900">{totalSites}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities Covered</p>
            <p className="text-2xl font-bold text-green-600">{citiesCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Adult Fee</p>
            <p className="text-2xl font-bold text-blue-600">€{avgAdultFee}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Free Entry Sites</p>
            <p className="text-2xl font-bold text-purple-600">{freeSites} {freeSites === 1 ? 'site' : 'sites'}</p>
          </div>
        </div>

        {/* Entrance Fees Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season / Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adult Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 text-sm">{fee.siteName}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{fee.city}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{fee.seasonName}</div>
                      <div className="text-xs text-gray-500">
                        {fee.startDate} to {fee.endDate}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{fee.currency} {fee.adultPrice}</div>
                      <div className="text-xs text-gray-500">per adult</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${fee.childPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {fee.childPrice === 0 ? 'FREE' : `${fee.currency} ${fee.childPrice}`}
                      </div>
                      <div className="text-xs text-gray-500">6-12 years</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{fee.currency} {fee.studentPrice}</div>
                      <div className="text-xs text-gray-500">with ID</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600 max-w-xs">{fee.notes}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => openEditModal(fee)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDuplicateModal(fee)}
                          className="text-green-600 hover:text-green-900 font-medium text-xs"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(fee)}
                          className="text-red-600 hover:text-red-900 font-medium text-xs"
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-orange-900 mb-2">💡 Tips:</h4>
          <ul className="text-xs text-orange-800 space-y-1">
            <li>• Each row represents one season for a site. You can have multiple seasons for the same site.</li>
            <li>• Adult Price: Standard entrance fee for adults (13+ years).</li>
            <li>• Child Price: Typically ages 6-12 years. Many sites offer free entry for children under 6.</li>
            <li>• Student Price: Valid student ID required. Usually 50% of adult price.</li>
            <li>• Use "Duplicate" to quickly create a new season with similar pricing.</li>
            <li>• Old prices are archived, not deleted, for historical bookings.</li>
          </ul>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Entrance Fee' : modalMode === 'duplicate' ? 'Duplicate Entrance Fee' : 'Add New Entrance Fee'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Site Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.site_name}
                      onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
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
                </div>
              </div>

              {/* Season Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.season_name}
                      onChange={(e) => setFormData({ ...formData, season_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Summer 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
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

              {/* Pricing */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entrance Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adult Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.adult_price}
                      onChange={(e) => setFormData({ ...formData, adult_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child Price (6-12 years)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.child_price}
                      onChange={(e) => setFormData({ ...formData, child_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.student_price}
                      onChange={(e) => setFormData({ ...formData, student_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
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
                  {modalMode === 'edit' ? 'Update Entrance Fee' : 'Create Entrance Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
