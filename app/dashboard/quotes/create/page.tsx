'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ItineraryBuilder, { QuoteData, CityNight } from '@/components/itinerary/ItineraryBuilder';

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

export default function CreateQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'builder'>('setup');
  const [loading, setLoading] = useState(true);

  // Countries and cities
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // City nights
  const [cityNights, setCityNights] = useState<CityNight[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [nights, setNights] = useState(2);

  // Basic form data
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    start_date: '',
    adults: 2,
    children: 0
  });

  // Quote data for ItineraryBuilder
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch cities when countries change
  useEffect(() => {
    if (selectedCountries.length > 0) {
      fetchCities(selectedCountries.map(c => c.id));
    } else {
      setCities([]);
    }
  }, [selectedCountries]);

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

  const fetchCities = async (countryIds: number[]) => {
    setLoadingCities(true);
    try {
      const response = await fetch(`/api/cities?country_ids=${countryIds.join(',')}`);
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

    const existingIndex = cityNights.findIndex(cn => cn.city === selectedCity);
    if (existingIndex >= 0) {
      const updated = [...cityNights];
      updated[existingIndex].nights += nights;
      setCityNights(updated);
    } else {
      setCityNights([...cityNights, { city: selectedCity, nights }]);
    }

    setSelectedCity('');
    setNights(2);
  };

  const removeCityNight = (index: number) => {
    setCityNights(cityNights.filter((_, i) => i !== index));
  };

  const totalNights = cityNights.reduce((sum, cn) => sum + cn.nights, 0);

  const calculateEndDate = () => {
    if (!formData.start_date || totalNights === 0) return '';
    const start = new Date(formData.start_date);
    const end = new Date(start);
    end.setDate(start.getDate() + totalNights);
    return end.toISOString().split('T')[0];
  };

  const handleProceedToBuilder = () => {
    if (cityNights.length === 0) {
      alert('Please add at least one city');
      return;
    }
    if (!formData.customer_name || !formData.customer_email) {
      alert('Please fill in customer name and email');
      return;
    }
    if (!formData.start_date) {
      alert('Please select a start date');
      return;
    }

    const countryNames = selectedCountries.map(c => c.country_name).join(' & ');
    const cityList = cityNights.map(cn => `${cn.city} (${cn.nights}N)`).join(' → ');
    const destination = countryNames ? `${countryNames}: ${cityList}` : cityList;

    // Create quote data for ItineraryBuilder
    setQuoteData({
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      destination,
      city_nights: cityNights,
      start_date: formData.start_date,
      end_date: calculateEndDate(),
      adults: formData.adults,
      children: formData.children,
      total_price: 0,
      itinerary: {
        days: [],
        pricing_summary: {
          hotels_total: 0,
          tours_total: 0,
          vehicles_total: 0,
          guides_total: 0,
          entrance_fees_total: 0,
          meals_total: 0,
          extras_total: 0,
          subtotal: 0,
          discount: 0,
          total: 0
        }
      }
    });

    setStep('builder');
  };

  const handleSave = async (data: QuoteData) => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    try {
      // Create the quote
      const createResponse = await fetch(`/api/quotes/${parsedUser.organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          destination: data.destination,
          start_date: data.start_date,
          end_date: data.end_date,
          adults: data.adults,
          children: data.children,
          total_price: data.total_price
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        alert(error.error || 'Failed to create quote');
        return;
      }

      const createData = await createResponse.json();
      const quoteId = createData.quoteId;

      // Update with itinerary
      const updateResponse = await fetch(`/api/quotes/${parsedUser.organizationId}/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itinerary: data.itinerary
        })
      });

      if (!updateResponse.ok) {
        alert('Quote created but failed to save itinerary');
        return;
      }

      alert(`Quote ${createData.quoteNumber} created successfully!`);
      router.push(`/dashboard/quotes/${quoteId}`);

    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote');
    }
  };

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

  // Show ItineraryBuilder when ready
  if (step === 'builder' && quoteData) {
    return (
      <div>
        <ItineraryBuilder
          mode="edit"
          initialData={quoteData}
          onSave={handleSave}
        />
      </div>
    );
  }

  // Setup step - country/city selection
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Quote</h1>
        <p className="text-gray-600">Select destinations and customer details to start building your itinerary</p>
      </div>

      <div className="space-y-6">
        {/* Countries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Select Countries</h2>
          <p className="text-sm text-gray-600 mb-4">You can select multiple countries for multi-country trips</p>

          <div className="space-y-3">
            {countries.map(country => (
              <label
                key={country.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCountries.some(c => c.id === country.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.some(c => c.id === country.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCountries([...selectedCountries, country]);
                    } else {
                      setSelectedCountries(selectedCountries.filter(c => c.id !== country.id));
                    }
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {country.flag_emoji} {country.country_name}
                </span>
                <span className="ml-auto text-sm text-gray-500">{country.currency_code}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cities */}
        {selectedCountries.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Add Cities & Nights</h2>

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
                        {city.city} ({city.country_name})
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
                      Total: <strong>{totalNights} nights</strong> ({totalNights + 1} days)
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Customer & Trip Details */}
        {cityNights.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Customer & Trip Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              type="button"
              onClick={handleProceedToBuilder}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              Continue to Build Itinerary
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
