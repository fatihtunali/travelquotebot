'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExtraExpense {
  id: number;
  expenseName: string;
  category: string;
  city: string;
  currency: string;
  unitPrice: number;
  unitType: string;
  description: string;
  status: string;
}

export default function ExtraExpensesPricing() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expenses, setExpenses] = useState<ExtraExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    expenseName: '',
    category: 'Parking',
    city: '',
    currency: 'EUR',
    unitPrice: 0,
    unitType: 'per day',
    description: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/pricing/extras', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedExpense(null);
    setFormData({
      expenseName: '',
      category: 'Parking',
      city: '',
      currency: 'EUR',
      unitPrice: 0,
      unitType: 'per day',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (expense: any) => {
    setModalMode('edit');
    setSelectedExpense(expense);
    setFormData({
      expenseName: expense.expenseName,
      category: expense.category,
      city: expense.city,
      currency: expense.currency,
      unitPrice: expense.unitPrice,
      unitType: expense.unitType,
      description: expense.description || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (expense: any) => {
    setModalMode('duplicate');
    setSelectedExpense(null);
    setFormData({
      expenseName: expense.expenseName + ' (Copy)',
      category: expense.category,
      city: expense.city,
      currency: expense.currency,
      unitPrice: expense.unitPrice,
      unitType: expense.unitType,
      description: expense.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedExpense) {
        // Update existing expense
        const response = await fetch('/api/pricing/extras', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedExpense.id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Extra expense updated successfully!');
          setShowModal(false);
          fetchExpenses();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update expense'}`);
        }
      } else {
        // Create new expense (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/extras', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Extra expense created successfully!');
          setShowModal(false);
          fetchExpenses();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create expense'}`);
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('An error occurred while saving the expense');
    }
  };

  const handleDelete = async (expense: any) => {
    if (!confirm(`Are you sure you want to delete ${expense.expenseName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/extras?id=${expense.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Extra expense deleted successfully!');
        fetchExpenses();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete expense'}`);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('An error occurred while deleting the expense');
    }
  };

  const categories = ['All', 'Parking', 'Tolls', 'Tips', 'Service', 'Other'];

  const filteredExpenses = selectedCategory === 'All'
    ? expenses
    : expenses.filter(expense => expense.category === selectedCategory);

  const stats = {
    total: expenses.length,
    parking: expenses.filter(e => e.category === 'Parking').length,
    tolls: expenses.filter(e => e.category === 'Tolls').length,
    tips: expenses.filter(e => e.category === 'Tips').length,
    service: expenses.filter(e => e.category === 'Service').length,
  };

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
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
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
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={fetchExpenses}
              className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Parking Fees</p>
                <p className="text-2xl font-bold text-blue-600">{stats.parking}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Highway Tolls</p>
                <p className="text-2xl font-bold text-purple-600">{stats.tolls}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Tips & Gratuities</p>
                <p className="text-2xl font-bold text-green-600">{stats.tips}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Service Charges</p>
                <p className="text-2xl font-bold text-orange-600">{stats.service}</p>
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
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No expenses found. Click &quot;+ Add Expense&quot; to create your first entry.
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense) => (
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
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => openEditModal(expense)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openDuplicateModal(expense)}
                                className="text-green-600 hover:text-green-900 font-medium text-xs"
                              >
                                Duplicate
                              </button>
                              <button
                                onClick={() => handleDelete(expense)}
                                className="text-red-600 hover:text-red-900 font-medium text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Extra Expense' : modalMode === 'duplicate' ? 'Duplicate Extra Expense' : 'Add New Extra Expense'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expense Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.expenseName}
                      onChange={(e) => setFormData({ ...formData, expenseName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Istanbul City Center Parking"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="Parking">Parking</option>
                      <option value="Tolls">Tolls</option>
                      <option value="Tips">Tips</option>
                      <option value="Service">Service</option>
                      <option value="Other">Other</option>
                    </select>
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
                      placeholder="e.g., Istanbul"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Type *
                    </label>
                    <select
                      required
                      value={formData.unitType}
                      onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="per day">per day</option>
                      <option value="per hour">per hour</option>
                      <option value="per trip">per trip</option>
                      <option value="per person">per person</option>
                      <option value="per vehicle">per vehicle</option>
                      <option value="per bag">per bag</option>
                      <option value="per item">per item</option>
                      <option value="flat rate">flat rate</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Additional details about this expense..."
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
                  {modalMode === 'edit' ? 'Update Expense' : 'Create Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
