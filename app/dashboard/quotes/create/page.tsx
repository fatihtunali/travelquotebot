'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
  flag_emoji: string;
  currency_code: string;
}

interface City {
  city: string;
  country_name: string;
  country_code: string;
  flag_emoji: string;
}

interface CityNight {
  city: string;
  nights: number;
}

export default function CreateQuotePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Countries and cities
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    start_date: '',
    end_date: '',
    adults: 2,
    children: 0,
    hotel_category: 4,
    tour_type: 'PRIVATE',
    special_requests: ''
  });

  // City nights
  const [cityNights, setCityNights] = useState<CityNight[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [nights, setNights] = useState(2);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data.countries || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (countryId: number) => {
    setLoadingCities(true);
    try {
      const response = await fetch(`/api/cities?country_id=${countryId}`);
      const data = await response.json();
      setCities(data.citiesWithInfo || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const addCityNight = () => {
    if (!selectedCity || nights < 1) return;

    // Check if city already exists
    const existingIndex = cityNights.findIndex(cn => cn.city === selectedCity);
    if (existingIndex >= 0) {
      // Update existing
      const updated = [...cityNights];
      updated[existingIndex].nights += nights;
      setCityNights(updated);
    } else {
      // Add new
      setCityNights([...cityNights, { city: selectedCity, nights }]);
    }

    setSelectedCity('');
    setNights(2);
  };

  const removeCityNight = (index: number) => {
    setCityNights(cityNights.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cityNights.length === 0) {
      alert('Please add at least one city');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const destination = cityNights.map(cn => `${cn.city} (${cn.nights}N)`).join(' → ');

    try {
      // Create the quote
      const createResponse = await fetch(`/api/quotes/${parsedUser.organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          destination: destination,
          start_date: formData.start_date,
          end_date: formData.end_date,
          adults: formData.adults,
          children: formData.children,
          total_price: 0 // Will be calculated later
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        alert(error.error || 'Failed to create quote');
        return;
      }

      const createData = await createResponse.json();

      alert(`Quote ${createData.quoteNumber} created successfully!`);
      router.push(`/dashboard/quotes/${createData.quoteId}`);

    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  const totalNights = cityNights.reduce((sum, cn) => sum + cn.nights, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Manual Quote</h1>
        <p className="text-gray-600">Build a custom travel quote by selecting country, cities, and trip details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Select Country */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Select Country
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {countries.map(country => (
              <button
                key={country.id}
                type="button"
                onClick={() => {
                  setSelectedCountry(country.id);
                  setCityNights([]); // Reset cities when country changes
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedCountry === country.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-1">{country.flag_emoji}</div>
                <div className="font-semibold text-gray-900">{country.country_name}</div>
                <div className="text-sm text-gray-500">{country.currency_code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Cities */}
        {selectedCountry && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Add Cities & Nights
            </h2>

            {loadingCities ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-4">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a city...</option>
                    {cities.map(city => (
                      <option key={city.city} value={city.city}>
                        {city.city}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={nights}
                    onChange={(e) => setNights(parseInt(e.target.value) || 1)}
                    min="1"
                    max="30"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nights"
                  />

                  <button
                    type="button"
                    onClick={addCityNight}
                    disabled={!selectedCity}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* City nights list */}
                {cityNights.length > 0 && (
                  <div className="space-y-2">
                    {cityNights.map((cn, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{cn.city}</span>
                          <span className="text-gray-500 ml-2">({cn.nights} night{cn.nights > 1 ? 's' : ''})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCityNight(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <div className="text-right text-sm text-gray-600 mt-2">
                      Total: <strong>{totalNights} nights</strong>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Customer & Trip Details */}
        {cityNights.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Customer & Trip Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 555 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adults *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                <input
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => setFormData({...formData, children: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Category</label>
                <select
                  value={formData.hotel_category}
                  onChange={(e) => setFormData({...formData, hotel_category: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={3}>3 Star</option>
                  <option value={4}>4 Star</option>
                  <option value={5}>5 Star</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tour Type</label>
                <select
                  value={formData.tour_type}
                  onChange={(e) => setFormData({...formData, tour_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="SIC">SIC (Shared)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                  value={formData.special_requests}
                  onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {cityNights.length > 0 && (
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                'Create Quote'
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
