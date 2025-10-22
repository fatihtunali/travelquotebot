'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ToursPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [formData, setFormData] = useState({
    tour_name: '',
    tour_code: '',
    city: '',
    duration_days: 1,
    tour_type: 'SIC',
    inclusions: '',
    exclusions: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    sic_price_2_pax: 0,
    sic_price_4_pax: 0,
    sic_price_6_pax: 0,
    sic_price_8_pax: 0,
    sic_price_10_pax: 0,
    pvt_price_2_pax: 0,
    pvt_price_4_pax: 0,
    pvt_price_6_pax: 0,
    pvt_price_8_pax: 0,
    pvt_price_10_pax: 0,
    notes: ''
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/tours', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTours(data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedTour(null);
    setFormData({
      tour_name: '',
      tour_code: '',
      city: '',
      duration_days: 1,
      tour_type: 'SIC',
      inclusions: '',
      exclusions: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      sic_price_2_pax: 0,
      sic_price_4_pax: 0,
      sic_price_6_pax: 0,
      sic_price_8_pax: 0,
      sic_price_10_pax: 0,
      pvt_price_2_pax: 0,
      pvt_price_4_pax: 0,
      pvt_price_6_pax: 0,
      pvt_price_8_pax: 0,
      pvt_price_10_pax: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (tour: any) => {
    setModalMode('edit');
    setSelectedTour(tour);
    setFormData({
      tour_name: tour.tour_name,
      tour_code: tour.tour_code,
      city: tour.city,
      duration_days: tour.duration_days,
      tour_type: tour.tour_type,
      inclusions: tour.inclusions || '',
      exclusions: tour.exclusions || '',
      season_name: tour.season_name,
      start_date: tour.start_date,
      end_date: tour.end_date,
      currency: tour.currency,
      sic_price_2_pax: tour.sic_price_2_pax,
      sic_price_4_pax: tour.sic_price_4_pax,
      sic_price_6_pax: tour.sic_price_6_pax,
      sic_price_8_pax: tour.sic_price_8_pax,
      sic_price_10_pax: tour.sic_price_10_pax,
      pvt_price_2_pax: tour.pvt_price_2_pax,
      pvt_price_4_pax: tour.pvt_price_4_pax,
      pvt_price_6_pax: tour.pvt_price_6_pax,
      pvt_price_8_pax: tour.pvt_price_8_pax,
      pvt_price_10_pax: tour.pvt_price_10_pax,
      notes: tour.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (tour: any) => {
    setModalMode('duplicate');
    setSelectedTour(null);
    setFormData({
      tour_name: tour.tour_name,
      tour_code: tour.tour_code,
      city: tour.city,
      duration_days: tour.duration_days,
      tour_type: tour.tour_type,
      inclusions: tour.inclusions || '',
      exclusions: tour.exclusions || '',
      season_name: tour.season_name + ' (Copy)',
      start_date: tour.start_date,
      end_date: tour.end_date,
      currency: tour.currency,
      sic_price_2_pax: tour.sic_price_2_pax,
      sic_price_4_pax: tour.sic_price_4_pax,
      sic_price_6_pax: tour.sic_price_6_pax,
      sic_price_8_pax: tour.sic_price_8_pax,
      sic_price_10_pax: tour.sic_price_10_pax,
      pvt_price_2_pax: tour.pvt_price_2_pax,
      pvt_price_4_pax: tour.pvt_price_4_pax,
      pvt_price_6_pax: tour.pvt_price_6_pax,
      pvt_price_8_pax: tour.pvt_price_8_pax,
      pvt_price_10_pax: tour.pvt_price_10_pax,
      notes: tour.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedTour) {
        // Update existing tour
        const response = await fetch('/api/pricing/tours', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedTour.id,
            pricing_id: selectedTour.pricing_id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Tour updated successfully!');
          setShowModal(false);
          fetchTours();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update tour'}`);
        }
      } else {
        // Create new tour (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/tours', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Tour created successfully!');
          setShowModal(false);
          fetchTours();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create tour'}`);
        }
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('An error occurred while saving the tour');
    }
  };

  const handleDelete = async (tour: any) => {
    if (!confirm(`Are you sure you want to archive ${tour.tour_name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/tours?id=${tour.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Tour archived successfully!');
        fetchTours();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive tour'}`);
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('An error occurred while archiving the tour');
    }
  };

  const sampleTours = tours.map((t) => ({
    ...t,
    tourName: t.tour_name,
    tourCode: t.tour_code,
    city: t.city,
    duration: t.duration_days,
    tourType: t.tour_type,
    seasonName: t.season_name,
    startDate: t.start_date,
    endDate: t.end_date,
    currency: t.currency,
    price2pax: t.tour_type === 'SIC' ? t.sic_price_2_pax : t.pvt_price_2_pax,
    price4pax: t.tour_type === 'SIC' ? t.sic_price_4_pax : t.pvt_price_4_pax,
    price6pax: t.tour_type === 'SIC' ? t.sic_price_6_pax : t.pvt_price_6_pax,
    price8pax: t.tour_type === 'SIC' ? t.sic_price_8_pax : t.pvt_price_8_pax,
    price10pax: t.tour_type === 'SIC' ? t.sic_price_10_pax : t.pvt_price_10_pax,
    inclusions: t.inclusions,
    exclusions: t.exclusions,
    status: t.status
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading tours...</div>
        </div>
      </div>
    );
  }

  const cities = ['All', 'Istanbul', 'Cappadocia', 'Ephesus', 'Antalya'];
  const tourTypes = ['All', 'SIC', 'PRIVATE'];

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
              <h1 className="text-2xl font-bold text-gray-900">Tours Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage SIC and Private tour pricing with group slabs</p>
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
                + Add Tour
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tour Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {tourTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
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
            <p className="text-xs text-gray-600">Total Tours</p>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">SIC Tours</p>
            <p className="text-2xl font-bold text-green-600">2</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Private Tours</p>
            <p className="text-2xl font-bold text-blue-600">1</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Active Cities</p>
            <p className="text-2xl font-bold text-purple-600">3</p>
          </div>
        </div>

        {/* Tours List */}
        <div className="space-y-4">
          {sampleTours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-xl shadow overflow-hidden">
              {/* Tour Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{tour.tourName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tour.tourType === 'SIC'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {tour.tourType}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                        {tour.tourCode}
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div>📍 <strong>{tour.city}</strong></div>
                      <div>⏱️ <strong>{tour.duration} Day{tour.duration > 1 ? 's' : ''}</strong></div>
                      <div>🗓️ <strong>{tour.seasonName}</strong> ({tour.startDate} to {tour.endDate})</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(tour)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDuplicateModal(tour)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(tour)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing Slabs */}
              <div className="px-6 py-4">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Price per Person (Group Size Slabs)</h4>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">2 Persons</div>
                      <div className="text-lg font-bold text-blue-900">{tour.currency} {tour.price2pax}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">4 Persons</div>
                      <div className="text-lg font-bold text-blue-900">{tour.currency} {tour.price4pax}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">6 Persons</div>
                      <div className="text-lg font-bold text-blue-900">{tour.currency} {tour.price6pax}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">8 Persons</div>
                      <div className="text-lg font-bold text-blue-900">{tour.currency} {tour.price8pax}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">10 Persons</div>
                      <div className="text-lg font-bold text-blue-900">{tour.currency} {tour.price10pax}</div>
                    </div>
                  </div>
                </div>

                {/* Inclusions/Exclusions */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">✓ Included:</h5>
                    <p className="text-gray-700">{tour.inclusions}</p>
                  </div>
                  {tour.exclusions && (
                    <div>
                      <h5 className="font-semibold text-red-700 mb-2">✗ Not Included:</h5>
                      <p className="text-gray-700">{tour.exclusions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-green-900 mb-2">💡 Tour Pricing Guide:</h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• <strong>SIC Tours (Seat-in-Coach):</strong> Fixed price per person regardless of group size. Includes guide, transport, and entrance fees.</li>
            <li>• <strong>Private Tours:</strong> Price per person decreases as group size increases. Guide and entrance fees are separate.</li>
            <li>• <strong>Group Slabs:</strong> Use 2-4-6-8-10 pax for easier calculation. Price per person at each slab level.</li>
            <li>• <strong>For odd numbers:</strong> AI will use the next higher slab (e.g., 5 pax uses 6 pax pricing, 7 pax uses 8 pax pricing).</li>
          </ul>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Tour' : modalMode === 'duplicate' ? 'Duplicate Tour' : 'Add New Tour'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Tour Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tour_name}
                      onChange={(e) => setFormData({ ...formData, tour_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tour_code}
                      onChange={(e) => setFormData({ ...formData, tour_code: e.target.value })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Type *
                    </label>
                    <select
                      required
                      value={formData.tour_type}
                      onChange={(e) => setFormData({ ...formData, tour_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="SIC">SIC (Seat-in-Coach)</option>
                      <option value="PRIVATE">Private Tour</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inclusions/Exclusions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inclusions
                    </label>
                    <textarea
                      value={formData.inclusions}
                      onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="What's included in the tour..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exclusions
                    </label>
                    <textarea
                      value={formData.exclusions}
                      onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="What's not included..."
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

              {/* SIC Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SIC Tour Prices (Per Person)</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      2 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_2_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_2_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      4 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_4_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_4_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      6 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_6_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_6_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      8 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_8_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_8_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      10 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_10_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_10_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Private Tour Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Tour Prices (Per Person)</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      2 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_2_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_2_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      4 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_4_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_4_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      6 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_6_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_6_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      8 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_8_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_8_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      10 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_10_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_10_pax: parseFloat(e.target.value) })}
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
                  {modalMode === 'edit' ? 'Update Tour' : 'Create Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
