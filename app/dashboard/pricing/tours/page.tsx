'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GroupedTour {
  id: number;
  tour_name: string;
  tour_code: string;
  city: string;
  duration_days: number;
  duration_hours?: number;
  duration_type?: string;
  tour_type: string;
  currency: string;
  seasons: any[];
  minPrice: number;
  maxPrice: number;
  photo_url_1?: string;
  rating?: number;
  user_ratings_total?: number;
  google_maps_url?: string;
}

export default function ToursPricing() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCountries, setAvailableCountries] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [expandedTours, setExpandedTours] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    tour_name: '',
    tour_code: '',
    city: '',
    duration_days: 1,
    duration_hours: 8,
    duration_type: 'hours',
    tour_type: 'SIC',
    inclusions: '',
    exclusions: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    sic_price_2_pax: 0,
    sic_price_4_pax: 0,
    sic_price_6_pax: 0,
    sic_price_8_pax: 0,
    sic_price_10_pax: 0,
    pvt_price_2_pax: 0,
    pvt_price_4_pax: 0,
    pvt_price_6_pax: 0,
    pvt_price_8_pax: 0,
    pvt_price_10_pax: 0,
    notes: ''
  });

  useEffect(() => {
    fetchTours();
  }, [selectedCountry, selectedCity]);

  useEffect(() => {
    // Auto-expand all tours by default
    if (tours.length > 0) {
      const tourIds = new Set<number>();
      tours.forEach(t => {
        if (t.id) tourIds.add(t.id);
      });
      setExpandedTours(tourIds);
    }
  }, [tours]);

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCountry !== 'all') params.append('country_id', selectedCountry);
      if (selectedCity !== 'All') params.append('city', selectedCity);

      const response = await fetch(`/api/pricing/tours?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Handle new API response format
        if (result.data) {
          setTours(result.data);
          if (result.filters?.countries) {
            setAvailableCountries(result.filters.countries);
          }
          if (result.filters?.cities) {
            setAvailableCities(result.filters.cities);
          }
        } else {
          // Backward compatibility with old format
          setTours(result);
        }
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTour = (tourId: number) => {
    const newExpanded = new Set(expandedTours);
    if (newExpanded.has(tourId)) {
      newExpanded.delete(tourId);
    } else {
      newExpanded.add(tourId);
    }
    setExpandedTours(newExpanded);
  };


  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedTour(null);
    setFormData({
      tour_name: '',
      tour_code: '',
      city: '',
      duration_days: 1,
      duration_hours: 8,
      duration_type: 'hours',
      tour_type: 'SIC',
      inclusions: '',
      exclusions: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      sic_price_2_pax: 0,
      sic_price_4_pax: 0,
      sic_price_6_pax: 0,
      sic_price_8_pax: 0,
      sic_price_10_pax: 0,
      pvt_price_2_pax: 0,
      pvt_price_4_pax: 0,
      pvt_price_6_pax: 0,
      pvt_price_8_pax: 0,
      pvt_price_10_pax: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (tour: any) => {
    setModalMode('edit');
    setSelectedTour(tour);
    setFormData({
      tour_name: tour.tour_name,
      tour_code: tour.tour_code,
      city: tour.city,
      duration_days: tour.duration_days || 1,
      duration_hours: tour.duration_hours || 8,
      duration_type: tour.duration_type || 'hours',
      tour_type: tour.tour_type,
      inclusions: tour.inclusions || '',
      exclusions: tour.exclusions || '',
      season_name: tour.season_name,
      start_date: formatDateForInput(tour.start_date),
      end_date: formatDateForInput(tour.end_date),
      currency: tour.currency,
      sic_price_2_pax: tour.sic_price_2_pax,
      sic_price_4_pax: tour.sic_price_4_pax,
      sic_price_6_pax: tour.sic_price_6_pax,
      sic_price_8_pax: tour.sic_price_8_pax,
      sic_price_10_pax: tour.sic_price_10_pax,
      pvt_price_2_pax: tour.pvt_price_2_pax,
      pvt_price_4_pax: tour.pvt_price_4_pax,
      pvt_price_6_pax: tour.pvt_price_6_pax,
      pvt_price_8_pax: tour.pvt_price_8_pax,
      pvt_price_10_pax: tour.pvt_price_10_pax,
      notes: tour.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (tour: any) => {
    setModalMode('duplicate');
    setSelectedTour(null);
    setFormData({
      tour_name: tour.tour_name,
      tour_code: tour.tour_code,
      city: tour.city,
      duration_days: tour.duration_days || 1,
      duration_hours: tour.duration_hours || 8,
      duration_type: tour.duration_type || 'hours',
      tour_type: tour.tour_type,
      inclusions: tour.inclusions || '',
      exclusions: tour.exclusions || '',
      season_name: tour.season_name + ' (Copy)',
      start_date: formatDateForInput(tour.start_date),
      end_date: formatDateForInput(tour.end_date),
      currency: tour.currency,
      sic_price_2_pax: tour.sic_price_2_pax,
      sic_price_4_pax: tour.sic_price_4_pax,
      sic_price_6_pax: tour.sic_price_6_pax,
      sic_price_8_pax: tour.sic_price_8_pax,
      sic_price_10_pax: tour.sic_price_10_pax,
      pvt_price_2_pax: tour.pvt_price_2_pax,
      pvt_price_4_pax: tour.pvt_price_4_pax,
      pvt_price_6_pax: tour.pvt_price_6_pax,
      pvt_price_8_pax: tour.pvt_price_8_pax,
      pvt_price_10_pax: tour.pvt_price_10_pax,
      notes: tour.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedTour) {
        // Update existing tour
        const response = await fetch('/api/pricing/tours', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedTour.id,
            pricing_id: selectedTour.pricing_id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Tour updated successfully!');
          setShowModal(false);
          fetchTours();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update tour'}`);
        }
      } else {
        // Create new tour (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/tours', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Tour created successfully!');
          setShowModal(false);
          fetchTours();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create tour'}`);
        }
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('An error occurred while saving the tour');
    }
  };

  const handleDelete = async (tour: any) => {
    if (!confirm(`Are you sure you want to archive ${tour.tour_name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/tours?id=${tour.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Tour archived successfully!');
        fetchTours();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive tour'}`);
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('An error occurred while archiving the tour');
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

  // Group tours by tour ID
  const groupedTours: GroupedTour[] = [];
  const tourMap = new Map<number, GroupedTour>();

  tours.forEach(t => {
    if (!tourMap.has(t.id)) {
      tourMap.set(t.id, {
        id: t.id,
        tour_name: t.tour_name,
        tour_code: t.tour_code,
        city: t.city,
        duration_days: t.duration_days,
        duration_hours: t.duration_hours,
        duration_type: t.duration_type,
        tour_type: t.tour_type,
        currency: t.currency || 'EUR',
        seasons: [],
        minPrice: Infinity,
        maxPrice: -Infinity,
        photo_url_1: t.photo_url_1,
        rating: t.rating,
        user_ratings_total: t.user_ratings_total,
        google_maps_url: t.google_maps_url
      });
    }

    const group = tourMap.get(t.id)!;
    if (t.pricing_id) {
      group.seasons.push(t);
      const price = t.tour_type === 'SIC' ? t.sic_price_2_pax : t.pvt_price_2_pax;
      if (price) {
        group.minPrice = Math.min(group.minPrice, price);
        group.maxPrice = Math.max(group.maxPrice, price);
      }
    }
  });

  tourMap.forEach(value => groupedTours.push(value));

  // Filter grouped tours (only by type since city/country filtering is done server-side)
  const filteredTours = groupedTours.filter(tour => {
    const typeMatch = selectedType === 'All' || tour.tour_type === selectedType;
    return typeMatch;
  });

  const cities = ['All', ...availableCities];
  const tourTypes = ['All', 'SIC', 'PRIVATE'];

  // Calculate stats
  const totalTours = groupedTours.length;
  const sicTours = groupedTours.filter(tour => tour.tour_type === 'SIC').length;
  const privateTours = groupedTours.filter(tour => tour.tour_type === 'PRIVATE').length;
  const activeCities = new Set(groupedTours.map(tour => tour.city)).size;

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
              <h1 className="text-2xl font-bold text-gray-900">Tours Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage SIC and Private tour pricing with group slabs</p>
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
                + Add Tour Season
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('All'); // Reset city when country changes
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                <option value="all">All Countries</option>
                {availableCountries.map((country) => (
                  <option key={country.country_id} value={country.country_id}>
                    {country.flag_emoji} {country.country_name}
                  </option>
                ))}
              </select>
            </div>
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
            <p className="text-2xl font-bold text-gray-900">{totalTours}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">SIC Tours</p>
            <p className="text-2xl font-bold text-green-600">{sicTours}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Private Tours</p>
            <p className="text-2xl font-bold text-blue-600">{privateTours}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Active Cities</p>
            <p className="text-2xl font-bold text-purple-600">{activeCities}</p>
          </div>
        </div>

        {/* Grouped Tours List */}
        <div className="space-y-4">
          {filteredTours.map((tour) => {
            const isExpanded = expandedTours.has(tour.id);
            const priceRangeText = tour.minPrice !== Infinity
              ? `${tour.currency} ${tour.minPrice}${tour.minPrice !== tour.maxPrice ? ` - ${tour.maxPrice}` : ''}`
              : 'No pricing';

            return (
              <div key={tour.id} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Tour Header - Always Visible, Clickable */}
                <div
                  onClick={() => toggleTour(tour.id)}
                  className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 cursor-pointer hover:from-green-100 hover:to-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{isExpanded ? '▼' : '▶'}</div>

                    {/* Tour Photo */}
                    {tour.photo_url_1 && (
                      <img
                        src={tour.photo_url_1}
                        alt={tour.tour_name}
                        className="w-32 h-24 object-cover rounded-lg shadow-md"
                      />
                    )}

                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{tour.tour_name}</h3>
                        <p className="text-sm text-gray-600">{tour.tour_code}</p>

                        {/* Google Rating */}
                        {tour.rating && (
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200 mt-1 w-fit">
                            <span className="text-green-700 font-bold text-xs">{Number(tour.rating).toFixed(1)}</span>
                            <span className="text-yellow-500 text-xs">⭐</span>
                            {tour.user_ratings_total && (
                              <span className="text-gray-600 text-xs">
                                ({tour.user_ratings_total})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">📍 {tour.city}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                          tour.tour_type === 'SIC'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {tour.tour_type}
                        </span>

                        {/* Google Maps Link */}
                        {tour.google_maps_url && (
                          <a
                            href={tour.google_maps_url}
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
                        ⏱️ {tour.duration_hours ? `${tour.duration_hours} hrs` : `${tour.duration_days} Day${tour.duration_days > 1 ? 's' : ''}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        🗓️ {tour.seasons.length} season{tour.seasons.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        💶 {priceRangeText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seasons Table - Expandable */}
                {isExpanded && tour.seasons.length > 0 && (
                  <div className="border-t">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season / Dates</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">2 Pax</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">4 Pax</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">6 Pax</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">8 Pax</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">10 Pax</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tour.seasons.map((season) => {
                          const price2pax = tour.tour_type === 'SIC' ? season.sic_price_2_pax : season.pvt_price_2_pax;
                          const price4pax = tour.tour_type === 'SIC' ? season.sic_price_4_pax : season.pvt_price_4_pax;
                          const price6pax = tour.tour_type === 'SIC' ? season.sic_price_6_pax : season.pvt_price_6_pax;
                          const price8pax = tour.tour_type === 'SIC' ? season.sic_price_8_pax : season.pvt_price_8_pax;
                          const price10pax = tour.tour_type === 'SIC' ? season.sic_price_10_pax : season.pvt_price_10_pax;

                          return (
                            <tr key={season.pricing_id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="text-sm font-medium text-gray-900">{season.season_name}</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(season.start_date)} to {formatDate(season.end_date)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{tour.currency} {price2pax}</div>
                                <div className="text-xs text-gray-500">per person</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{tour.currency} {price4pax}</div>
                                <div className="text-xs text-gray-500">per person</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{tour.currency} {price6pax}</div>
                                <div className="text-xs text-gray-500">per person</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{tour.currency} {price8pax}</div>
                                <div className="text-xs text-gray-500">per person</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{tour.currency} {price10pax}</div>
                                <div className="text-xs text-gray-500">per person</div>
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-green-900 mb-2">💡 Tour Pricing Guide:</h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• <strong>SIC Tours (Seat-in-Coach):</strong> Fixed price per person regardless of group size. Includes guide, transport, and entrance fees.</li>
            <li>• <strong>Private Tours:</strong> Price per person decreases as group size increases. Guide and entrance fees are separate.</li>
            <li>• <strong>Group Slabs:</strong> Use 2-4-6-8-10 pax for easier calculation. Price per person at each slab level.</li>
            <li>• <strong>For odd numbers:</strong> AI will use the next higher slab (e.g., 5 pax uses 6 pax pricing, 7 pax uses 8 pax pricing).</li>
            <li>• <strong>Multiple Seasons:</strong> Each tour can have multiple seasonal pricing (Winter 2025-26, Summer 2026, etc.). Click tour name to expand.</li>
          </ul>
        </div>
      </main>

      {/* Modal (unchanged) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Tour Season' : modalMode === 'duplicate' ? 'Duplicate Tour Season' : 'Add New Tour Season'}
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
              {/* Tour Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tour_name}
                      onChange={(e) => setFormData({ ...formData, tour_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tour_code}
                      onChange={(e) => setFormData({ ...formData, tour_code: e.target.value })}
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
                      Duration (Hours) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.5"
                      step="0.5"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 4 for half-day, 8 for full-day"
                    />
                    <p className="text-xs text-gray-500 mt-1">Examples: 4hrs (half-day), 8hrs (full-day), 2hrs (short tour)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Type *
                    </label>
                    <select
                      required
                      value={formData.tour_type}
                      onChange={(e) => setFormData({ ...formData, tour_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="SIC">SIC (Seat-in-Coach)</option>
                      <option value="PRIVATE">Private Tour</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inclusions/Exclusions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inclusions
                    </label>
                    <textarea
                      value={formData.inclusions}
                      onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="What's included in the tour..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exclusions
                    </label>
                    <textarea
                      value={formData.exclusions}
                      onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="What's not included..."
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

              {/* SIC Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SIC Tour Prices (Per Person)</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      2 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_2_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_2_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      4 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_4_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_4_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      6 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_6_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_6_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      8 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_8_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_8_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      10 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sic_price_10_pax}
                      onChange={(e) => setFormData({ ...formData, sic_price_10_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Private Tour Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Tour Prices (Per Person)</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      2 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_2_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_2_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      4 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_4_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_4_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      6 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_6_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_6_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      8 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_8_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_8_pax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      10 Persons
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pvt_price_10_pax}
                      onChange={(e) => setFormData({ ...formData, pvt_price_10_pax: parseFloat(e.target.value) })}
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
                  {modalMode === 'edit' ? 'Update Tour' : 'Create Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
