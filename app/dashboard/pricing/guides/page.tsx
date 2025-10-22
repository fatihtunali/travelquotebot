'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuidesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [formData, setFormData] = useState({
    city: '',
    language: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    full_day_price: 0,
    half_day_price: 0,
    night_price: 0,
    notes: ''
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/guides', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuides(data);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedGuide(null);
    setFormData({
      city: '',
      language: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      full_day_price: 0,
      half_day_price: 0,
      night_price: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (guide: any) => {
    setModalMode('edit');
    setSelectedGuide(guide);
    setFormData({
      city: guide.city,
      language: guide.language,
      season_name: guide.season_name,
      start_date: guide.start_date,
      end_date: guide.end_date,
      currency: guide.currency,
      full_day_price: guide.fullDay,
      half_day_price: guide.halfDay,
      night_price: guide.night,
      notes: guide.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (guide: any) => {
    setModalMode('duplicate');
    setSelectedGuide(null);
    setFormData({
      city: guide.city,
      language: guide.language,
      season_name: guide.season_name + ' (Copy)',
      start_date: guide.start_date,
      end_date: guide.end_date,
      currency: guide.currency,
      full_day_price: guide.fullDay,
      half_day_price: guide.halfDay,
      night_price: guide.night,
      notes: guide.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedGuide) {
        // Update existing guide
        const response = await fetch('/api/pricing/guides', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedGuide.id,
            pricing_id: selectedGuide.pricing_id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Guide updated successfully!');
          setShowModal(false);
          fetchGuides();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update guide'}`);
        }
      } else {
        // Create new guide (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/guides', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Guide created successfully!');
          setShowModal(false);
          fetchGuides();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create guide'}`);
        }
      }
    } catch (error) {
      console.error('Error saving guide:', error);
      alert('An error occurred while saving the guide');
    }
  };

  const handleDelete = async (guide: any) => {
    if (!confirm(`Are you sure you want to archive ${guide.city} - ${guide.language}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/guides?id=${guide.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Guide archived successfully!');
        fetchGuides();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive guide'}`);
      }
    } catch (error) {
      console.error('Error deleting guide:', error);
      alert('An error occurred while archiving the guide');
    }
  };

  const sampleGuides = guides.map((g) => ({
    ...g,
    seasonName: g.season_name,
    startDate: g.start_date,
    endDate: g.end_date
  }));

  const cities = ['All', 'Istanbul', 'Cappadocia', 'Ephesus', 'Antalya', 'Izmir', 'Ankara'];
  const languages = ['All', 'English', 'Spanish', 'German', 'French', 'Russian', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Arabic'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading guides...</div>
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
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
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
            <p className="text-2xl font-bold text-gray-900">{guides.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Languages</p>
            <p className="text-2xl font-bold text-green-600">
              {new Set(guides.map(g => g.language)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities Covered</p>
            <p className="text-2xl font-bold text-blue-600">
              {new Set(guides.map(g => g.city)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Full Day Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {guides.length > 0
                ? `${guides[0]?.currency || 'EUR'} ${Math.round(guides.reduce((sum, g) => sum + (g.fullDay || 0), 0) / guides.length)}`
                : '-'}
            </p>
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
                      <div className="font-medium text-gray-900 text-sm">{guide.city}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {guide.language}
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
                      <div className="text-xs text-gray-600 max-w-xs">{guide.notes || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => openEditModal(guide)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDuplicateModal(guide)}
                          className="text-green-600 hover:text-green-900 font-medium text-xs"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(guide)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Guide' : modalMode === 'duplicate' ? 'Duplicate Guide' : 'Add New Guide'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Guide Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., English"
                    />
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

              {/* Guide Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide Prices</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Day Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.full_day_price}
                      onChange={(e) => setFormData({ ...formData, full_day_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="8-10 hours"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Half Day Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.half_day_price}
                      onChange={(e) => setFormData({ ...formData, half_day_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="4-5 hours"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Night Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.night_price}
                      onChange={(e) => setFormData({ ...formData, night_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="Evening tours"
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
                  {modalMode === 'edit' ? 'Update Guide' : 'Create Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
