'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Constants
const SEARCH_DEBOUNCE_MS = 500;
const PAGINATION_PAGE_SIZE = 50;

// Type definitions
interface HotelPricing {
  pricing_id: number;
  season_name: string;
  start_date: string;
  end_date: string;
  currency: string;
  double_room_bb: number;
  single_supplement_bb: number;
  triple_room_bb: number;
  child_0_6_bb: number;
  child_6_12_bb: number;
  base_meal_plan: 'BB' | 'HB' | 'FB' | 'AI';
  hb_supplement: number;
  fb_supplement: number;
  ai_supplement: number;
  notes: string;
  status: 'active' | 'archived';
}

interface Hotel {
  id: number;
  hotel_name: string;
  city: string;
  star_rating: number;
  currency: string;
  photo_url_1?: string;
  rating?: number;
  user_ratings_total?: number;
  google_maps_url?: string;
  // Pricing fields (when hotel has pricing data)
  pricing_id?: number;
  season_name?: string;
  start_date?: string;
  end_date?: string;
  double_room_bb?: number;
  single_supplement_bb?: number;
  triple_room_bb?: number;
  child_0_6_bb?: number;
  child_6_12_bb?: number;
  base_meal_plan?: string;
  hb_supplement?: number;
  fb_supplement?: number;
  ai_supplement?: number;
  notes?: string;
  status?: string;
}

interface PaginatedResponse {
  data: Hotel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    cities: string[];
  };
}

interface GroupedHotel {
  id: number;
  hotel_name: string;
  city: string;
  star_rating: number;
  currency: string;
  seasons: Hotel[];
  minPrice: number;
  maxPrice: number;
  photo_url_1?: string;
  rating?: number;
  user_ratings_total?: number;
  google_maps_url?: string;
}

export default function HotelsPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [expandedHotels, setExpandedHotels] = useState<Set<number>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [pageSize] = useState(PAGINATION_PAGE_SIZE);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // AbortController ref for canceling previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [formData, setFormData] = useState({
    hotel_name: '',
    city: '',
    star_rating: 3,
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    double_room_bb: 0,
    single_supplement_bb: 0,
    triple_room_bb: 0,
    child_0_6_bb: 0,
    child_6_12_bb: 0,
    base_meal_plan: 'BB',
    hb_supplement: 0,
    fb_supplement: 0,
    ai_supplement: 0,
    notes: ''
  });

  useEffect(() => {
    fetchHotels();
  }, [currentPage, debouncedSearchQuery, selectedCity]);

  const fetchHotels = async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Track if component is still mounted
    let isMounted = true;

    try {
      if (isMounted) {
        setLoading(true);
      }

      const token = localStorage.getItem('token');

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (selectedCity !== 'All') params.append('city', selectedCity);

      const response = await fetch(`/api/pricing/hotels?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: abortController.signal
      });

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          alert('Session expired. Please log in again.');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PaginatedResponse = await response.json();

      if (isMounted) {
        setHotels(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalHotels(result.pagination?.total || 0);

        // Update available cities from API response
        if (result.filters?.cities) {
          setAvailableCities(result.filters.cities);
        }

        // Auto-expand all hotels by default
        const allHotelIds = new Set<number>((result.data || []).map((h) => h.id));
        setExpandedHotels(allHotelIds);
      }
    } catch (error) {
      // Don't show error for aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Error fetching hotels:', error);

      if (isMounted) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert('Failed to load hotels. Please try again.');
        }
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  };

  const toggleHotel = (hotelId: number) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(hotelId)) {
      newExpanded.delete(hotelId);
    } else {
      newExpanded.add(hotelId);
    }
    setExpandedHotels(newExpanded);
  };

  // Helper function to reset all filters
  const resetFilters = () => {
    setSelectedCity('All');
    setSelectedSeason('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedHotel(null);
    setFormData({
      hotel_name: '',
      city: '',
      star_rating: 3,
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      double_room_bb: 0,
      single_supplement_bb: 0,
      triple_room_bb: 0,
      child_0_6_bb: 0,
      child_6_12_bb: 0,
      base_meal_plan: 'BB',
      hb_supplement: 0,
      fb_supplement: 0,
      ai_supplement: 0,
      notes: ''
    });
    setShowModal(true);
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

  const openEditModal = (hotel: Hotel) => {
    setModalMode('edit');
    setSelectedHotel(hotel);
    setFormData({
      hotel_name: hotel.hotel_name || '',
      city: hotel.city || '',
      star_rating: hotel.star_rating || 3,
      season_name: hotel.season_name || '',
      start_date: formatDateForInput(hotel.start_date || ''),
      end_date: formatDateForInput(hotel.end_date || ''),
      currency: hotel.currency || 'EUR',
      double_room_bb: hotel.double_room_bb || 0,
      single_supplement_bb: hotel.single_supplement_bb || 0,
      triple_room_bb: hotel.triple_room_bb || 0,
      child_0_6_bb: hotel.child_0_6_bb || 0,
      child_6_12_bb: hotel.child_6_12_bb || 0,
      base_meal_plan: hotel.base_meal_plan || 'BB',
      hb_supplement: hotel.hb_supplement || 0,
      fb_supplement: hotel.fb_supplement || 0,
      ai_supplement: hotel.ai_supplement || 0,
      notes: hotel.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (hotel: Hotel) => {
    setModalMode('duplicate');
    setSelectedHotel(null);
    setFormData({
      hotel_name: hotel.hotel_name || '',
      city: hotel.city || '',
      star_rating: hotel.star_rating || 3,
      season_name: (hotel.season_name || '') + ' (Copy)',
      start_date: formatDateForInput(hotel.start_date || ''),
      end_date: formatDateForInput(hotel.end_date || ''),
      currency: hotel.currency || 'EUR',
      double_room_bb: hotel.double_room_bb || 0,
      single_supplement_bb: hotel.single_supplement_bb || 0,
      triple_room_bb: hotel.triple_room_bb || 0,
      child_0_6_bb: hotel.child_0_6_bb || 0,
      child_6_12_bb: hotel.child_6_12_bb || 0,
      base_meal_plan: hotel.base_meal_plan || 'BB',
      hb_supplement: hotel.hb_supplement || 0,
      fb_supplement: hotel.fb_supplement || 0,
      ai_supplement: hotel.ai_supplement || 0,
      notes: hotel.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (startDate >= endDate) {
      alert('Error: Start date must be before end date.');
      return;
    }

    // Validate prices are non-negative
    const priceFields = [
      { value: formData.double_room_bb, name: 'Double Room BB' },
      { value: formData.single_supplement_bb, name: 'Single Supplement BB' },
      { value: formData.triple_room_bb, name: 'Triple Room BB' },
      { value: formData.child_0_6_bb, name: 'Child 0-6 BB' },
      { value: formData.child_6_12_bb, name: 'Child 6-12 BB' },
      { value: formData.hb_supplement, name: 'HB Supplement' },
      { value: formData.fb_supplement, name: 'FB Supplement' },
      { value: formData.ai_supplement, name: 'AI Supplement' },
    ];

    for (const field of priceFields) {
      if (field.value < 0) {
        alert(`Error: ${field.name} cannot be negative.`);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedHotel) {
        // Update existing hotel
        const response = await fetch('/api/pricing/hotels', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedHotel.id,
            pricing_id: selectedHotel.pricing_id,
            ...formData
          })
        });

        if (response.ok) {
          alert('Hotel updated successfully!');
          setShowModal(false);
          fetchHotels();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update hotel'}`);
        }
      } else {
        // Create new hotel (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/hotels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Hotel created successfully!');
          setShowModal(false);
          fetchHotels();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create hotel'}`);
        }
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('An error occurred while saving the hotel');
    }
  };

  const handleDelete = async (hotel: Hotel) => {
    if (!confirm(`Are you sure you want to archive this season: ${hotel.season_name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/hotels?id=${hotel.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Season archived successfully!');
        fetchHotels();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive season'}`);
      }
    } catch (error) {
      console.error('Error deleting season:', error);
      alert('An error occurred while archiving the season');
    }
  };

  // Helper function to format date as DD/MM/YYYY
  const formatDate = (dateInput: string | Date | undefined) => {
    if (!dateInput) return '';

    // Handle Date objects and strings
    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // If it's already an ISO string with time, parse directly
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } else {
        // If it's a date string (YYYY-MM-DD), add time to avoid timezone issues
        date = new Date(dateInput + 'T00:00:00');
      }
    } else {
      return '';
    }

    // Check for invalid date
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Group hotels by hotel ID
  const groupedHotels: GroupedHotel[] = [];
  const hotelMap = new Map<number, GroupedHotel>();

  hotels.forEach(h => {
    if (!hotelMap.has(h.id)) {
      hotelMap.set(h.id, {
        id: h.id,
        hotel_name: h.hotel_name,
        city: h.city,
        star_rating: h.star_rating,
        currency: h.currency || 'EUR',
        seasons: [],
        minPrice: Infinity,
        maxPrice: -Infinity,
        photo_url_1: h.photo_url_1,
        rating: h.rating,
        user_ratings_total: h.user_ratings_total,
        google_maps_url: h.google_maps_url
      });
    }

    const group = hotelMap.get(h.id)!;
    if (h.pricing_id) {
      group.seasons.push(h);
      if (h.double_room_bb) {
        group.minPrice = Math.min(group.minPrice, h.double_room_bb);
        group.maxPrice = Math.max(group.maxPrice, h.double_room_bb);
      }
    }
  });

  hotelMap.forEach(group => {
    groupedHotels.push(group);
  });

  // Filter by season only (city and search are handled server-side)
  const filteredHotels = groupedHotels.filter(hotel => {
    const seasonMatch = selectedSeason === 'All' || hotel.seasons.some(s => s.season_name === selectedSeason);
    return seasonMatch && hotel.seasons.length > 0;
  });

  // Calculate stats from real data
  const uniqueHotels = groupedHotels.length;
  const activeSeasons = hotels.filter(h => h.pricing_id).length;
  const uniqueCities = new Set(hotels.map(h => h.city)).size;

  const prices = hotels
    .filter((h): h is Hotel & { double_room_bb: number } => typeof h.double_room_bb === 'number')
    .map(h => h.double_room_bb);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const currency = hotels.length > 0 && hotels[0].currency ? hotels[0].currency : 'EUR';
  const priceRange = prices.length > 0 ? `${currency}${minPrice}-${maxPrice}` : 'N/A';

  // Use cities from API response (all cities for the organization)
  const cities = ['All', ...availableCities];
  const seasons = ['All', ...Array.from(new Set(hotels.map(h => h.season_name).filter(Boolean)))];

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
                type="button"
                onClick={() => router.push('/dashboard/pricing')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
              >
                ← Back to Pricing
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Hotels Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage hotel rates by season with meal plans</p>
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
                + Add Hotel Season
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search Hotels (All Pages)</label>
              <input
                type="text"
                placeholder="Search by hotel name or city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
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
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
              >
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
            <p className="text-2xl font-bold text-gray-900">{totalHotels}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Active Seasons</p>
            <p className="text-2xl font-bold text-green-600">{activeSeasons}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities</p>
            <p className="text-2xl font-bold text-blue-600">{uniqueCities}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Avg Price Range</p>
            <p className="text-2xl font-bold text-purple-600">{priceRange}</p>
          </div>
        </div>

        {/* Grouped Hotels List */}
        <div className="space-y-4">
          {filteredHotels.map((hotel) => {
            const isExpanded = expandedHotels.has(hotel.id);
            const priceRangeText = hotel.minPrice !== Infinity
              ? `${hotel.currency}${hotel.minPrice}-${hotel.maxPrice}`
              : 'No pricing';

            return (
              <div key={hotel.id} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Hotel Header - Always Visible */}
                <div
                  onClick={() => toggleHotel(hotel.id)}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">
                        {isExpanded ? '▼' : '▶'}
                      </div>

                      {/* Hotel Photo */}
                      {hotel.photo_url_1 && (
                        <img
                          src={hotel.photo_url_1}
                          alt={hotel.hotel_name}
                          className="w-32 h-24 object-cover rounded-lg shadow-md"
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{hotel.hotel_name}</h3>
                          <span className="text-yellow-600 text-sm">{'⭐'.repeat(hotel.star_rating)}</span>

                          {/* Google Rating */}
                          {hotel.rating && (
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                              <span className="text-green-700 font-bold text-sm">{Number(hotel.rating).toFixed(1)}</span>
                              <span className="text-yellow-500 text-xs">⭐</span>
                              {hotel.user_ratings_total && (
                                <span className="text-gray-600 text-xs">
                                  ({hotel.user_ratings_total})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-6 text-sm text-gray-600">
                          <div className="font-medium">📍 {hotel.city}</div>
                          <div>🗓️ <strong>{hotel.seasons.length}</strong> season{hotel.seasons.length !== 1 ? 's' : ''}</div>
                          <div>💶 <strong>{priceRangeText}</strong> per person</div>

                          {/* Google Maps Link */}
                          {hotel.google_maps_url && (
                            <a
                              href={hotel.google_maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              🗺️ Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Click to {isExpanded ? 'collapse' : 'expand'}
                    </div>
                  </div>
                </div>

                {/* Seasons Table - Expandable */}
                {isExpanded && hotel.seasons.length > 0 && (
                  <div className="border-t">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season / Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Double BB</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Single Supp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triple BB</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Plans</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {hotel.seasons.map((season) => (
                          <tr key={season.pricing_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{season.season_name}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(season.start_date)} to {formatDate(season.end_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{season.currency} {season.double_room_bb}</div>
                              <div className="text-xs text-gray-500">per person</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{season.currency} {season.single_supplement_bb}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{season.currency} {season.triple_room_bb}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-600">
                                <div>0-6y: {season.currency} {season.child_0_6_bb}</div>
                                <div>6-12y: {season.currency} {season.child_6_12_bb}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs">
                                <div className="font-semibold text-blue-600">Base: {season.base_meal_plan}</div>
                                {(season.hb_supplement ?? 0) > 0 && (
                                  <div className="text-gray-600">HB: +{season.currency}{season.hb_supplement}</div>
                                )}
                                {(season.fb_supplement ?? 0) > 0 && (
                                  <div className="text-gray-600">FB: +{season.currency}{season.fb_supplement}</div>
                                )}
                                {(season.ai_supplement ?? 0) > 0 && (
                                  <div className="text-gray-600">AI: +{season.currency}{season.ai_supplement}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(season)}
                                  className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDuplicateModal(season)}
                                  className="text-green-600 hover:text-green-900 font-medium text-xs"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(season)}
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

                {/* No Seasons Message */}
                {isExpanded && hotel.seasons.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No active seasons for this hotel. Click "+ Add Hotel Season" to add pricing.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredHotels.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-4xl mb-4">🏨</div>
            <p className="text-gray-500">No hotels found matching your filters.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <span className="text-xs text-gray-500">
                ({totalHotels} total hotels)
              </span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Tips:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Each hotel can have multiple seasons (Summer, Winter, Shoulder, etc.) with different pricing.</li>
            <li>• Click on a hotel to expand/collapse and view all its seasonal pricing.</li>
            <li>• Base price is always with Breakfast (BB). Other meal plans are supplements.</li>
            <li>• Use "Duplicate" to quickly create a new season based on existing pricing.</li>
            <li>• Archiving a season removes it from active pricing but keeps it for historical records.</li>
          </ul>
        </div>
      </main>

      {/* Modal - Same as before */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Hotel Season' : modalMode === 'duplicate' ? 'Duplicate Hotel Season' : 'Add New Hotel Season'}
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
              {/* Hotel Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hotel_name}
                      onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
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
                      Star Rating *
                    </label>
                    <select
                      required
                      value={formData.star_rating}
                      onChange={(e) => setFormData({ ...formData, star_rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <option key={star} value={star}>{star} Star</option>
                      ))}
                    </select>
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

              {/* Room Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Prices (Base Breakfast - Per Person)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per Person in a Double Room BB *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.double_room_bb}
                      onChange={(e) => setFormData({ ...formData, double_room_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Single Room Supplement BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.single_supplement_bb}
                      onChange={(e) => setFormData({ ...formData, single_supplement_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per Person in a Triple Room BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.triple_room_bb}
                      onChange={(e) => setFormData({ ...formData, triple_room_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 45"
                    />
                  </div>
                </div>
              </div>

              {/* Child Prices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Children Prices (Per Child)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per Child 0-6 years BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.child_0_6_bb}
                      onChange={(e) => setFormData({ ...formData, child_0_6_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 0 or 15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per Child 6-12 years BB
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.child_6_12_bb}
                      onChange={(e) => setFormData({ ...formData, child_6_12_bb: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>
              </div>

              {/* Meal Plan Supplements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Plan Supplements (Per Person Per Night)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Meal Plan *
                    </label>
                    <select
                      required
                      value={formData.base_meal_plan}
                      onChange={(e) => setFormData({ ...formData, base_meal_plan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="BB">BB (Bed & Breakfast)</option>
                      <option value="HB">HB (Half Board)</option>
                      <option value="FB">FB (Full Board)</option>
                      <option value="AI">AI (All Inclusive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HB Supplement (per person/night)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hb_supplement}
                      onChange={(e) => setFormData({ ...formData, hb_supplement: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FB Supplement (per person/night)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fb_supplement}
                      onChange={(e) => setFormData({ ...formData, fb_supplement: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Supplement (per person/night)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ai_supplement}
                      onChange={(e) => setFormData({ ...formData, ai_supplement: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 25"
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
                  {modalMode === 'edit' ? 'Update Season' : 'Create Season'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
