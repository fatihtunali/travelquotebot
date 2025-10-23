'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface CityNight {
  city: string;
  nights: number;
}

export default function PlanTrip() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=destinations, 2=preferences, 3=generating
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
    // Contact info - collected AFTER they see the itinerary
    name: '',
    email: '',
    phone: ''
  });

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
    }
  };

  const handleGenerateItinerary = async () => {
    setLoading(true);
    setError(null);
    setStep(3);

    try {
      const validCities = formData.city_nights.filter(cn => cn.city.trim() !== '');

      // Store in sessionStorage temporarily (will ask for contact info after they see it)
      sessionStorage.setItem('trip_preferences', JSON.stringify({
        city_nights: validCities,
        start_date: formData.start_date,
        adults: formData.adults,
        children: formData.children,
        hotel_category: formData.hotel_category,
        tour_type: formData.tour_type,
        special_requests: formData.special_requests
      }));

      // Generate itinerary anonymously first
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
          special_requests: formData.special_requests
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate itinerary');
      }

      const data = await response.json();

      // Store the generated itinerary and redirect to preview
      sessionStorage.setItem('generated_itinerary', JSON.stringify(data));
      router.push('/itinerary-preview');

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep(2);
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
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-blue-100">
            Tell us where you want to go, and we'll create a personalized itinerary
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="text-sm font-semibold hidden sm:inline">Destinations</span>
          </div>
          <div className="h-px w-12 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className="text-sm font-semibold hidden sm:inline">Preferences</span>
          </div>
          <div className="h-px w-12 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-semibold hidden sm:inline">Itinerary</span>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Where do you want to go?</h2>

                {formData.city_nights.map((cityNight, index) => (
                  <div key={index} className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={cityNight.city}
                        onChange={(e) => updateCity(index, 'city', e.target.value)}
                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City name (e.g., Istanbul, Cappadocia)"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        required
                        min="1"
                        value={cityNight.nights}
                        onChange={(e) => updateCity(index, 'nights', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nights"
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
                  onClick={handleGenerateItinerary}
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  Generate My Itinerary
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 3 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Perfect Itinerary...</h3>
              <p className="text-gray-600">Our AI is selecting the best hotels, tours, and experiences for you</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
