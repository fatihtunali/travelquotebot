'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface CityNight {
  city: string;
  nights: number;
}

export default function PlanTrip() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=destinations, 2=preferences, 3=contact, 4=generating
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    city_nights: [{ city: '', nights: 2 }] as CityNight[],
    start_date: '',
    adults: 2,
    children: 0,
    hotel_category: '4',
    tour_type: 'PRIVATE',
    special_requests: '',
    // Contact info - collected BEFORE generating
    name: '',
    email: '',
    phone: ''
  });

  // Autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Fetch cities based on search
  const fetchCities = async (search: string) => {
    if (search.length < 2) {
      setCitySuggestions([]);
      return;
    }

    setLoadingCities(true);
    try {
      const response = await fetch(`/api/cities?search=${encodeURIComponent(search)}`);
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

  const addCity = () => {
    setFormData(prev => ({
      ...prev,
      city_nights: [...prev.city_nights, { city: '', nights: 2 }]
    }));
  };

  const removeCity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      city_nights: prev.city_nights.filter((_, i) => i !== index)
    }));
  };

  const updateCity = (index: number, field: 'city' | 'nights', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      city_nights: prev.city_nights.map((cn, i) =>
        i === index ? { ...cn, [field]: value } : cn
      )
    }));

    // Trigger autocomplete search when typing city name
    if (field === 'city' && typeof value === 'string') {
      setActiveInputIndex(index);
      fetchCities(value);
    }
  };

  const selectCity = (index: number, cityName: string) => {
    setFormData(prev => ({
      ...prev,
      city_nights: prev.city_nights.map((cn, i) =>
        i === index ? { ...cn, city: cityName } : cn
      )
    }));
    setActiveInputIndex(null);
    setCitySuggestions([]);
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate destinations
      const validCities = formData.city_nights.filter(cn => cn.city.trim() !== '');
      if (validCities.length === 0 || !formData.start_date) {
        setError('Please add at least one destination and select a start date');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      // Move to contact info
      setError(null);
      setStep(3);
    }
  };

  const handleGenerateItinerary = async () => {
    // Validate contact info
    if (!formData.name || !formData.email) {
      setError('Please provide your name and email address');
      return;
    }

    setLoading(true);
    setError(null);
    setStep(4); // Step 4 is generating

    try {
      const validCities = formData.city_nights.filter(cn => cn.city.trim() !== '');

      // Generate itinerary with contact info
      const response = await fetch('/api/itinerary/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_nights: validCities,
          start_date: formData.start_date,
          adults: formData.adults,
          children: formData.children,
          hotel_category: formData.hotel_category,
          tour_type: formData.tour_type,
          special_requests: formData.special_requests,
          // Include contact info
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate itinerary');
      }

      const data = await response.json();

      // Redirect to the unique itinerary page
      if (data.itinerary_id) {
        router.push(`/itinerary/${data.itinerary_id}`);
      } else {
        throw new Error('No itinerary ID returned');
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep(3); // Go back to contact form
    } finally {
      setLoading(false);
    }
  };

  const totalNights = formData.city_nights.reduce((sum, cn) => sum + (cn.nights || 0), 0);
  const totalDays = totalNights + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Logo size="sm" variant="dark" />
            </Link>
            <Link href="/login">
              <button type="button" className="text-sm text-gray-600 hover:text-gray-900">
                Operator Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Plan Your Perfect Trip to Turkey
          </h1>
          <p className="text-xl text-blue-100">
            Discover Istanbul, Cappadocia, Ephesus & more - We'll create your personalized Turkey itinerary
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Destinations</span>
          </div>
          <div className="h-px w-8 md:w-12 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Preferences</span>
          </div>
          <div className="h-px w-8 md:w-12 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 3 ? '✓' : '3'}
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Contact</span>
          </div>
          <div className="h-px w-8 md:w-12 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Itinerary</span>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Which cities in Turkey do you want to visit?</h2>

                {/* Labels for the first row */}
                {formData.city_nights.length > 0 && (
                  <div className="flex gap-4 mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700">
                        City / Destination *
                      </label>
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-semibold text-gray-700">
                        Nights *
                      </label>
                    </div>
                    {formData.city_nights.length > 1 && (
                      <div style={{ width: '88px' }}></div>
                    )}
                  </div>
                )}

                {formData.city_nights.map((cityNight, index) => (
                  <div key={index} className="flex gap-4 mb-4">
                    <div className="flex-1 relative" ref={activeInputIndex === index ? autocompleteRef : null}>
                      <input
                        type="text"
                        required
                        value={cityNight.city}
                        onChange={(e) => updateCity(index, 'city', e.target.value)}
                        onFocus={() => {
                          setActiveInputIndex(index);
                          if (cityNight.city.length >= 2) {
                            fetchCities(cityNight.city);
                          }
                        }}
                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Istanbul, Cappadocia, Antalya..."
                        autoComplete="off"
                        title="Start typing to see city suggestions from our database"
                      />

                      {/* Autocomplete Dropdown */}
                      {activeInputIndex === index && citySuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {citySuggestions.map((city, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectCity(index, city)}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Loading indicator */}
                      {activeInputIndex === index && loadingCities && (
                        <div className="absolute right-3 top-3.5">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                        </div>
                      )}
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        required
                        min="1"
                        value={cityNight.nights}
                        onChange={(e) => updateCity(index, 'nights', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="2"
                      />
                    </div>
                    {formData.city_nights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCity(index)}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCity}
                  className="mt-3 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                >
                  + Add Another City
                </button>

                {totalNights > 0 && (
                  <p className="mt-3 text-sm text-gray-600">
                    Total: {totalNights} nights / {totalDays} days
                  </p>
                )}
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
                Next: Choose Your Preferences
              </button>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Travel Preferences</h2>

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
                  Next: Enter Contact Info
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Contact Information</h2>
                <p className="text-gray-600 mb-6">We'll use this to send you your personalized itinerary</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
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
                  onClick={handleGenerateItinerary}
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  ✨ Generate My Itinerary
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Generating */}
          {step === 4 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Perfect Turkey Itinerary...</h3>
              <p className="text-gray-600">Our AI is selecting the best hotels, tours, and experiences across Turkey for you</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
