'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CityNight {
  city: string;
  nights: number;
  country_id?: number;
  country_name?: string;
}

export default function AIGenerateQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=destinations, 2=preferences, 3=customize (optional), 4=contact, 5=generating
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantsCustomization, setWantsCustomization] = useState(false);

  const [formData, setFormData] = useState({
    total_nights: 7, // Total nights for the trip
    start_date: '',
    adults: 2,
    children: 0,
    hotel_category: '4',
    tour_type: 'PRIVATE',
    special_requests: '',
    // Contact info - collected BEFORE generating
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    // City nights for customization step
    city_nights: [] as CityNight[]
  });

  // Country selection state
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<any[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Hotel/Tour customization state
  const [availableHotels, setAvailableHotels] = useState<any[]>([]);
  const [availableTours, setAvailableTours] = useState<any[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<{[city: string]: number}>({});
  const [selectedTours, setSelectedTours] = useState<number[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        if (response.ok) {
          const data = await response.json();
          setCountries(data.countries || []);
          // Set Turkey as default selected country
          const turkey = data.countries.find((c: any) => c.country_code === 'TR');
          if (turkey) {
            setSelectedCountries([turkey]);
          }
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities based on search
  const fetchCities = async (search: string) => {
    if (search.length < 2) {
      setCitySuggestions([]);
      return;
    }

    setLoadingCities(true);
    try {
      // Include country filter if countries are selected
      // If multiple countries selected, fetch cities from all of them
      const countryIds = selectedCountries.map(c => c.id).join(',');
      const countryParam = countryIds ? `&country_ids=${countryIds}` : '';
      const response = await fetch(`/api/cities?search=${encodeURIComponent(search)}${countryParam}`);
      if (response.ok) {
        const data = await response.json();
        setCitySuggestions(data.cities || []);
      } else {
        console.error('Failed to fetch cities:', response.status, response.statusText);
        setCitySuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCitySuggestions([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setActiveInputIndex(null);
        setCitySuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNext = () => {
    if (step === 1) {
      // Validate destinations
      if (selectedCountries.length === 0) {
        setError('Please select at least one country');
        return;
      }
      if (!formData.total_nights || formData.total_nights < 2) {
        setError('Please enter at least 2 nights for the trip');
        return;
      }
      if (!formData.start_date) {
        setError('Please select a start date');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      // Skip customization for AI-powered flow - go directly to contact info
      setError(null);
      setStep(4);
    } else if (step === 3) {
      // From customization to customer info
      setError(null);
      setStep(4);
    }
  };

  const handleGenerateItinerary = async () => {
    // Validate contact info
    if (!formData.customer_name || !formData.customer_email) {
      setError('Please provide customer name and email address');
      return;
    }

    setLoading(true);
    setError(null);
    setStep(5); // Step 5 is generating

    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);

      // Calculate end date
      const start = new Date(formData.start_date);
      const end = new Date(start);
      end.setDate(start.getDate() + formData.total_nights);
      const endDate = end.toISOString().split('T')[0];

      // Create destination string from selected countries
      const destination = selectedCountries.map(c => c.country_name).join(' & ');

      // Generate itinerary with AI-selected cities
      const response = await fetch(`/api/quotes/${parsedUser.organizationId}/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          destination,
          country_ids: selectedCountries.map(c => c.id),
          total_nights: formData.total_nights,
          start_date: formData.start_date,
          end_date: endDate,
          adults: formData.adults,
          children: formData.children,
          hotel_category: formData.hotel_category,
          tour_type: formData.tour_type,
          special_requests: formData.special_requests
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate itinerary');
      }

      const data = await response.json();

      // Redirect to the full itinerary page using UUID (same as plan-trip flow)
      if (data.uuid) {
        router.push(`/itinerary/${data.uuid}`);
      } else if (data.itinerary_id) {
        // Fallback to numeric ID if UUID not available
        router.push(`/itinerary/${data.itinerary_id}`);
      } else {
        throw new Error('No itinerary ID returned');
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep(4); // Go back to contact form
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI-Powered Quote Generator
          </h1>
          <p className="text-xl text-blue-100">
            Create professional itineraries with hotels, tours, and pricing in seconds
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <div className={`flex items-center gap-1 md:gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Destinations</span>
          </div>
          <div className="h-px w-4 md:w-8 bg-gray-300"></div>
          <div className={`flex items-center gap-1 md:gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Preferences</span>
          </div>
          {wantsCustomization && (
            <>
              <div className="h-px w-4 md:w-8 bg-gray-300"></div>
              <div className={`flex items-center gap-1 md:gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {step > 3 ? '✓' : '3'}
                </div>
                <span className="text-xs md:text-sm font-semibold hidden sm:inline">Customize</span>
              </div>
            </>
          )}
          <div className="h-px w-4 md:w-8 bg-gray-300"></div>
          <div className={`flex items-center gap-1 md:gap-2 ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 4 ? '✓' : (wantsCustomization ? '4' : '3')}
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Customer Info</span>
          </div>
          <div className="h-px w-4 md:w-8 bg-gray-300"></div>
          <div className={`flex items-center gap-1 md:gap-2 ${step >= 5 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 5 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {wantsCustomization ? '5' : '4'}
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Generate</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Destinations */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                {/* Country Selector - Multi-Select */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Countries * (You can select multiple for multi-country trips)
                  </label>
                  {loadingCountries ? (
                    <div className="text-gray-500">Loading countries...</div>
                  ) : (
                    <div className="space-y-3">
                      {countries.map((country) => (
                        <label
                          key={country.id}
                          className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCountries.some(c => c.id === country.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Add country to selection
                                setSelectedCountries(prev => [...prev, country]);
                              } else {
                                // Remove country from selection
                                setSelectedCountries(prev => prev.filter(c => c.id !== country.id));
                              }
                              setCitySuggestions([]);
                            }}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-lg font-medium text-gray-900">
                            {country.flag_emoji} {country.country_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  How long is the customer's trip?
                </h2>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Nights *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={formData.total_nights}
                    onChange={(e) => setFormData({ ...formData, total_nights: parseInt(e.target.value) || 2 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 7"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Total nights: {formData.total_nights} / Total days: {formData.total_nights + 1}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    💡 AI will automatically select the best cities and distribute nights optimally in {selectedCountries.length > 0 ? selectedCountries.map(c => c.country_name).join(', ') : 'the selected countries'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adults *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.adults}
                    onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.children}
                    onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
              >
                Next: Choose Preferences
              </button>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Preferences</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hotel Category *
                    </label>
                    <select
                      required
                      value={formData.hotel_category}
                      onChange={(e) => setFormData(prev => ({ ...prev, hotel_category: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="3">3-Star (Budget)</option>
                      <option value="4">4-Star (Standard)</option>
                      <option value="5">5-Star (Luxury)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tour Type *
                    </label>
                    <select
                      required
                      value={formData.tour_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, tour_type: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PRIVATE">Private Tours (Just your group)</option>
                      <option value="SIC">Group Tours (Join others)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dietary requirements, accessibility needs, special interests..."
                  />
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantsCustomization}
                      onChange={(e) => setWantsCustomization(e.target.checked)}
                      className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        🎯 Customize Hotel & Tour Selection (Advanced)
                      </div>
                      <div className="text-sm text-gray-600">
                        Manually select specific hotels and tours instead of letting AI choose. Perfect when you have customer preferences or want to feature specific properties.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-lg transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
                >
                  Next: Customer Info
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customize Hotels & Tours (Optional) */}
          {step === 3 && wantsCustomization && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Selection</h2>
                <p className="text-gray-600 mb-6">Select specific hotels and tours for this itinerary. Leave unselected to let AI choose.</p>

                {loadingOptions ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading available hotels and tours...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Hotels Section */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">🏨 Hotels ({formData.hotel_category}-star)</h3>
                      {formData.city_nights.filter(cn => cn.city.trim() !== '').map((cityNight) => {
                        const cityHotels = availableHotels.filter(h => h.location === cityNight.city);
                        return (
                          <div key={cityNight.city} className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3">{cityNight.city} ({cityNight.nights} nights)</h4>
                            {cityHotels.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">No hotels available for this city</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-3">
                                {cityHotels.map((hotel) => (
                                  <label
                                    key={hotel.id}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      selectedHotels[cityNight.city] === hotel.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`hotel_${cityNight.city}`}
                                      checked={selectedHotels[cityNight.city] === hotel.id}
                                      onChange={() => setSelectedHotels(prev => ({ ...prev, [cityNight.city]: hotel.id }))}
                                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    {hotel.image_url && (
                                      <img
                                        src={hotel.image_url}
                                        alt={hotel.name}
                                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900">{hotel.name}</div>
                                      {hotel.rating && (
                                        <div className="text-sm text-yellow-600 mt-1">⭐ {hotel.rating}</div>
                                      )}
                                      <div className="text-sm text-gray-600 mt-1">{hotel.description || hotel.notes}</div>
                                      <div className="text-sm font-semibold text-blue-600 mt-2">
                                        ${hotel.price_per_night}/night per person
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tours Section */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">🎫 Tours ({formData.tour_type})</h3>
                      {formData.city_nights.filter(cn => cn.city.trim() !== '').map((cityNight) => {
                        const cityTours = availableTours.filter(t => t.location === cityNight.city);
                        return (
                          <div key={cityNight.city} className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3">{cityNight.city}</h4>
                            {cityTours.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">No tours available for this city</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-3">
                                {cityTours.map((tour) => (
                                  <label
                                    key={tour.id}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      selectedTours.includes(tour.id)
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedTours.includes(tour.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedTours(prev => [...prev, tour.id]);
                                        } else {
                                          setSelectedTours(prev => prev.filter(id => id !== tour.id));
                                        }
                                      }}
                                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    {tour.image_url && (
                                      <img
                                        src={tour.image_url}
                                        alt={tour.name}
                                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900">{tour.name}</div>
                                      {tour.rating && (
                                        <div className="text-sm text-yellow-600 mt-1">⭐ {tour.rating}</div>
                                      )}
                                      <div className="text-sm text-gray-600 mt-1">{tour.description}</div>
                                      <div className="flex gap-4 mt-2 text-sm">
                                        <span className="text-gray-500">⏱️ {tour.duration}</span>
                                        <span className="font-semibold text-green-600">${tour.price_per_person}/person</span>
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> AI will only use the hotels and tours you select above.
                        {Object.keys(selectedHotels).length === 0 && selectedTours.length === 0 && (
                          <span className="ml-1">You haven't selected anything yet - AI will choose from all available options.</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-lg transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
                >
                  Next: Customer Info
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Customer Info */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Information</h2>
                <p className="text-gray-600 mb-6">Enter the customer details for this quote</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customer_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(wantsCustomization ? 3 : 2)}
                  className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-lg transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleGenerateItinerary}
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  ✨ Generate Itinerary
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Generating */}
          {step === 5 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Creating Professional Itinerary...</h3>
              <p className="text-gray-600">
                {wantsCustomization && (Object.keys(selectedHotels).length > 0 || selectedTours.length > 0)
                  ? 'AI is creating an itinerary using your selected hotels and tours'
                  : 'AI is selecting the best hotels, tours, and experiences for your customer'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
