'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ToursPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const sampleTours = tours.map((t, index) => ({
    id: index + 1,
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
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
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
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300">
                      Duplicate
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
    </div>
  );
}
