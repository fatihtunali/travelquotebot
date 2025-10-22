'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExtraExpensesPricing() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sample data
  const sampleExpenses = [
    {
      id: 1,
      expenseName: 'Daily Parking Fee',
      category: 'Parking',
      city: 'Istanbul - City Center',
      currency: 'EUR',
      unitPrice: 12,
      unitType: 'per day',
      description: 'Daily parking for tour vehicles in central Istanbul areas',
      notes: 'Required for hotels without parking',
      status: 'active'
    },
    {
      id: 2,
      expenseName: 'Highway Toll (Istanbul-Ankara)',
      category: 'Tolls',
      city: 'Istanbul-Ankara Route',
      currency: 'EUR',
      unitPrice: 18,
      unitType: 'per trip',
      description: 'One-way motorway toll from Istanbul to Ankara',
      notes: 'Varies by vehicle size',
      status: 'active'
    },
    {
      id: 3,
      expenseName: 'Driver Daily Tip',
      category: 'Tips',
      city: 'Any',
      currency: 'EUR',
      unitPrice: 5,
      unitType: 'per day',
      description: 'Recommended daily tip for driver',
      notes: 'Optional but customary',
      status: 'active'
    },
    {
      id: 4,
      expenseName: 'Guide Daily Tip',
      category: 'Tips',
      city: 'Any',
      currency: 'EUR',
      unitPrice: 8,
      unitType: 'per day',
      description: 'Recommended daily tip for tour guide',
      notes: 'Optional but customary',
      status: 'active'
    },
    {
      id: 5,
      expenseName: 'Porter Service',
      category: 'Service',
      city: 'Any',
      currency: 'EUR',
      unitPrice: 2,
      unitType: 'per bag',
      description: 'Luggage handling at hotels',
      notes: 'Typically 1-2 bags per person',
      status: 'active'
    },
    {
      id: 6,
      expenseName: 'Airport Parking (IST)',
      category: 'Parking',
      city: 'Istanbul Airport',
      currency: 'EUR',
      unitPrice: 8,
      unitType: 'per hour',
      description: 'Hourly parking at Istanbul Airport',
      notes: 'Daily rate available: €50',
      status: 'active'
    },
    {
      id: 7,
      expenseName: 'Bosphorus Bridge Toll',
      category: 'Tolls',
      city: 'Istanbul',
      currency: 'EUR',
      unitPrice: 3.50,
      unitType: 'per crossing',
      description: 'Toll for crossing Bosphorus bridges',
      notes: 'Electronic payment only',
      status: 'active'
    },
    {
      id: 8,
      expenseName: 'Restaurant Service Charge',
      category: 'Service',
      city: 'Any',
      currency: 'EUR',
      unitPrice: 1.50,
      unitType: 'per person',
      description: 'Service charge at some restaurants',
      notes: 'When not included in meal price',
      status: 'active'
    },
    {
      id: 9,
      expenseName: 'Whirling Dervish Show Tip',
      category: 'Tips',
      city: 'Cappadocia',
      currency: 'EUR',
      unitPrice: 3,
      unitType: 'per person',
      description: 'Customary tip for performers',
      notes: 'Cultural performance gratuity',
      status: 'active'
    },
    {
      id: 10,
      expenseName: 'Hamam (Turkish Bath) Tips',
      category: 'Tips',
      city: 'Any',
      currency: 'EUR',
      unitPrice: 10,
      unitType: 'per person',
      description: 'Tips for massage therapist and attendant',
      notes: 'Usually split between 2-3 staff',
      status: 'active'
    },
  ];

  const categories = ['All', 'Parking', 'Tolls', 'Tips', 'Service', 'Other'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Parking':
        return 'bg-blue-100 text-blue-800';
      case 'Tolls':
        return 'bg-purple-100 text-purple-800';
      case 'Tips':
        return 'bg-green-100 text-green-800';
      case 'Service':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Parking':
        return '🅿️';
      case 'Tolls':
        return '🛣️';
      case 'Tips':
        return '💰';
      case 'Service':
        return '🛎️';
      default:
        return '📌';
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Extra Expenses & Miscellaneous</h1>
              <p className="text-sm text-gray-600">Manage parking, tolls, tips, and other tour expenses</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                + Add Expense
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Parking Fees</p>
            <p className="text-2xl font-bold text-blue-600">2</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Highway Tolls</p>
            <p className="text-2xl font-bold text-purple-600">2</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Tips & Gratuities</p>
            <p className="text-2xl font-bold text-green-600">4</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Service Charges</p>
            <p className="text-2xl font-bold text-orange-600">2</p>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 text-sm">
                        {getCategoryIcon(expense.category)} {expense.expenseName}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">📍 {expense.city}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{expense.currency} {expense.unitPrice}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{expense.unitType}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600 max-w-xs">
                        {expense.description}
                      </div>
                      {expense.notes && (
                        <div className="text-xs text-gray-500 italic mt-1">
                          Note: {expense.notes}
                        </div>
                      )}
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
                          Delete
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
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-indigo-900 mb-2">💡 Extra Expenses Guide:</h4>
          <ul className="text-xs text-indigo-800 space-y-1">
            <li>• <strong>Parking:</strong> Daily rates for vehicles in cities. Varies by location (city center more expensive).</li>
            <li>• <strong>Highway Tolls:</strong> Electronic toll system (HGS/OGS) required. Prices vary by vehicle type and route distance.</li>
            <li>• <strong>Tips & Gratuities:</strong> Customary in Turkish culture. Recommended amounts (always optional for guests).</li>
            <li>• <strong>Service Charges:</strong> Some hotels/restaurants add service charge. Check if already included in base price.</li>
            <li>• <strong>Unit Types:</strong> per day, per hour, per trip, per person, per bag, per item, etc.</li>
            <li>• <strong>Currency:</strong> Can be in EUR or TRY. AI will auto-convert when creating quotes.</li>
            <li>• <strong>AI Quote Builder:</strong> These expenses will be suggested by AI based on itinerary details.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
