'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EntranceFeesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');

  // Real official data from Turkish Ministry of Culture and Tourism (Foreign Visitor Prices)
  const sampleFees = [
    {
      id: 1,
      siteName: 'Topkapı Palace Museum',
      city: 'Istanbul',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 30,
      childPrice: 0,
      studentPrice: 15,
      notes: 'Harem section requires separate ticket. Free for children under 6. MüzeKart valid.',
      status: 'active'
    },
    {
      id: 2,
      siteName: 'Ephesus Archaeological Site',
      city: 'Izmir',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 40,
      childPrice: 0,
      studentPrice: 20,
      notes: 'UNESCO World Heritage Site. Free for children under 6. Student ID required.',
      status: 'active'
    },
    {
      id: 3,
      siteName: 'Pamukkale (Hierapolis Ancient City)',
      city: 'Denizli',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 30,
      childPrice: 0,
      studentPrice: 15,
      notes: 'Natural thermal travertines + ancient ruins. Free for children under 6.',
      status: 'active'
    },
    {
      id: 4,
      siteName: 'Galata Tower',
      city: 'Istanbul',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 30,
      childPrice: 0,
      studentPrice: 15,
      notes: 'Panoramic city views. Long queues in summer. Free for children under 6.',
      status: 'active'
    },
    {
      id: 5,
      siteName: 'Göreme Open-Air Museum',
      city: 'Cappadocia',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 20,
      childPrice: 0,
      studentPrice: 10,
      notes: 'UNESCO site. Rock-cut churches with frescoes. Free for children under 6.',
      status: 'active'
    },
    {
      id: 6,
      siteName: 'Troy Museum & Archaeological Site',
      city: 'Çanakkale',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 27,
      childPrice: 0,
      studentPrice: 13.50,
      notes: 'UNESCO World Heritage Site. Museum + ruins. Free for children under 6.',
      status: 'active'
    },
    {
      id: 7,
      siteName: 'Kız Kulesi (Maiden\'s Tower)',
      city: 'Istanbul',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 27,
      childPrice: 0,
      studentPrice: 13.50,
      notes: 'Iconic Bosphorus landmark. Includes boat transfer. Free for children under 6.',
      status: 'active'
    },
    {
      id: 8,
      siteName: 'Bodrum Underwater Archaeology Museum',
      city: 'Muğla',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 20,
      childPrice: 0,
      studentPrice: 10,
      notes: 'Located in Bodrum Castle. Unique underwater archaeological finds. Free for children under 6.',
      status: 'active'
    },
    {
      id: 9,
      siteName: 'Hagia Sophia Grand Mosque',
      city: 'Istanbul',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 0,
      childPrice: 0,
      studentPrice: 0,
      notes: 'FREE - Currently operates as a mosque. No entrance fee. Modest dress required.',
      status: 'active'
    },
    {
      id: 10,
      siteName: 'Basilica Cistern',
      city: 'Istanbul',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      adultPrice: 15,
      childPrice: 0,
      studentPrice: 7.50,
      notes: 'Underground Byzantine water reservoir. Medusa head columns. Free for children under 6.',
      status: 'active'
    },
  ];

  const cities = ['All', 'Istanbul', 'Cappadocia', 'Izmir', 'Denizli', 'Çanakkale', 'Muğla'];

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
              <h1 className="text-2xl font-bold text-gray-900">Entrance Fees Pricing</h1>
              <p className="text-sm text-gray-600">Manage museum and historical site entrance fees</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
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
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities Covered</p>
            <p className="text-2xl font-bold text-green-600">6</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Adult Fee</p>
            <p className="text-2xl font-bold text-blue-600">€23.90</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Free Entry Sites</p>
            <p className="text-2xl font-bold text-purple-600">1 site</p>
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
                {sampleFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 text-sm">🏛️ {fee.siteName}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        📍 {fee.city}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{fee.seasonName}</div>
                      <div className="text-xs text-gray-500">
                        {fee.startDate} to {fee.endDate}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{fee.currency} {fee.adultPrice}</div>
                      <div className="text-xs text-gray-500">Per adult</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${fee.childPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {fee.childPrice === 0 ? 'FREE' : `${fee.currency} ${fee.childPrice}`}
                      </div>
                      <div className="text-xs text-gray-500">6-12 years</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{fee.currency} {fee.studentPrice}</div>
                      <div className="text-xs text-gray-500">With ID</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600 max-w-xs">{fee.notes}</div>
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
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-orange-900 mb-2">💡 Entrance Fees Guide:</h4>
          <ul className="text-xs text-orange-800 space-y-1">
            <li>• <strong>Adult Price:</strong> Standard entrance fee for adults (13+ years).</li>
            <li>• <strong>Child Price:</strong> Typically ages 6-11.99 years. Many sites offer free entry for children under 6.</li>
            <li>• <strong>Student Price:</strong> Valid student ID required. Usually 50% of adult price.</li>
            <li>• <strong>Seasonal Pricing:</strong> Some museums increase prices during peak tourist season (April-October).</li>
            <li>• <strong>UNESCO Sites:</strong> World Heritage Sites may have additional camera/video permit fees.</li>
            <li>• <strong>Combo Tickets:</strong> Some cities offer multi-museum passes with discounts.</li>
            <li>• <strong>For Private Tours:</strong> Entrance fees are usually NOT included and charged separately per person.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
