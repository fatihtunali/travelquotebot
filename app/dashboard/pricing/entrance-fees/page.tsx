'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GroupedEntranceFee {
  key: string;
  siteName: string;
  city: string;
  currency: string;
  seasons: any[];
  minPrice: number;
  maxPrice: number;
  photo_url_1?: string;
  rating?: number;
  user_ratings_total?: number;
  google_maps_url?: string;
}

export default function EntranceFeesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    site_name: '',
    city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    adult_price: 0,
    child_price: 0,
    student_price: 0,
    notes: ''
  });

  useEffect(() => {
    fetchEntranceFees();
  }, []);

  useEffect(() => {
    // Auto-expand all sites by default
    if (fees.length > 0) {
      const siteKeys = new Set<string>();
      fees.forEach(f => {
        const key = `${f.siteName}-${f.city}`;
        siteKeys.add(key);
      });
      setExpandedSites(siteKeys);
    }
  }, [fees]);

  const fetchEntranceFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/entrance-fees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFees(data);
      }
    } catch (error) {
      console.error('Error fetching entrance fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSite = (siteKey: string) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(siteKey)) {
      newExpanded.delete(siteKey);
    } else {
      newExpanded.add(siteKey);
    }
    setExpandedSites(newExpanded);
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedFee(null);
    setFormData({
      site_name: '',
      city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      adult_price: 0,
      child_price: 0,
      student_price: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (fee: any) => {
    setModalMode('edit');
    setSelectedFee(fee);
    setFormData({
      site_name: fee.siteName,
      city: fee.city,
      season_name: fee.seasonName,
      start_date: fee.startDate,
      end_date: fee.endDate,
      currency: fee.currency,
      adult_price: fee.adultPrice,
      child_price: fee.childPrice,
      student_price: fee.studentPrice,
      notes: fee.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (fee: any) => {
    setModalMode('duplicate');
    setSelectedFee(null);
    setFormData({
      site_name: fee.siteName,
      city: fee.city,
      season_name: fee.seasonName + ' (Copy)',
      start_date: fee.startDate,
      end_date: fee.endDate,
      currency: fee.currency,
      adult_price: fee.adultPrice,
      child_price: fee.childPrice,
      student_price: fee.studentPrice,
      notes: fee.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedFee) {
        // Update existing entrance fee
        const response = await fetch('/api/pricing/entrance-fees', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedFee.id,
            pricing_id: selectedFee.pricing_id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Entrance fee updated successfully!');
          setShowModal(false);
          fetchEntranceFees();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update entrance fee'}`);
        }
      } else {
        // Create new entrance fee (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/entrance-fees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Entrance fee created successfully!');
          setShowModal(false);
          fetchEntranceFees();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create entrance fee'}`);
        }
      }
    } catch (error) {
      console.error('Error saving entrance fee:', error);
      alert('An error occurred while saving the entrance fee');
    }
  };

  const handleDelete = async (fee: any) => {
    if (!confirm(`Are you sure you want to archive ${fee.siteName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/entrance-fees?id=${fee.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Entrance fee archived successfully!');
        fetchEntranceFees();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive entrance fee'}`);
      }
    } catch (error) {
      console.error('Error deleting entrance fee:', error);
      alert('An error occurred while archiving the entrance fee');
    }
  };

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return '';

    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } else {
        date = new Date(dateInput + 'T00:00:00');
      }
    } else {
      return '';
    }

    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Group entrance fees by site name + city
  const groupedFees: GroupedEntranceFee[] = [];
  const feeMap = new Map<string, GroupedEntranceFee>();

  fees.forEach(f => {
    const key = `${f.siteName}-${f.city}`;
    if (!feeMap.has(key)) {
      feeMap.set(key, {
        key,
        siteName: f.siteName,
        city: f.city,
        currency: f.currency || 'EUR',
        seasons: [],
        minPrice: Infinity,
        maxPrice: -Infinity,
        photo_url_1: f.photo_url_1,
        rating: f.rating,
        user_ratings_total: f.user_ratings_total,
        google_maps_url: f.google_maps_url
      });
    }

    const group = feeMap.get(key)!;
    if (f.pricing_id || f.id) {
      group.seasons.push(f);
      if (f.adultPrice) {
        const price = parseFloat(f.adultPrice);
        group.minPrice = Math.min(group.minPrice, price);
        group.maxPrice = Math.max(group.maxPrice, price);
      }
    }
  });

  feeMap.forEach(value => groupedFees.push(value));

  // Filter grouped fees
  const filteredFees = groupedFees.filter(fee => {
    const cityMatch = selectedCity === 'All' || fee.city === selectedCity;
    return cityMatch;
  });

  const cities = ['All', ...Array.from(new Set(groupedFees.map(f => f.city)))];

  // Calculate stats
  const totalSites = groupedFees.length;
  const citiesCount = new Set(groupedFees.map(f => f.city)).size;
  const allPrices = groupedFees.flatMap(f => f.seasons.map(s => s.adultPrice)).filter(p => p).map(p => parseFloat(p));
  const avgAdultFee = allPrices.length > 0
    ? (allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length).toFixed(2)
    : '0.00';
  const freeSitesCount = groupedFees.filter(f => f.minPrice === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading entrance fees...</p>
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
                type="button"
                onClick={() => router.push('/dashboard/pricing')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
              >
                ← Back to Pricing
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Entrance Fees Pricing</h1>
              <p className="text-sm text-gray-600">Manage museum and historical site entrance fees</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button
                type="button"
                onClick={openAddModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                + Add Site Season
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
            <p className="text-2xl font-bold text-purple-600">{freeSitesCount}</p>
          </div>
        </div>

        {/* Grouped Entrance Fees List */}
        <div className="space-y-4">
          {filteredFees.map((site) => {
            const isExpanded = expandedSites.has(site.key);
            const priceRangeText = site.minPrice !== Infinity
              ? site.minPrice === 0
                ? 'FREE'
                : `${site.currency} ${site.minPrice}${site.minPrice !== site.maxPrice ? ` - ${site.maxPrice}` : ''}`
              : 'No pricing';

            return (
              <div key={site.key} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Site Header - Always Visible, Clickable */}
                <div
                  onClick={() => toggleSite(site.key)}
                  className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 cursor-pointer hover:from-red-100 hover:to-pink-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{isExpanded ? '▼' : '▶'}</div>

                    {/* Site Photo */}
                    {site.photo_url_1 && (
                      <img
                        src={site.photo_url_1}
                        alt={site.siteName}
                        className="w-32 h-24 object-cover rounded-lg shadow-md"
                      />
                    )}

                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div className="col-span-2">
                        <h3 className="font-bold text-gray-900">{site.siteName}</h3>
                        <p className="text-sm text-gray-600">Historical Site</p>

                        {/* Google Rating */}
                        {site.rating && (
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200 mt-1 w-fit">
                            <span className="text-green-700 font-bold text-xs">{Number(site.rating).toFixed(1)}</span>
                            <span className="text-yellow-500 text-xs">⭐</span>
                            {site.user_ratings_total && (
                              <span className="text-gray-600 text-xs">
                                ({site.user_ratings_total})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">📍 {site.city}</p>

                        {/* Google Maps Link */}
                        {site.google_maps_url && (
                          <a
                            href={site.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="block text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline mt-1"
                          >
                            🗺️ Maps
                          </a>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        🗓️ {site.seasons.length} season{site.seasons.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        💶 {priceRangeText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seasons Table - Expandable */}
                {isExpanded && site.seasons.length > 0 && (
                  <div className="border-t">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season / Dates</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adult Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {site.seasons.map((season) => (
                          <tr key={season.pricing_id || season.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{season.seasonName}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(season.startDate)} to {formatDate(season.endDate)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{site.currency} {season.adultPrice}</div>
                              <div className="text-xs text-gray-500">per adult</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className={`text-sm font-bold ${season.childPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                {season.childPrice === 0 ? 'FREE' : `${site.currency} ${season.childPrice}`}
                              </div>
                              <div className="text-xs text-gray-500">6-12 years</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{site.currency} {season.studentPrice}</div>
                              <div className="text-xs text-gray-500">with ID</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs text-gray-600 max-w-xs truncate">
                                {season.notes || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openEditModal(season); }}
                                  className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openDuplicateModal(season); }}
                                  className="text-green-600 hover:text-green-900 font-medium text-xs"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(season); }}
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
                )}
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-orange-900 mb-2">💡 Entrance Fee Pricing Guide:</h4>
          <ul className="text-xs text-orange-800 space-y-1">
            <li>• <strong>Adult Price:</strong> Standard entrance fee for adults (13+ years).</li>
            <li>• <strong>Child Price:</strong> Typically ages 6-12 years. Many sites offer free entry for children under 6.</li>
            <li>• <strong>Student Price:</strong> Valid student ID required. Usually 50% of adult price.</li>
            <li>• <strong>Free Entry:</strong> Some museums offer free entry on specific days or times.</li>
            <li>• <strong>Museum Pass:</strong> Many sites are included in city museum passes (e.g., Istanbul Museum Pass).</li>
            <li>• <strong>Multiple Seasons:</strong> Each site can have different seasonal pricing. Click site name to expand and view all seasons.</li>
            <li>• <strong>UNESCO Sites:</strong> World Heritage Sites may have special pricing or restrictions.</li>
          </ul>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Entrance Fee Season' : modalMode === 'duplicate' ? 'Duplicate Entrance Fee Season' : 'Add New Entrance Fee Season'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Site Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.site_name}
                      onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Topkapi Palace"
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
                      placeholder="e.g., Istanbul"
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

              {/* Pricing */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entrance Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adult Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.adult_price}
                      onChange={(e) => setFormData({ ...formData, adult_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="13+ years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child Price (6-12 years)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.child_price}
                      onChange={(e) => setFormData({ ...formData, child_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="0 for free"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.student_price}
                      onChange={(e) => setFormData({ ...formData, student_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="With valid ID"
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
                  {modalMode === 'edit' ? 'Update Entrance Fee' : 'Create Entrance Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
