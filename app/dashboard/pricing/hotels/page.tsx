'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HotelsPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const sampleHotels = hotels.map((h, index) => ({
    id: index + 1,
    hotelName: h.hotel_name,
    city: h.city,
    starRating: h.star_rating,
    seasonName: h.season_name,
    startDate: h.start_date,
    endDate: h.end_date,
    currency: h.currency,
    doubleBB: h.double_room_bb,
    singleSuppBB: h.single_supplement_bb,
    tripleBB: h.triple_room_bb,
    child0_6: h.child_0_6_bb,
    child6_12: h.child_6_12_bb,
    baseMealPlan: h.base_meal_plan,
    hbSupplement: h.hb_supplement,
    fbSupplement: h.fb_supplement,
    aiSupplement: h.ai_supplement,
    status: h.status
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
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
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
                        <button className="text-blue-600 hover:text-blue-900 font-medium text-xs">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900 font-medium text-xs">
                          Duplicate
                        </button>
                        <button className="text-red-600 hover:text-red-900 font-medium text-xs">
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
    </div>
  );
}
