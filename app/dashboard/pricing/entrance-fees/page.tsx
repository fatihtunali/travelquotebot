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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntranceFees = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/pricing/entrance-fees');

        if (!response.ok) {
          throw new Error('Failed to fetch entrance fees');
        }

        const data = await response.json();
        setFees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching entrance fees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntranceFees();
  }, []);

  const cities = ['All', ...Array.from(new Set(fees.map(fee => fee.city)))];
  const filteredFees = selectedCity === 'All'
    ? fees
    : fees.filter(fee => fee.city === selectedCity);

  const totalSites = fees.length;
  const citiesCount = new Set(fees.map(fee => fee.city)).size;
  const avgAdultFee = fees.length > 0
    ? (fees.reduce((sum, fee) => sum + fee.adultPrice, 0) / fees.length).toFixed(2)
    : '0.00';
  const freeSites = fees.filter(fee => fee.adultPrice === 0).length;

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
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && (
          <>
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
                {filteredFees.length > 0 ? (
                  filteredFees.map((fee) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No entrance fees found.
                    </td>
                  </tr>
                )}
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
          </>
        )}
      </main>
    </div>
  );
}
