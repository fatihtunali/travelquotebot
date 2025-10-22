'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GuidesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Sample data
  const sampleGuides = [
    {
      id: 1,
      city: 'Istanbul',
      language: 'English',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      fullDay: 100,
      halfDay: 60,
      night: 80,
      notes: 'Licensed professional guide',
      status: 'active'
    },
    {
      id: 2,
      city: 'Istanbul',
      language: 'Spanish',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      fullDay: 120,
      halfDay: 70,
      night: 90,
      notes: 'Premium language - higher demand',
      status: 'active'
    },
    {
      id: 3,
      city: 'Cappadocia',
      language: 'English',
      seasonName: 'Summer 2025',
      startDate: '2025-04-01',
      endDate: '2025-10-31',
      currency: 'EUR',
      fullDay: 110,
      halfDay: 65,
      night: 85,
      notes: 'Peak season rates',
      status: 'active'
    },
    {
      id: 4,
      city: 'Ephesus',
      language: 'German',
      seasonName: 'All Year 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      currency: 'EUR',
      fullDay: 115,
      halfDay: 68,
      night: 88,
      notes: 'Archaeological site specialist',
      status: 'active'
    },
    {
      id: 5,
      city: 'Antalya',
      language: 'Russian',
      seasonName: 'High Season 2025',
      startDate: '2025-05-01',
      endDate: '2025-09-30',
      currency: 'EUR',
      fullDay: 125,
      halfDay: 75,
      night: 95,
      notes: 'High demand for Russian speakers',
      status: 'active'
    },
  ];

  const cities = ['All', 'Istanbul', 'Cappadocia', 'Ephesus', 'Antalya', 'Izmir', 'Ankara'];
  const languages = ['All', 'English', 'Spanish', 'German', 'French', 'Russian', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Arabic'];

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
              <h1 className="text-2xl font-bold text-gray-900">Guide Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage guide rates by city and language</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                + Add Guide
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
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
            <p className="text-xs text-gray-600">Total Guide Rates</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Languages</p>
            <p className="text-2xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities Covered</p>
            <p className="text-2xl font-bold text-blue-600">4</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Full Day Rate</p>
            <p className="text-2xl font-bold text-purple-600">€114</p>
          </div>
        </div>

        {/* Guides Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season / Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Day
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Half Day
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Night Tour
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
                {sampleGuides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-sm">📍 {guide.city}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        🌐 {guide.language}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{guide.seasonName}</div>
                      <div className="text-xs text-gray-500">
                        {guide.startDate} to {guide.endDate}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{guide.currency} {guide.fullDay}</div>
                      <div className="text-xs text-gray-500">8-10 hours</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{guide.currency} {guide.halfDay}</div>
                      <div className="text-xs text-gray-500">4-5 hours</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{guide.currency} {guide.night}</div>
                      <div className="text-xs text-gray-500">Evening</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600 max-w-xs">{guide.notes}</div>
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
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-yellow-900 mb-2">💡 Guide Pricing Guide:</h4>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• <strong>Full Day:</strong> 8-10 hours of guiding service. Includes museum/site tours.</li>
            <li>• <strong>Half Day:</strong> 4-5 hours of guiding service. Perfect for shorter tours.</li>
            <li>• <strong>Night Tours:</strong> Evening/nighttime tours (dinner cruises, night walks, etc.)</li>
            <li>• <strong>Language Premium:</strong> Rare languages (Spanish, Russian, Chinese, Japanese) typically cost 15-20% more.</li>
            <li>• <strong>City-Specific:</strong> Prices may vary by city based on demand and cost of living.</li>
            <li>• <strong>Licensed Guides:</strong> All prices are for licensed, professional tour guides.</li>
            <li>• <strong>For Private Tours:</strong> Guide fees are separate and paid directly (not included in tour price).</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
