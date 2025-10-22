'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HotelsPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [formData, setFormData] = useState({
    hotel_name: '',
    city: '',
    star_rating: 3,
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    double_room_bb: 0,
    single_supplement_bb: 0,
    triple_room_bb: 0,
    child_0_6_bb: 0,
    child_6_12_bb: 0,
    base_meal_plan: 'BB',
    hb_supplement: 0,
    fb_supplement: 0,
    ai_supplement: 0,
    notes: ''
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/hotels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHotels(data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedHotel(null);
    setFormData({
      hotel_name: '',
      city: '',
      star_rating: 3,
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      double_room_bb: 0,
      single_supplement_bb: 0,
      triple_room_bb: 0,
      child_0_6_bb: 0,
      child_6_12_bb: 0,
      base_meal_plan: 'BB',
      hb_supplement: 0,
      fb_supplement: 0,
      ai_supplement: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (hotel: any) => {
    setModalMode('edit');
    setSelectedHotel(hotel);
    setFormData({
      hotel_name: hotel.hotel_name,
      city: hotel.city,
      star_rating: hotel.star_rating,
      season_name: hotel.season_name,
      start_date: hotel.start_date,
      end_date: hotel.end_date,
      currency: hotel.currency,
      double_room_bb: hotel.double_room_bb,
      single_supplement_bb: hotel.single_supplement_bb,
      triple_room_bb: hotel.triple_room_bb,
      child_0_6_bb: hotel.child_0_6_bb,
      child_6_12_bb: hotel.child_6_12_bb,
      base_meal_plan: hotel.base_meal_plan,
      hb_supplement: hotel.hb_supplement,
      fb_supplement: hotel.fb_supplement,
      ai_supplement: hotel.ai_supplement,
      notes: hotel.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (hotel: any) => {
    setModalMode('duplicate');
    setSelectedHotel(null);
    setFormData({
      hotel_name: hotel.hotel_name,
      city: hotel.city,
      star_rating: hotel.star_rating,
      season_name: hotel.season_name + ' (Copy)',
      start_date: hotel.start_date,
      end_date: hotel.end_date,
      currency: hotel.currency,
      double_room_bb: hotel.double_room_bb,
      single_supplement_bb: hotel.single_supplement_bb,
      triple_room_bb: hotel.triple_room_bb,
      child_0_6_bb: hotel.child_0_6_bb,
      child_6_12_bb: hotel.child_6_12_bb,
      base_meal_plan: hotel.base_meal_plan,
      hb_supplement: hotel.hb_supplement,
      fb_supplement: hotel.fb_supplement,
      ai_supplement: hotel.ai_supplement,
      notes: hotel.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedHotel) {
        // Update existing hotel
        const response = await fetch('/api/pricing/hotels', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedHotel.id,
            pricing_id: selectedHotel.pricing_id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Hotel updated successfully!');
          setShowModal(false);
          fetchHotels();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update hotel'}`);
        }
      } else {
        // Create new hotel (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/hotels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Hotel created successfully!');
          setShowModal(false);
          fetchHotels();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create hotel'}`);
        }
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('An error occurred while saving the hotel');
    }
  };

  const handleDelete = async (hotel: any) => {
    if (!confirm(`Are you sure you want to archive ${hotel.hotel_name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/hotels?id=${hotel.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Hotel archived successfully!');
        fetchHotels();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive hotel'}`);
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('An error occurred while archiving the hotel');
    }
  };

  const sampleHotels = hotels.map((h) => ({
    ...h,
    hotelName: h.hotel_name,
    starRating: h.star_rating,
    seasonName: h.season_name,
    startDate: h.start_date,
    endDate: h.end_date,
    doubleBB: h.double_room_bb,
    singleSuppBB: h.single_supplement_bb,
    tripleBB: h.triple_room_bb,
    child0_6: h.child_0_6_bb,
    child6_12: h.child_6_12_bb,
    baseMealPlan: h.base_meal_plan,
    hbSupplement: h.hb_supplement,
    fbSupplement: h.fb_supplement,
    aiSupplement: h.ai_supplement
  }));

  const cities = ['All', 'Istanbul', 'Cappadocia', 'Antalya', 'Ephesus'];
  const seasons = ['All', 'Summer 2025', 'Winter 2025', 'All Year 2025'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading hotels...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">Hotels Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage hotel rates by season with meal plans</p>
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
                + Add Hotel
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Season</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {seasons.map((season) => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Total Hotels</p>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Active Seasons</p>
            <p className="text-2xl font-bold text-green-600">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities</p>
            <p className="text-2xl font-bold text-blue-600">2</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Price Range</p>
            <p className="text-2xl font-bold text-purple-600">€60-90</p>
          </div>
        </div>

        {/* Hotels List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City / Stars
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season / Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Double BB
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Single Supp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Triple BB
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Children
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Plans
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-sm">{hotel.hotelName}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hotel.city}</div>
                      <div className="text-xs text-yellow-600">{'⭐'.repeat(hotel.starRating)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{hotel.seasonName}</div>
                      <div className="text-xs text-gray-500">
                        {hotel.startDate} to {hotel.endDate}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{hotel.currency} {hotel.doubleBB}</div>
                      <div className="text-xs text-gray-500">per person</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hotel.currency} {hotel.singleSuppBB}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hotel.currency} {hotel.tripleBB}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600">
                        <div>0-6y: {hotel.currency} {hotel.child0_6}</div>
                        <div>6-12y: {hotel.currency} {hotel.child6_12}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">
                        <div className="font-semibold text-blue-600">Base: {hotel.baseMealPlan}</div>
                        {hotel.hbSupplement > 0 && (
                          <div className="text-gray-600">HB: +{hotel.currency}{hotel.hbSupplement}</div>
                        )}
                        {hotel.fbSupplement > 0 && (
                          <div className="text-gray-600">FB: +{hotel.currency}{hotel.fbSupplement}</div>
                        )}
                        {hotel.aiSupplement > 0 && (
                          <div className="text-gray-600">AI: +{hotel.currency}{hotel.aiSupplement}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => openEditModal(hotel)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDuplicateModal(hotel)}
                          className="text-green-600 hover:text-green-900 font-medium text-xs"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(hotel)}
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Tips:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Each row represents one season for a hotel. You can have multiple seasons for the same hotel.</li>
            <li>• Base price is always with Breakfast (BB). Other meal plans are supplements.</li>
            <li>• If a hotel's base is HB or AI, set the base_meal_plan accordingly and make BB supplement negative or zero.</li>
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
                {modalMode === 'edit' ? 'Edit Hotel' : modalMode === 'duplicate' ? 'Duplicate Hotel' : 'Add New Hotel'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Hotel Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hotel_name}
                      onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
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
                      Star Rating *
                    </label>
                    <select
                      required
                      value={formData.star_rating}
                      onChange={(e) => setFormData({ ...formData, star_rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <option key={star} value={star}>{star} Star</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Season Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Room Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Prices (Base Breakfast)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Double Room BB *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.double_room_bb}
                      onChange={(e) => setFormData({ ...formData, double_room_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Single Supplement BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.single_supplement_bb}
                      onChange={(e) => setFormData({ ...formData, single_supplement_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Triple Room BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.triple_room_bb}
                      onChange={(e) => setFormData({ ...formData, triple_room_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Child Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Children Prices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child 0-6 years BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.child_0_6_bb}
                      onChange={(e) => setFormData({ ...formData, child_0_6_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child 6-12 years BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.child_6_12_bb}
                      onChange={(e) => setFormData({ ...formData, child_6_12_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Meal Plan Supplements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Plan Supplements</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Meal Plan *
                    </label>
                    <select
                      required
                      value={formData.base_meal_plan}
                      onChange={(e) => setFormData({ ...formData, base_meal_plan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="BB">BB (Bed & Breakfast)</option>
                      <option value="HB">HB (Half Board)</option>
                      <option value="FB">FB (Full Board)</option>
                      <option value="AI">AI (All Inclusive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HB Supplement
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hb_supplement}
                      onChange={(e) => setFormData({ ...formData, hb_supplement: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FB Supplement
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fb_supplement}
                      onChange={(e) => setFormData({ ...formData, fb_supplement: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Supplement
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ai_supplement}
                      onChange={(e) => setFormData({ ...formData, ai_supplement: parseFloat(e.target.value) })}
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
                  {modalMode === 'edit' ? 'Update Hotel' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
